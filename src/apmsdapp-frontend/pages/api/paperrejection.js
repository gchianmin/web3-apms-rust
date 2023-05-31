import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

export default async (req, res) => {

  try {
    console.log(req.body)
    console.log(req.body.email)
    await sendgrid.send({
      to: req.body.email, 
      from: "apms.organiser@gmail.com", 
      templateId: "d-833255e011b74d1184ffcd75b47c6874",
      dynamicTemplateData: {
        name: req.body.name,
        conferenceName: req.body.conferenceName,
        id: req.body.id,
        title: req.body.title,
        abstract: req.body.abstract,
        authors: req.body.authors,
        feedback: req.body.feedback
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
  console.log("email sent successfully")
  return res.status(200).json({ error: "" });
};
