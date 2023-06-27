import { IncomingForm } from "formidable";
const fs = require("fs-extra");
const CryptoJS = require("crypto-js");
const crypto = require("crypto");
import path from "path";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  HeadObjectCommandInput,
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
    console.log(conferencePDA, conferenceId, hash, fileName);
    console.log("buc", process.env.S3_BUCKET_NAME)
    const s3Client = new S3Client({});
    const response = await s3Client.send(
      new HeadObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${conferencePDA}/${conferenceId}/${hash}/${fileName}`,
      })
    );
    return true;
  } catch (error) {
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
    // console.log("greger", data.files.file);

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
          const entropy = generateEntropy();
          // console.log(entropy);
          // console.log("isit ths for letter", letterHash);
          const pathToWritePaper = `public/files/${props.conferencePDA}/${props.conferenceId}/${letterHash}/`;

          if (fs.pathExistsSync(pathToWritePaper)) {
            res
              .status(409)
              .json({ message: "Same file already exists in the system!" });
            return;
          }
          fs.mkdirsSync(pathToWritePaper);
          const fullPathToWritePaper =
            pathToWritePaper + `${letter.originalFilename}`;
          await fs.writeFile(fullPathToWritePaper, file);
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
        Bucket: process.env.BUCKET_NAME,
        Key: `${props.conferencePDA}/${props.conferenceId}/${hash}/${paper.originalFilename}`,
        Body: createReadStream(paperPath),
      });

      // const pathToWritePaper = path.join(process.cwd(), `public/files/${props.conferencePDA}/${props.conferenceId}/${hash}/` )
      // // const pathToWritePaper = `public/files/${props.conferencePDA}/${props.conferenceId}/${hash}/`;
      // console.log("vsdvsdv", pathToWritePaper)
      // if (fs.pathExistsSync(pathToWritePaper)) {
      //   res
      //     .status(409)
      //     .json({ message: "Same file already exists in the system!" });
      //   return;
      // }
      // fs.mkdirsSync(pathToWritePaper);
      // const fullPathToWritePaper =
      //   pathToWritePaper + `${paper.originalFilename}`;
      // await fs.writeFile(fullPathToWritePaper, file);

      const response = await checkIfFileExist(
        props.conferencePDA,
        props.conferenceId,
        hash,
        paper.originalFilename
      );
      console.log("yeww", response);

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