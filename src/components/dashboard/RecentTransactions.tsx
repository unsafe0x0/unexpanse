"use client";

import { formatCurrency, formatRelativeDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { ArrowsLeftRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { useTabStore } from "@/store";

interface Transaction {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  description: string;
  date: Date;
  category?: { name: string; icon: string; color: string } | null;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  currency?: string;
}

export function RecentTransactions({
  transactions,
  currency = "INR",
}: RecentTransactionsProps) {
  const { setActiveTab } = useTabStore();

  if (transactions.length === 0) {
    return (
      <div className="rounded-lg border border-border">
        <EmptyState
          icon={<ArrowsLeftRight size={32} className="text-foreground" />}
          title="No transactions yet"
          description="Add your first transaction to get started tracking your finances."
          size="sm"
        />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="divide-y divide-border">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center gap-4 px-6 py-4 hover:bg-card/70 transition-colors"
          >
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 text-foreground"
              style={{
                background: tx.category?.color
                  ? `${tx.category.color}15`
                  : "var(--accent)",
              }}
            >
              {tx.category?.icon ? (
                <CategoryIcon name={tx.category.icon} size={18} />
              ) : (
                <ArrowsLeftRight size={18} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{tx.description}</p>
              <div className="flex items-center gap-2 mt-1">
                {tx.category && (
                  <Badge variant="secondary" size="sm">
                    {tx.category.name}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatRelativeDate(tx.date)}
                </span>
              </div>
            </div>

            <span
              className={cn(
                "text-sm font-semibold shrink-0",
                tx.type === "INCOME"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400",
              )}
            >
              {tx.type === "INCOME" ? "+" : "-"}
              {formatCurrency(tx.amount, currency)}
            </span>
          </div>
        ))}
      </div>

      <div className="px-6 py-4 border-t border-border bg-muted/20 flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => setActiveTab("transactions")}
        >
          View all transactions →
        </Button>
      </div>
    </div>
  );
}
