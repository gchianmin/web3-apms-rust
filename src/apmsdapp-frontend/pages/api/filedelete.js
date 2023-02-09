const fs = require("fs-extra");

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req, res) => {
  try {
    const pathToDeletePaper = `public/files/EJ2KoVBXzhLE8XefxwSQ21zWNTGxuVvDxjG2D7DpcySC/FiqBvKGUzEuCJ4qp8YjdqRL8o3fTXvvsRotRJjYcgJY/969e9f7f1f336a6309cd66080502c15d/`;
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
