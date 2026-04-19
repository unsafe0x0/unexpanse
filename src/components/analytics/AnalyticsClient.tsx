"use client";

import { useMemo, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import { CHART_COLORS } from "@/lib/constants";
import { formatCurrency, getMonthName } from "@/lib/utils";
import { DownloadSimple } from "@phosphor-icons/react";
import type { TooltipContentProps } from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";

interface Transaction {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  description: string;
  date: Date;
  category?: { id: string; name: string; icon: string; color: string } | null;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface AnalyticsClientProps {
  transactions: Transaction[];
  categories: Category[];
  currency?: string;
}

function CustomTooltip({
  active, payload, label, currency,
}: TooltipContentProps<ValueType, NameType> & { currency: string }) {
  if (active && payload?.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-lg text-sm">
        <p className="font-medium mb-1.5">{label}</p>
        {(payload as unknown as Array<{ name: string; value: number; color: string }>).map((e) => (
          <div key={e.name} className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ background: e.color }} />
            <span className="text-muted-foreground capitalize">{e.name}:</span>
            <span className="font-medium">{formatCurrency(e.value, currency)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export function AnalyticsClient({ transactions, currency = "USD" }: AnalyticsClientProps) {
  const monthlyData = useMemo(() => {
    const map: Record<string, { month: string; income: number; expense: number; net: number }> = {};
    transactions.forEach((tx) => {
      const d = new Date(tx.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const monthName = getMonthName(d.getMonth() + 1).slice(0, 3);
      if (!map[key]) map[key] = { month: monthName, income: 0, expense: 0, net: 0 };
      if (tx.type === "INCOME") map[key].income += tx.amount;
      else map[key].expense += tx.amount;
      map[key].net = map[key].income - map[key].expense;
    });
    return Object.values(map);
  }, [transactions]);

  const categoryData = useMemo(() => {
    const map: Record<string, { name: string; value: number; color: string; icon: string }> = {};
    transactions
      .filter((tx) => tx.type === "EXPENSE" && tx.category)
      .forEach((tx) => {
        const catId = tx.category!.id;
        if (!map[catId]) {
          map[catId] = {
            name: tx.category!.name,
            value: 0,
            color: tx.category!.color,
            icon: tx.category!.icon,
          };
        }
        map[catId].value += tx.amount;
      });
    return Object.values(map).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [transactions]);

  const topCategories = categoryData.slice(0, 5);

  const totalIncome = transactions.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);

  const handleExportCSV = () => {
    const headers = ["Date", "Type", "Description", "Category", "Amount"];
    const rows = transactions.map((tx) => [
      new Date(tx.date).toLocaleDateString(),
      tx.type,
      tx.description,
      tx.category?.name ?? "",
      tx.amount.toFixed(2),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `unexpanse-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currencySymbol = useMemo(() => {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency }).formatToParts(0).find(p => p.type === 'currency')?.value || '$';
    } catch {
      return '$';
    }
  }, [currency]);

  const renderTooltip = useCallback(
    (props: TooltipContentProps<ValueType, NameType>) => <CustomTooltip {...props} currency={currency} />,
    [currency]
  );

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Income", value: formatCurrency(totalIncome, currency), color: "text-emerald-500" },
          { label: "Total Expenses", value: formatCurrency(totalExpense, currency), color: "text-red-500" },
          { label: "Net Savings", value: formatCurrency(totalIncome - totalExpense, currency), color: "" },
        ].map((s) => (
          <Card key={s.label} padding="default">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className={`mt-1.5 text-2xl font-bold ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Monthly Overview</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              leftIcon={<DownloadSimple size={14} />}
              id="export-csv-btn"
            >
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${currencySymbol}${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={renderTooltip} />

              <Legend iconType="circle" iconSize={8} />
              <Area type="monotone" dataKey="income" name="Income" stroke="#10B981" strokeWidth={2} fill="url(#incGrad)" />
              <Area type="monotone" dataKey="expense" name="Expense" stroke="#EF4444" strokeWidth={2} fill="url(#expGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <div className="h-60 flex items-center justify-center text-sm text-muted-foreground">
                No expense data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" stroke="none">
                    {categoryData.map((entry, i) => (
                      <Cell key={entry.name} fill={entry.color || CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
                  <Tooltip formatter={(v: unknown) => [formatCurrency(v as number, currency), "Spent"]} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Spending Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {topCategories.length === 0 ? (
              <div className="h-60 flex items-center justify-center text-sm text-muted-foreground">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={topCategories} layout="vertical" margin={{ top: 0, right: 20, left: 60, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v, currency)} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={55} />
                  <Tooltip cursor={{ fill: 'transparent' }} formatter={(v: unknown) => [formatCurrency(v as number, currency), "Spent"]} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {topCategories.map((entry, i) => (
                      <Cell key={entry.name} fill={entry.color || CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Net Savings by Month</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${currencySymbol}${(v / 1000).toFixed(0)}k`} />
              <Tooltip cursor={{ fill: 'transparent' }} formatter={(v: unknown) => [formatCurrency(v as number, currency), "Net"]} />
              <Bar dataKey="net" radius={[4, 4, 0, 0]}>
                {monthlyData.map((entry, i) => (
                  <Cell key={i} fill={entry.net >= 0 ? "#10B981" : "#EF4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
