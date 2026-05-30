"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  createTransactionForUser,
  deleteTransactionForUser,
  deleteTransactionsForUser,
  getDashboardStatsForUser,
  getTransactionsForUser,
  updateTransactionForUser,
} from "@/services/transactions";
import { transactionSchema, TransactionInput } from "@/validators/transaction";

export async function createTransaction(data: TransactionInput) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const parsed = transactionSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid input data" };
  const validData = parsed.data;

  const tx = await createTransactionForUser(session.user.id, validData);

  revalidatePath("/dashboard");
  return { success: true, id: tx.id };
}

export async function updateTransaction(id: string, data: TransactionInput) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const parsed = transactionSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid input data" };
  const validData = parsed.data;

  const result = await updateTransactionForUser(session.user.id, id, validData);

  if (result.count === 0)
    return { error: "Transaction not found or unauthorized" };

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteTransaction(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await deleteTransactionForUser(session.user.id, id);

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteTransactions(ids: string[]) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await deleteTransactionsForUser(session.user.id, ids);

  revalidatePath("/dashboard");
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

  return getTransactionsForUser(session.user.id, {
    ...params,
    limit: params?.limit ?? 30,
    offset: params?.offset ?? 0,
  });
}

export async function getDashboardStats() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return getDashboardStatsForUser(session.user.id);
}

export async function getAnalyticsTransactions() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);

  return prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      date: { gte: yearStart },
    },
    include: { category: true },
    orderBy: { date: "asc" },
  });
}
