"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const TransactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.number().positive(),
  description: z.string().min(1, "Description is required").max(500),
  categoryId: z.string().optional(),
  note: z.string().max(1000).optional(),
  paymentMethod: z.string().max(100).optional(),
  date: z.string().refine((d) => !isNaN(Date.parse(d)), { message: "Invalid date" }),
  tags: z.array(z.string()).optional(),
});

export type TransactionInput = z.infer<typeof TransactionSchema> & { id?: string };

export async function createTransaction(data: TransactionInput) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const parsed = TransactionSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid input data" };
  const validData = parsed.data;

  const tx = await prisma.transaction.create({
    data: {
      userId: session.user.id,
      type: validData.type,
      amount: validData.amount,
      description: validData.description,
      categoryId: validData.categoryId || null,
      note: validData.note || null,
      paymentMethod: validData.paymentMethod || null,
      date: new Date(validData.date),
      tags: validData.tags || [],
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transactions");
  return { success: true, id: tx.id };
}

export async function updateTransaction(id: string, data: TransactionInput) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const parsed = TransactionSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid input data" };
  const validData = parsed.data;

  const result = await prisma.transaction.updateMany({
    where: { id, userId: session.user.id },
    data: {
      type: validData.type,
      amount: validData.amount,
      description: validData.description,
      categoryId: validData.categoryId || null,
      note: validData.note || null,
      paymentMethod: validData.paymentMethod || null,
      date: new Date(validData.date),
      tags: validData.tags || [],
    },
  });

  if (result.count === 0) return { error: "Transaction not found or unauthorized" };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transactions");
  return { success: true };
}

export async function deleteTransaction(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await prisma.transaction.deleteMany({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transactions");
  return { success: true };
}

export async function deleteTransactions(ids: string[]) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await prisma.transaction.deleteMany({
    where: { id: { in: ids }, userId: session.user.id },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transactions");
  return { success: true };
}

export async function getTransactions(params?: {
  type?: "INCOME" | "EXPENSE";
  categoryId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: "date" | "amount";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}) {
  const session = await auth();
  if (!session?.user?.id) return { transactions: [], total: 0 };

  const where: Record<string, unknown> = { userId: session.user.id };

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

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: {
        [params?.sortBy ?? "date"]: params?.sortOrder ?? "desc",
      },
      take: params?.limit ?? 50,
      skip: params?.offset ?? 0,
    }),
    prisma.transaction.count({ where }),
  ]);

  return { transactions, total };
}

export async function getDashboardStats() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [thisMonthTx, lastMonthTx, recentTx, userDb] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        date: { gte: startOfMonth },
      },
    }),
    prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        date: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    }),
    prisma.transaction.findMany({
      where: { userId: session.user.id },
      include: { category: true },
      orderBy: { date: "desc" },
      take: 10,
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { currency: true },
    }),
  ]);

  const calcTotals = (txs: typeof thisMonthTx) => ({
    income: txs.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0),
    expense: txs.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0),
  });

  const current = calcTotals(thisMonthTx);
  const last = calcTotals(lastMonthTx);

  const changePercent = (curr: number, prev: number) =>
    prev === 0 ? 0 : ((curr - prev) / prev) * 100;

  const [allTimeIncome, allTimeExpense] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId: session.user.id, type: "INCOME" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId: session.user.id, type: "EXPENSE" },
      _sum: { amount: true },
    }),
  ]);

  return {
    income: current.income,
    expense: current.expense,
    balance: (allTimeIncome._sum.amount || 0) - (allTimeExpense._sum.amount || 0),
    monthlyBalance: current.income - current.expense,
    savingsRate:
      current.income > 0
        ? Math.round(((current.income - current.expense) / current.income) * 100)
        : 0,
    incomeChange: changePercent(current.income, last.income),
    expenseChange: changePercent(current.expense, last.expense),
    recentTransactions: recentTx,
    currency: userDb?.currency || "INR",
  };
}
