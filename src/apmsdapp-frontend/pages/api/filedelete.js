const fs = require("fs-extra");
import { IncomingForm } from "formidable";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req, res) => {
  const data = await new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.parse(req, (err, fields) => {
      if (err) return reject(err);
      resolve({ fields });
    });
  });
  try {
    const s3Client = new S3Client({});
    const paperHash = data.fields.paperHash;
    const paperName = data.fields.paperName;
    const conferenceListPDA = data.fields.conferenceListPDA;
    const conferenceId = data.fields.conferenceId;

    if (data.fields.responseLetterHash) {
      const responseLetterHash = data.fields.responseLetterHash;
      const responseLetterName = data.fields.responseLetterName;

      const deleteCommand = new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${conferenceListPDA}/${conferenceId}/${responseLetterHash}/${responseLetterName}`,
      });

      await s3Client.send(deleteCommand);
    }

    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${conferenceListPDA}/${conferenceId}/${paperHash}/${paperName}`,
    });

    await s3Client.send(deleteCommand);

    res.status(200).json({ message: "file deleted!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
    return;
  }
};
