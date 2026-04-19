import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

function getBearerToken(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth) return null;
  const [type, token] = auth.split(" ");
  if (type?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

export async function GET(req: Request) {
  const token = getBearerToken(req);
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const secret = process.env.AUTH_SECRET;
  if (!secret)
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 },
    );

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
      {
        issuer: "expanse-tracker-nextjs",
        audience: "expanse-tracker-app",
      },
    );

    const userId = payload.sub;
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: "desc" },
    });

    let categories = await prisma.category.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });

    if (categories.length === 0) {
      const { DEFAULT_CATEGORIES } = await import("@/lib/constants");
      await prisma.category.createMany({
        data: DEFAULT_CATEGORIES.map((cat) => ({
          userId,
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          isDefault: true,
        })),
      });
      categories = await prisma.category.findMany({
        where: { userId },
        orderBy: { name: "asc" },
      });
    }

    const budgets = await prisma.budget.findMany({
      where: { userId },
      include: { category: true },
    });

    let income = 0;
    let expense = 0;

    // Simplistic all-time stats
    transactions.forEach((t) => {
      if (t.type === "INCOME") income += t.amount;
      else if (t.type === "EXPENSE") expense += t.amount;
    });

    const balance = income - expense;
    const savingsRate =
      income > 0 ? Math.round(((income - expense) / income) * 100) : 0;

    return NextResponse.json({
      transactions,
      categories,
      budgets,
      stats: {
        balance,
        income,
        expense,
        savingsRate: Math.max(0, savingsRate),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
