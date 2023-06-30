import { prisma } from "../../lib/prisma";

export default async (req, res) => {
  try {
    if (req.body.role == "reviewer") {
      const paperWithAcceptedInvitation = await prisma.Reviewer.findMany({
        where: {
          reviewer_email: req.body.reviewerEmail,
          invitation_sent: 1,
          acceptance: 1,
          role: "reviewer",
        },

      });
  
      return res.status(200).json(paperWithAcceptedInvitation);
    } else if (req.body.role == "chair") {
      const paperWithAcceptedInvitation = await prisma.Reviewer.findMany({
        where: {
          reviewer_email: req.body.reviewerEmail,
          invitation_sent: 1,
          acceptance: 1,
          role: "chair",
        },
      });

      return res.status(200).json(paperWithAcceptedInvitation);
    }
  } catch (error) {
    console.log(error);
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};
