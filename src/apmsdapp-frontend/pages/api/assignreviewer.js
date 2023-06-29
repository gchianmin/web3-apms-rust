import sendgrid from "@sendgrid/mail";
import { prisma } from '../../lib/prisma'

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

export default async (req, res) => {
  try {
    if (req.body) {
      const reviewerWithInvitationSent = await prisma.Reviewer.findMany({
        where: {
          paper_id : req.body.paperId,
          invitation_sent: 1,
          acceptance: 0,
          role: "reviewer",
        },
      });

      const chairWithInvitationSent = await prisma.Reviewer.findMany({
        where: {
          paper_id : req.body.paperId,
          invitation_sent: 1,
          acceptance: 0,
          role: "chair",
        },
      });
  

      const exisintgReviewerEmails = new Set(
        reviewerWithInvitationSent.map((item) => item.reviewer_email)
      );
  
      const newReviewer = req.body.paperReviewers.filter(
        (item) => !exisintgReviewerEmails.has(item.tpcEmail)
      );

      

      const exisintgChairEmails = new Set(
        chairWithInvitationSent.map((item) => item.reviewer_email)
      );


      const newChair = [req.body.paperChair].filter(
        (item) => !exisintgChairEmails.has(item.tpcEmail)
      );
  

      if (newReviewer.length > 0) {
        const reviewerData = newReviewer.map((reviewer) => ({
          id: Buffer.from(
            req.body.paperId + reviewer.tpcEmail + "reviewer"
          ).toString("base64"),
          conference_pda: req.body.conferencePda,
          conference_id: req.body.conferenceId,
          conference_name: req.body.conferenceName,
          paper_id: req.body.paperId,
          paper_title: req.body.paperTitle,
          reviewer_email: reviewer.tpcEmail,
          reviewer_name: reviewer.tpcName,
          invitation_sent: req.body.invitationSent,
          invitation_exp: req.body.acceptanceDeadline,
          acceptance: req.body.acceptance,
          role: "reviewer",
          organiser_email: req.body.organiserEmail,
        }));

        const createMany = await prisma.Reviewer.createMany({
          data: [...reviewerData],
          skipDuplicates: true,
        });

        await sendgrid.send([
          {
            from: "apms.organiser@gmail.com",
            templateId: "d-719c738077394b288d754c7762a9faca",
            personalizations: newReviewer.map((reviewer) => ({
              to: reviewer.tpcEmail,
              dynamicTemplateData: {
                name: reviewer.tpcName,
                conferenceName: req.body.conferenceName,
                id: req.body.paperId,
                title: req.body.paperTitle,
                abstract: req.body.paperAbstract,
                authors: req.body.paperAuthors,
                deadline: req.body.acceptanceDeadline,
                organiserEmail: req.body.organiserEmail,
                acceptancelink: Buffer.from(
                  JSON.stringify({
                    paperid: req.body.paperId,
                    email: reviewer.tpcEmail,
                    name: reviewer.tpcName,
                    role: "reviewer",
                  })
                ).toString("base64"),
                declinelink: Buffer.from(
                  JSON.stringify({
                    paperid: req.body.paperId,
                    email: reviewer.tpcEmail,
                    name: reviewer.tpcName,
                    role: "reviewer",
                  })
                ).toString("base64"),
              },
            })),
          },
        ]);
      }

      if (newChair.length > 0) {
        const createMany = await prisma.Reviewer.createMany({
          data: [
            {
              id: Buffer.from(
                req.body.paperId + newChair[0].tpcEmail + "chair"
              ).toString("base64"),
              conference_pda: req.body.conferencePda,
              conference_id: req.body.conferenceId,
              conference_name: req.body.conferenceName,
              paper_id: req.body.paperId,
              paper_title: req.body.paperTitle,
              reviewer_email: newChair[0].tpcEmail,
              reviewer_name: newChair[0].tpcName,
              invitation_sent: req.body.invitationSent,
              invitation_exp: req.body.acceptanceDeadline,
              acceptance: req.body.acceptance,
              role: "chair",
              organiser_email: req.body.organiserEmail,
            },
          ],
          skipDuplicates: true,
        });

        await sendgrid.send([
          {
            from: "apms.organiser@gmail.com",
            templateId: "d-0d8ae56e159b4d6d95fb4219e0f5d056",
            to: newChair[0].tpcEmail,
            dynamicTemplateData: {
              name: newChair[0].tpcName,
              conferenceName: req.body.conferenceName,
              id: req.body.paperId,
              title: req.body.paperTitle,
              abstract: req.body.paperAbstract,
              authors: req.body.paperAuthors,
              deadline: req.body.acceptanceDeadline,
              organiserEmail: req.body.organiserEmail,
              acceptancelink: Buffer.from(
                JSON.stringify({
                  paperid: req.body.paperId,
                  email: newChair[0].tpcEmail,
                  name: newChair[0].tpcName,
                  role: "chair",
                })
              ).toString("base64"),
              declinelink: Buffer.from(
                JSON.stringify({
                  paperid: req.body.paperId,
                  email: newChair[0].tpcEmail,
                  name: newChair[0].tpcEmail,
                  role: "chair",
                })
              ).toString("base64"),
            },
          },
        ]);
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
  console.log("email sent successfully");
  return res.status(200).json({ error: "" });
};
