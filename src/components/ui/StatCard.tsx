"use client";

import { cn } from "@/lib/utils";
import { TrendUp, TrendDown } from "@phosphor-icons/react";

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  iconBg?: string;
  variant?: "default" | "income" | "expense" | "neutral";
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  iconBg,
  variant = "default",
  className,
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-6 transition-all duration-200 hover:bg-card/70 animate-fade-in",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {title}
          </p>
          <p
            className={cn(
              "mt-2 text-2xl font-bold tracking-tight",
              variant === "income" && "text-emerald-600 dark:text-emerald-400",
              variant === "expense" && "text-red-600 dark:text-red-400",
            )}
          >
            {value}
          </p>
          {change !== undefined && (
            <div
              className={cn(
                "mt-2 flex items-center gap-1 text-xs font-medium",
                isPositive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400",
              )}
            >
              {isPositive ? (
                <TrendUp size={14} weight="bold" />
              ) : (
                <TrendDown size={14} weight="bold" />
              )}
              <span>
                {isPositive ? "+" : ""}
                {change.toFixed(1)}% {changeLabel ?? "vs last month"}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg shrink-0",
              iconBg ?? "bg-primary/10",
              "text-primary",
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
