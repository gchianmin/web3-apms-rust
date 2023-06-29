import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

export default async (req, res) => {

  try {
    await sendgrid.send({
      to: req.body.email, 
      from: "apms.organiser@gmail.com", 
      templateId: "d-eeb43d0162df428c8e87fd29858c115c",
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
