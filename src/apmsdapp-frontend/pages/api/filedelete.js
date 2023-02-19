const fs = require("fs-extra");
import { IncomingForm } from "formidable";

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
      resolve({ fields});
    });
  });
  try {
    console.log(data)
    const paperId = data.fields.paperId
    const conferenceListPDA = data.fields.conferenceListPDA
    const conferenceId = data.fields.conferenceId
    const pathToDeletePaper = `public/files/${conferenceListPDA}/${conferenceId}/${paperId}/`;
    fs.remove(pathToDeletePaper, (err) => {
      if (err) return console.error(err);
      console.log("success!"); 
    });
    res.status(200).json({ message: "file deleted!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
    return;
  }
};
