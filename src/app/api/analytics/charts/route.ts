import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDateRange, getMonthName } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { start, end } = getDateRange("year");

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      date: { gte: start, lte: end },
    },
    include: { category: true },
    orderBy: { date: "asc" },
  });

  // Monthly aggregation
  const monthlyMap: Record<string, { month: string; income: number; expense: number }> = {};
  transactions.forEach((tx) => {
    const d = new Date(tx.date);
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth();
    const key = `${year}-${String(month + 1).padStart(2, "0")}`;
    const monthName = getMonthName(month + 1).slice(0, 3);
    
    if (!monthlyMap[key]) monthlyMap[key] = { month: monthName, income: 0, expense: 0 };
    if (tx.type === "INCOME") monthlyMap[key].income += tx.amount;
    else monthlyMap[key].expense += tx.amount;
  });

  // Category aggregation
  const categoryMap: Record<string, { name: string; value: number; color: string }> = {};
  transactions
    .filter((tx) => tx.type === "EXPENSE" && tx.category)
    .forEach((tx) => {
      const catId = tx.category!.id;
      if (!categoryMap[catId]) {
        categoryMap[catId] = {
          name: tx.category!.name,
          value: 0,
          color: tx.category!.color,
        };
      }
      categoryMap[catId].value += tx.amount;
    });

  return NextResponse.json({
    monthly: Object.values(monthlyMap),
    byCategory: Object.values(categoryMap).sort((a, b) => b.value - a.value).slice(0, 8),
  });
}
