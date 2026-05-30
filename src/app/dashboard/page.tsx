import { auth } from "@/lib/auth";
import { getDashboardStats } from "@/actions/transactions";
import { getCategories } from "@/actions/categories";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { getTransactions, getAnalyticsTransactions } from "@/actions/transactions";
import { getBudgets } from "@/actions/budgets";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const [session, stats, categories, { transactions }, budgets, analyticsTransactions] =
    await Promise.all([
      auth(),
      getDashboardStats(),
      getCategories(),
      getTransactions({ limit: 30 }),
      getBudgets(),
      getAnalyticsTransactions(),
    ]);

  return (
    <DashboardClient
      session={session}
      stats={stats}
      categories={categories}
      transactions={transactions}
      analyticsTransactions={analyticsTransactions}
      budgets={budgets}
    />
  );
}
