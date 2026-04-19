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
  currency = "USD",
}: RecentTransactionsProps) {
  const { setActiveTab } = useTabStore();

  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-border">
        <EmptyState
          icon={<ArrowsLeftRight size={32} className="text-muted-foreground" />}
          title="No transactions yet"
          description="Add your first transaction to get started tracking your finances."
          size="sm"
        />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="divide-y divide-border">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors"
          >

            <div
              className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: tx.category?.color ? `${tx.category.color}20` : "var(--accent)",
                color: tx.category?.color ?? "var(--muted-foreground)",
              }}
            >
              {tx.category?.icon
                ? <CategoryIcon name={tx.category.icon} size={18} />
                : <ArrowsLeftRight size={18} className="text-muted-foreground" />}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{tx.description}</p>
              <div className="flex items-center gap-2 mt-0.5">
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
                tx.type === "INCOME" ? "text-emerald-500" : "text-red-500"
              )}
            >
              {tx.type === "INCOME" ? "+" : "-"}
              {formatCurrency(tx.amount, currency)}
            </span>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 border-t border-border bg-muted/20 flex justify-center">
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
