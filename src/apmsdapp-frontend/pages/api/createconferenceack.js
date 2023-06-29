import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

export default async (req, res) => {
  try { 
    await sendgrid.send({
      to: req.body.organiserEmail,
      from: "apms.organiser@gmail.com",
      templateId: "d-44a9078379ac45d78c0046e9e6d0b110",
      dynamicTemplateData: {
        organiserName: req.body.organiserName,
        conferenceName: req.body.conferenceName,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
  console.log("email sent successfully");
  return res.status(200).json({ error: "" });
};
