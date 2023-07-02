import { prisma } from "../../../lib/prisma";

export default async (req, res) => {
  try {
    const { pid } = req.query;
    const reviewerList = await prisma.Reviewer.findMany({
        where: {
          paper_id: pid,
        },
      })
      return res.status(200).json(JSON.stringify(reviewerList));
  } catch (error) {
    console.log(error);
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};
