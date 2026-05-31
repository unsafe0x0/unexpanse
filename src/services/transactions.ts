import { prisma } from "@/lib/prisma";
import { TransactionInput } from "@/validators/transaction";
import { cache } from "react";

export interface TransactionQueryParams {
  type?: "INCOME" | "EXPENSE";
  categoryId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: "date" | "amount";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export async function createTransactionForUser(
  userId: string,
  data: TransactionInput,
  options?: { includeCategory?: boolean },
) {
  return prisma.transaction.create({
    data: {
      userId,
      type: data.type,
      amount: data.amount,
      description: data.description,
      categoryId: data.categoryId || null,
      note: data.note || null,
      paymentMethod: data.paymentMethod || null,
      date: new Date(data.date),
      tags: data.tags || [],
    },
    include: options?.includeCategory ? { category: true } : undefined,
  });
}

export async function updateTransactionForUser(
  userId: string,
  id: string,
  data: TransactionInput,
) {
  return prisma.transaction.updateMany({
    where: { id, userId },
    data: {
      type: data.type,
      amount: data.amount,
      description: data.description,
      categoryId: data.categoryId || null,
      note: data.note || null,
      paymentMethod: data.paymentMethod || null,
      date: new Date(data.date),
      tags: data.tags || [],
    },
  });
}

export async function deleteTransactionForUser(userId: string, id: string) {
  return prisma.transaction.deleteMany({
    where: { id, userId },
  });
}

export async function deleteTransactionsForUser(userId: string, ids: string[]) {
  return prisma.transaction.deleteMany({
    where: { id: { in: ids }, userId },
  });
}

export async function getTransactionsForUser(
  userId: string,
  params?: TransactionQueryParams,
) {
  const where: Record<string, unknown> = { userId };

  if (params?.type) where.type = params.type;
  if (params?.categoryId) where.categoryId = params.categoryId;
  if (params?.search) {
    where.description = { contains: params.search, mode: "insensitive" };
  }
  if (params?.startDate || params?.endDate) {
    where.date = {
      ...(params.startDate && { gte: new Date(params.startDate) }),
      ...(params.endDate && { lte: new Date(params.endDate) }),
    };
  }

  const query: Parameters<typeof prisma.transaction.findMany>[0] = {
    where,
    include: { category: true },
    orderBy: {
      [params?.sortBy ?? "date"]: params?.sortOrder ?? "desc",
    },
  };

  if (params?.limit !== undefined) query.take = params.limit;
  if (params?.offset !== undefined) query.skip = params.offset;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany(query),
    prisma.transaction.count({ where }),
  ]);

  return { transactions, total };
}

export const getDashboardStatsForUser = cache(async (userId: string) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [thisMonthTx, lastMonthTx, recentTx, userDb] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startOfMonth },
      },
    }),
    prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    }),
    prisma.transaction.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: "desc" },
      take: 10,
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { currency: true },
    }),
  ]);

  const calcTotals = (txs: typeof thisMonthTx) => ({
    income: txs
      .filter((t) => t.type === "INCOME")
      .reduce((s, t) => s + t.amount, 0),
    expense: txs
      .filter((t) => t.type === "EXPENSE")
      .reduce((s, t) => s + t.amount, 0),
  });

  const current = calcTotals(thisMonthTx);
  const last = calcTotals(lastMonthTx);

  const changePercent = (curr: number, prev: number) =>
    prev === 0 ? 0 : ((curr - prev) / prev) * 100;

  const [allTimeIncome, allTimeExpense] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, type: "INCOME" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: "EXPENSE" },
      _sum: { amount: true },
    }),
  ]);

  return {
    income: current.income,
    expense: current.expense,
    balance:
      (allTimeIncome._sum.amount || 0) - (allTimeExpense._sum.amount || 0),
    monthlyBalance: current.income - current.expense,
    savingsRate:
      current.income > 0
        ? Math.round(
            ((current.income - current.expense) / current.income) * 100,
          )
        : 0,
    incomeChange: changePercent(current.income, last.income),
    expenseChange: changePercent(current.expense, last.expense),
    recentTransactions: recentTx,
    currency: userDb?.currency || "INR",
  };
});
