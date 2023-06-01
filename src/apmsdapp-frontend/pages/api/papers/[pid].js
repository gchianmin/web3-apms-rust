import { PrismaClient } from "@prisma/client";

export default async (req, res) => {
  const prisma = new PrismaClient();
  try {
    const { pid } = req.query;
    const reviewerList = await prisma.Reviewer.findMany({
        where: {
          paper_id: pid,
        },
      })
      return res.status(200).json(JSON.stringify(reviewerList));
    // res.end(`Post1: ${JSON.stringify(reviewerList)}`);
  } catch (error) {
    console.log(error);
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};