/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useTabStore } from "@/store";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { QuickAddButton } from "@/components/transactions/QuickAddButton";
import { formatCurrency } from "@/lib/utils";
import { Wallet, TrendUp, TrendDown, PiggyBank } from "@/components/ui/Icons";
import dynamic from "next/dynamic";
import type { Session } from "next-auth";

const TransactionsClient = dynamic(() =>
  import("@/components/transactions/TransactionsClient").then(
    (mod) => mod.TransactionsClient,
  ),
);
const CategoriesClient = dynamic(() =>
  import("@/components/categories/CategoriesClient").then(
    (mod) => mod.CategoriesClient,
  ),
);
const BudgetsClient = dynamic(() =>
  import("@/components/budgets/BudgetsClient").then((mod) => mod.BudgetsClient),
);
const AnalyticsClient = dynamic(() =>
  import("@/components/analytics/AnalyticsClient").then(
    (mod) => mod.AnalyticsClient,
  ),
);
const SettingsClient = dynamic(() =>
  import("@/components/settings/SettingsClient").then(
    (mod) => mod.SettingsClient,
  ),
);

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Transaction {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  description: string;
  date: Date;
  paymentMethod?: string | null;
  note?: string | null;
  tags: string[];
  categoryId?: string | null;
  category?: { id: string; name: string; icon: string; color: string } | null;
}

interface DashboardStats {
  income: number;
  expense: number;
  balance: number;
  monthlyBalance: number;
  savingsRate: number;
  incomeChange: number;
  expenseChange: number;
  recentTransactions: Transaction[];
  currency: string;
}

interface Budget {
  id: string;
  name: string;
  amount: number;
  period: string;
  categoryId?: string | null;
  userId: string;
}

interface DashboardClientProps {
  session: Session | null;
  stats: DashboardStats | null;
  categories: Category[];
  transactions: Transaction[];
  analyticsTransactions: Transaction[];
  budgets: Budget[];
}

export function DashboardClient({
  session,
  stats,
  categories,
  transactions,
  analyticsTransactions,
  budgets,
}: DashboardClientProps) {
  const { activeTab } = useTabStore();

  const currency = stats?.currency || (session?.user as any)?.currency || "INR";
  const fmt = (n: number) => formatCurrency(n, currency);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const renderOverview = () => (
    <>
      <div className="flex items-start justify-between gap-6 mb-12">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight">
            {greeting()}, {session?.user?.name?.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground mt-3">
            Here&apos;s your financial overview for this month
          </p>
        </div>
        <QuickAddButton categories={categories} currency={currency} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard
          title="Total Balance"
          value={fmt(stats?.balance ?? 0)}
          icon={<Wallet size={20} weight="duotone" />}
          variant="default"
        />
        <StatCard
          title="Total Income"
          value={fmt(stats?.income ?? 0)}
          change={stats?.incomeChange}
          icon={<TrendUp size={20} weight="duotone" />}
          iconBg="bg-emerald-500/10"
          variant="income"
        />
        <StatCard
          title="Total Expenses"
          value={fmt(stats?.expense ?? 0)}
          change={stats?.expenseChange}
          icon={<TrendDown size={20} weight="duotone" />}
          iconBg="bg-red-500/10"
          variant="expense"
        />
        <StatCard
          title="Savings Rate"
          value={`${stats?.savingsRate ?? 0}%`}
          icon={<PiggyBank size={20} weight="duotone" />}
          iconBg="bg-blue-500/10"
        />
      </div>

      <div className="mb-12">
        <DashboardCharts
          userId={session?.user?.id ?? ""}
          categories={categories}
          currency={currency}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
        </div>
        <RecentTransactions
          transactions={stats?.recentTransactions ?? []}
          currency={currency}
        />
      </div>
    </>
  );

  return (
    <div className="w-full px-4 py-8 lg:px-8 lg:py-10">
      {activeTab === "dashboard" && renderOverview()}

      {activeTab === "transactions" && (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
            <p className="text-sm text-muted-foreground mt-3">
              Manage and track all your income and expenses
            </p>
          </div>
          <TransactionsClient
            initialTransactions={transactions}
            categories={categories}
            currency={currency}
          />
        </>
      )}

      {activeTab === "categories" && (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
            <p className="text-sm text-muted-foreground mt-3">
              Organize your transactions with custom categories
            </p>
          </div>
          <CategoriesClient categories={categories} />
        </>
      )}

      {activeTab === "budgets" && (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
            <p className="text-sm text-muted-foreground mt-3">
              Set spending limits and track your progress
            </p>
          </div>
          <BudgetsClient
            budgets={budgets}
            categories={categories}
            spending={{}}
            currency={currency}
          />
        </>
      )}

      {activeTab === "analytics" && (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-sm text-muted-foreground mt-3">
              Deep dive into your financial habits and trends
            </p>
          </div>
          <AnalyticsClient
            transactions={analyticsTransactions}
            categories={categories}
            currency={currency}
          />
        </>
      )}

      {activeTab === "settings" && (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground mt-3">
              Manage your profile and application preferences
            </p>
          </div>
          <SettingsClient user={session?.user} />
        </>
      )}
    </div>
  );
}
