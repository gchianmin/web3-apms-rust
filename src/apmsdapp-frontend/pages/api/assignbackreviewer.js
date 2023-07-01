import sendgrid from "@sendgrid/mail";
import { prisma } from "../../lib/prisma";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

export default async (req, res) => {
  try {
    const d = new Date();
    d.setDate(d.getDate() + 5);

    const findEmail = await prisma.Reviewer.findMany({
      where: {
        paper_id: req.body.prevPaperId,
        invitation_sent: 1,
        acceptance: 1,
        role: "chair",
      },
      select: {
        organiser_email: true,
      },
    });
    const organiserEmail = findEmail[0].organiser_email

    // conferencePDA: props.conferencePDA,
    // conferenceId: props.conferenceId,
    // conferenceName: props.conferenceName,
    // prevPaperId: prevPaper.paperId,
    // paperId: data.entropy,
    // title: paper.title,
    // reviewer: prevPaper.reviewer,
    // chair: prevPaper.paperChair

    const reviewerData = req.body.reviewer.map((reviewer) => ({
      id: Buffer.from(
        req.body.paperId + reviewer.tpcEmail + "reviewer"
      ).toString("base64"),
      conference_pda: req.body.conferencePda,
      conference_id: req.body.conferenceId,
      conference_name: req.body.conferenceName,
      paper_id: req.body.paperId,
      paper_title: req.body.title,
      reviewer_email: reviewer.tpcEmail,
      reviewer_name: reviewer.tpcName,
      invitation_sent: 1,
      invitation_exp: new Date(),
      acceptance: 1,
      role: "reviewer",
      organiser_email: organiserEmail,
    }));

    const createMany = await prisma.Reviewer.createMany({
      data: [...reviewerData],
      skipDuplicates: true,
    });

    await sendgrid.send([
      {
        from: "apms.organiser@gmail.com",
        templateId: "d-81847af7c0c6449b83cb853cd589b197",
        personalizations: req.body.reviewer.map((reviewer) => ({
          to: reviewer.tpcEmail,
          dynamicTemplateData: {
            name: reviewer.tpcName,
            conferenceName: req.body.conferenceName,
            id: req.body.paperId,
            title: req.body.title,
            abstract: req.body.abstract,
            authors: req.body.authors,
            organiserEmail: organiserEmail,
            deadline: d,
          },
        })),
      },
    ]);

    const createChair = await prisma.Reviewer.createMany({
      data: [
        {
          id: Buffer.from(
            req.body.paperId + req.body.chair.tpcEmail + "chair"
          ).toString("base64"),
          conference_pda: req.body.conferencePda,
          conference_id: req.body.conferenceId,
          conference_name: req.body.conferenceName,
          paper_id: req.body.paperId,
          paper_title: req.body.title,
          reviewer_email: req.body.chair.tpcEmail,
          reviewer_name: req.body.chair.tpcName,
          invitation_sent: 1,
          invitation_exp: new Date(),
          acceptance: 1,
          role: "chair",
          organiser_email: organiserEmail,
        },
      ],
      skipDuplicates: true,
    });

    await sendgrid.send([
      {
        from: "apms.organiser@gmail.com",
        templateId: "d-81847af7c0c6449b83cb853cd589b197",
        to: req.body.chair.tpcEmail,
        dynamicTemplateData: {
          name: req.body.chair.tpcName,
          conferenceName: req.body.conferenceName,
          id: req.body.paperId,
          title: req.body.title,
          abstract: req.body.abstract,
          authors: req.body.authors,
          deadline: d,
          organiserEmail: organiserEmail,
        },
      },
    ]);
  } catch (error) {
    console.log(error);
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
  console.log("email sent successfully");
  return res.status(200).json({ error: "" });
};
