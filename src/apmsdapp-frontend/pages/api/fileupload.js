import { IncomingForm } from "formidable";
const fs = require("fs-extra");
const CryptoJS = require("crypto-js");
const crypto = require('crypto');

export const config = {
  api: {
    bodyParser: false,
  },
};


const generateEntropy = () => {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = crypto.randomBytes(5);
  let result = '';

  for (let i = 0; i < 5; i++) {
    const index = bytes[i] % characters.length;
    result += characters[index];
  }

  return result;
}


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
      const props = JSON.parse(data.fields.props)
      const paper = data.files.file;
      const paperPath = paper.filepath;
      const file = await fs.readFile(paperPath);
      const hash = CryptoJS.MD5(file.toString()).toString();
      const entropy = generateEntropy()
      console.log(entropy)
      console.log("isit ths",hash);
      const pathToWritePaper = `public/files/${props.conferenceList}/${props.conferencePDA}/${hash}/`;
      
      if (fs.pathExistsSync(pathToWritePaper)) {
        res.status(409).json({ message: "Same file already exists in the system!" });
        return;
      }
      fs.mkdirsSync(pathToWritePaper);
      const fullPathToWritePaper =
        pathToWritePaper + `${paper.originalFilename}`;
      await fs.writeFile(fullPathToWritePaper, file);
      res.status(200).json({ message: "file uploaded!", hash: hash, fileName: paper.originalFilename, entropy: entropy});
    } catch (error) {
      res.status(500).json({ message: error.message });
      return;
    }
  }
};
