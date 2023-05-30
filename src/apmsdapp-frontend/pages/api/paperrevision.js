import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

export default async (req, res) => {

  try {
    console.log(req.body)
    console.log(req.body.email)
    await sendgrid.send({
      to: req.body.email, 
      from: "apms.organiser@gmail.com", 
      templateId: "d-f6fc09b6ed1444c18cd08cc4b38cf96c",
      dynamicTemplateData: {
        name: req.body.name,
        conferenceName: req.body.conferenceName,
        id: req.body.id,
        title: req.body.title,
        abstract: req.body.abstract,
        authors: req.body.authors,
        feedback: req.body.feedback,
        revision: req.body.revision
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
  console.log("email sent successfully")
  return res.status(200).json({ error: "" });
};
