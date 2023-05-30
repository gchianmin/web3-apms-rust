import sendgrid from "@sendgrid/mail";
import { PrismaClient } from "@prisma/client";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

export default async (req, res) => {
  const prisma = new PrismaClient();

  try {
    const reviewer = await prisma.Reviewer.update({
      where: {
        id: Buffer.from(req.body.id + req.body.reviewerEmail).toString(
          "base64"
        ),
      },
      data: { acceptance: 1 },
    });

    if (reviewer) {
      await sendgrid.send({
        to: req.body.reviewerEmail,
        from: "apms.organiser@gmail.com",
        templateId: "d-98181d82cbf14898a2f67a554e319ec4",
        dynamicTemplateData: {
          name: req.body.name,
          conferenceName: req.body.conferenceName,
          id: req.body.id,
          title: req.body.title,
          // "abstract": "sample abstract",
          // "authors" : "A1,A2",
          deadline: req.body.deadline,
          organiserEmail: req.body.organiserEmail,
        },
      });

      await sendgrid.send({
        to: req.body.organiserEmail,
        from: "apms.organiser@gmail.com",
        templateId: "d-76a32a50e2af40e0b8172cc7271dc458",
        dynamicTemplateData: {
          reviewerName: req.body.name,
          conferenceName: req.body.conferenceName,
          id: req.body.id,
          title: req.body.title,
          // "abstract": "sample abstract",
          // "authors" : "A1,A2",
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
