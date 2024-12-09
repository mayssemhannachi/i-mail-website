import { NextApiRequest, NextApiResponse } from "next";
import { db } from 'src/server/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = await db.chatbotInteraction.groupBy({
      by: ["day"],
      _sum: {
        count: true,
      },
      orderBy: {
        day: "asc",
      },
    });

    const formattedData = data.map((item) => ({
      day: item.day,
      interactions: item._sum.count ?? 0,
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error fetching chart data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
}
