import sendgrid from "@sendgrid/mail";
import { prisma } from "../../lib/prisma";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

export default async (req, res) => {
  try {
    const reviewer = await prisma.Reviewer.update({
      where: {
        id: Buffer.from(req.body.id + req.body.reviewerEmail + req.body.role).toString(
          "base64"
        ),
      },
      data: { acceptance: 2 },
    });

    if (reviewer) {
      await sendgrid.send({
        to: req.body.reviewerEmail,
        from: "apms.organiser@gmail.com",
        templateId: "d-a81c6a7568ef47a38a7b3cdb2ee8e933",
        dynamicTemplateData: {
          name: req.body.name,
          conferenceName: req.body.conferenceName,
          id: req.body.id,
          title: req.body.title,
          organiserEmail: req.body.organiserEmail,
        },
      });

      await sendgrid.send({
        to: req.body.organiserEmail,
        from: "apms.organiser@gmail.com",
        templateId: "d-96ef9f52f44a4cac83829b154a8a7680",
        dynamicTemplateData: {
          reviewerName: req.body.name,
          conferenceName: req.body.conferenceName,
          id: req.body.id,
          title: req.body.title,
          reviewerEmail: req.body.reviewerEmail,
        },
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
  console.log("email sent successfully");
  return res.status(200).json({ error: "" });
};
