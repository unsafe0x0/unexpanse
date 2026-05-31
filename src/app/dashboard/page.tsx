import { auth } from "@/lib/auth";
import { getDashboardStats } from "@/actions/transactions";
import { getCategories } from "@/actions/categories";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const [session, stats, categories] =
    await Promise.all([
      auth(),
      getDashboardStats(),
      getCategories(),
    ]);

  return (
    <DashboardClient
      session={session}
      stats={stats}
      categories={categories}
    />
  );
}
