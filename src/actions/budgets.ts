"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getBudgets() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const now = new Date();
  return prisma.budget.findMany({
    where: {
      userId: session.user.id,
      OR: [
        { month: null },
        { month: now.getMonth() + 1, year: now.getFullYear() },
      ],
    },
    include: { category: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function createBudget(data: {
  name: string;
  amount: number;
  categoryId?: string;
  period: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const now = new Date();

  await prisma.budget.create({
    data: {
      userId: session.user.id,
      name: data.name,
      amount: data.amount,
      categoryId: data.categoryId || null,
      period: data.period,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    },
  });

  revalidatePath("/dashboard/budgets");
  return { success: true };
}

export async function updateBudget(id: string, data: {
  name: string;
  amount: number;
  categoryId?: string;
  period: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await prisma.budget.updateMany({
    where: { id, userId: session.user.id },
    data: { 
      name: data.name, 
      amount: data.amount,
      categoryId: data.categoryId || null,
      period: data.period
    },
  });

  revalidatePath("/dashboard/budgets");
  return { success: true };
}

export async function deleteBudget(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await prisma.budget.deleteMany({ where: { id, userId: session.user.id } });
  revalidatePath("/dashboard/budgets");
  return { success: true };
}

export async function getBudgetSpending(budgets: Array<{ id: string; categoryId: string | null }>) {
  const session = await auth();
  if (!session?.user?.id) return {};

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const spending: Record<string, number> = {};

  for (const budget of budgets) {
    const where = {
      userId: session.user.id,
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
