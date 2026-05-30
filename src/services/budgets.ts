import { prisma } from "@/lib/prisma";
import { getCacheKey, withCache } from "@/lib/cache";

export async function getBudgetsForUser(userId: string) {
  const key = getCacheKey("budgets", userId);
  return withCache(key, () => getBudgetsForUserImpl(userId));
}

async function getBudgetsForUserImpl(userId: string) {
  const now = new Date();
  return prisma.budget.findMany({
    where: {
      userId,
      OR: [
        { month: null },
        { month: now.getMonth() + 1, year: now.getFullYear() },
      ],
    },
    include: { category: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function createBudgetForUser(
  userId: string,
  data: { name: string; amount: number; categoryId?: string; period: string },
) {
  const now = new Date();
  return prisma.budget.create({
    data: {
      userId,
      name: data.name,
      amount: data.amount,
      categoryId: data.categoryId || null,
      period: data.period,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    },
  });
}

export async function updateBudgetForUser(
  userId: string,
  id: string,
  data: { name: string; amount: number; categoryId?: string; period: string },
) {
  return prisma.budget.updateMany({
    where: { id, userId },
    data: {
      name: data.name,
      amount: data.amount,
      categoryId: data.categoryId || null,
      period: data.period,
    },
  });
}

export async function deleteBudgetForUser(userId: string, id: string) {
  return prisma.budget.deleteMany({
    where: { id, userId },
  });
}

export async function getBudgetSpendingForUser(
  userId: string,
  budgets: Array<{ id: string; categoryId: string | null }>,
) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const spending: Record<string, number> = {};

  for (const budget of budgets) {
    const where = {
      userId,
      type: "EXPENSE" as const,
      date: { gte: startOfMonth },
      ...(budget.categoryId && { categoryId: budget.categoryId }),
    };

    const result = await prisma.transaction.aggregate({
      where,
      _sum: { amount: true },
    });

    spending[budget.id] = result._sum.amount ?? 0;
  }

  return spending;
}
