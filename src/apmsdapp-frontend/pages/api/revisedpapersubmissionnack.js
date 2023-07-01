import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

export default async (req, res) => {
console.log(req.body)
  try {
    await sendgrid.send({
      to: req.body.email, 
      from: "apms.organiser@gmail.com", 
      templateId: "d-f166251406c149bcb5cc1543ae7a037b",
      dynamicTemplateData: {
        name: req.body.name,
        conferenceName: req.body.conferenceName,
        id: req.body.id,
        title: req.body.title,
        authors: req.body.authors,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
  console.log("email sent successfully")
  return res.status(200).json({ error: "" });
};
