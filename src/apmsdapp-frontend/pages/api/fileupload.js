import { IncomingForm } from "formidable";
const fs = require("fs-extra");
const CryptoJS = require("crypto-js");
const crypto = require("crypto");
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { createReadStream } from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

const generateEntropy = () => {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = crypto.randomBytes(5);
  let result = "";

  for (let i = 0; i < 5; i++) {
    const index = bytes[i] % characters.length;
    result += characters[index];
  }

  return result;
};

const checkIfFileExist = async (
  conferencePDA,
  conferenceId,
  hash,
  fileName
) => {
  try {
    const s3Client = new S3Client({});
    await s3Client.send(
      new HeadObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${conferencePDA}/${conferenceId}/${hash}/${fileName}`,
      })
    );
    return true;
  } catch (error) {
    console.log(error)
    if (error.$metadata.httpStatusCode === 404) return false;
  }
};
export default async (req, res) => {
  if (req.method === "POST") {
    // parse form with a Promise wrapper
    const data = await new Promise((resolve, reject) => {
      const form = new IncomingForm();
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });


    try {
      const s3Client = new S3Client({});
      const props = JSON.parse(data.fields.props);
      var letterHash = "";
      var letterName = "";
      if (data.files.responseLetter) {
        try {
          const letter = data.files.responseLetter;
          letterName = letter.originalFilename;
          const letterPath = letter.filepath;
          const file = await fs.readFile(letterPath);
          letterHash = CryptoJS.MD5(file.toString()).toString();

          const uploadCommand = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `${props.conferencePDA}/${props.conferenceId}/${letterHash}/${letter.originalFilename}`,
            Body: createReadStream(letterPath),
          });
    
          const response = await checkIfFileExist(
            props.conferencePDA,
            props.conferenceId,
            letterHash,
            letter.originalFilename
          );
    
          if (response === true) {
            res
              .status(409)
              .json({ message: "Same file already exists in the system!" });
            return;
          }
          
          await s3Client.send(uploadCommand);

        } catch (error) {
          console.error("error from response letter", error);
          res.status(500).json({ message: error.message });
          return;
        }
      }

      const paper = data.files.file;
      const paperPath = paper.filepath;
      const file = await fs.readFile(paperPath);
      const hash = CryptoJS.MD5(file.toString()).toString();
      const entropy = generateEntropy();

      const uploadCommand = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${props.conferencePDA}/${props.conferenceId}/${hash}/${paper.originalFilename}`,
        Body: createReadStream(paperPath),
      });

      const response = await checkIfFileExist(
        props.conferencePDA,
        props.conferenceId,
        hash,
        paper.originalFilename
      );

      if (response === true) {
        res
          .status(409)
          .json({ message: "Same file already exists in the system!" });
        return;
      }
      
      await s3Client.send(uploadCommand);
      res.status(200).json({
        message: "file uploaded!",
        hash: hash,
        responseLetterHash: letterHash,
        fileName: paper.originalFilename,
        responseLetterName: letterName,
        entropy: entropy,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
      return;
    }
  }
};