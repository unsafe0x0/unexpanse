import { auth } from "@/lib/auth";
import { getDashboardStats } from "@/actions/transactions";
import { getCategories } from "@/actions/categories";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { getTransactions } from "@/actions/transactions";
import { getBudgets } from "@/actions/budgets";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const [session, stats, categories, { transactions }, budgets] = await Promise.all([
    auth(),
    getDashboardStats(),
    getCategories(),
    getTransactions({ limit: 100 }),
    getBudgets(),
  ]);

  return (
    <DashboardClient
      session={session}
      stats={stats}
      categories={categories}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transactions={transactions as any}
      budgets={budgets}
    />
  );
}
