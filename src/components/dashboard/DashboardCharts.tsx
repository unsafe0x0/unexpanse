"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import { CHART_COLORS } from "@/lib/constants";
import { useEffect, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface DashboardChartsProps {
  userId: string;
  categories: Category[];
  currency: string;
}

interface SpendingData {
  month: string;
  income: number;
  expense: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

function CustomTooltip({
  active,
  payload,
  label,
  currency,
}: TooltipContentProps<ValueType, NameType> & { currency: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-lg text-sm text-card-foreground">
        <p className="font-medium mb-2">{label}</p>
        {(payload as unknown as Array<{ name: string; value: number; color: string }>).map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full shrink-0"
              style={{ background: entry.color }}
            />
            <span className="text-muted-foreground">
              {entry.name === "Income" ? "Income" : "Expense"}:
            </span>
            <span className="font-medium" style={{ color: entry.color }}>
              {formatCurrency(entry.value, currency)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export function DashboardCharts({ userId, categories, currency }: DashboardChartsProps) {
  const [spendingData, setSpendingData] = useState<SpendingData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    function generatePlaceholderData() {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      setSpendingData(
        months.map((month, i) => ({
          month,
          income: 2000 + i * 100,
          expense: 1500 + i * 50,
        }))
      );
      setCategoryData(
        categories.slice(0, 5).map((cat, i) => ({
          name: cat.name,
          value: 200 + i * 50,
          color: cat.color || CHART_COLORS[i % CHART_COLORS.length],
        }))
      );
    }

    async function fetchChartData() {
      try {
        const res = await fetch("/api/analytics/charts");
        if (res.ok) {
          const data = await res.json();
          setSpendingData(data.monthly ?? []);
          setCategoryData(data.byCategory ?? []);
        } else {
          generatePlaceholderData();
        }
      } catch {
        generatePlaceholderData();
      } finally {
        setIsLoading(false);
      }
    }

    fetchChartData();
  }, [userId, categories.length]);

  const renderTooltip = useCallback(
    (props: TooltipContentProps<ValueType, NameType>) => <CustomTooltip {...props} currency={currency} />,
    [currency]
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border p-5">
          <Skeleton className="h-5 w-32 mb-4" />
          <Skeleton className="h-55 w-full rounded-lg" />
        </div>
        <div className="rounded-xl border border-border p-5">
          <Skeleton className="h-5 w-32 mb-4" />
          <Skeleton className="h-55 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

      <div className="rounded-xl bg-card p-5">
        <p className="text-base font-semibold tracking-tight mb-4">Spending Trend</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={[...spendingData].sort((a, b) => {
              const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
              return months.indexOf(a.month) - months.indexOf(b.month);
            })}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => {
                const symbol = new Intl.NumberFormat("en-US", { style: "currency", currency }).formatToParts(0).find(p => p.type === 'currency')?.value || '$';
                return `${symbol}${(v / 1000).toFixed(0)}k`;
              }}
            />
            <Tooltip content={renderTooltip} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
            <Legend iconType="circle" iconSize={8} verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 10, fontSize: 12 }} />
            <Bar
              dataKey="income"
              name="Income"
              fill="#10B981"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="expense"
              name="Expense"
              fill="#EF4444"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl bg-card p-5">
        <p className="text-base font-semibold tracking-tight mb-4">Category Breakdown</p>
        {categoryData.length === 0 ? (
          <div className="flex items-center justify-center h-55 text-sm text-muted-foreground">
            No expense data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {categoryData.map((entry, i) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color || CHART_COLORS[i % CHART_COLORS.length]}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span style={{ fontSize: 12 }}>{value}</span>
                )}
              />
              <Tooltip
                formatter={(value: unknown) => [
                  formatCurrency(value as number, currency),
                  "Spent",
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

