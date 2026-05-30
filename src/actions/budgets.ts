"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  createBudgetForUser,
  deleteBudgetForUser,
  getBudgetSpendingForUser,
  getBudgetsForUser,
  updateBudgetForUser,
} from "@/services/budgets";

export async function getBudgets() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return getBudgetsForUser(session.user.id);
}

export async function createBudget(data: {
  name: string;
  amount: number;
  categoryId?: string;
  period: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await createBudgetForUser(session.user.id, data);

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateBudget(
  id: string,
  data: {
    name: string;
    amount: number;
    categoryId?: string;
    period: string;
  },
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await updateBudgetForUser(session.user.id, id, data);

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteBudget(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await deleteBudgetForUser(session.user.id, id);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getBudgetSpending(
  budgets: Array<{ id: string; categoryId: string | null }>,
) {
  const session = await auth();
  if (!session?.user?.id) return {};

  return getBudgetSpendingForUser(session.user.id, budgets);
}
