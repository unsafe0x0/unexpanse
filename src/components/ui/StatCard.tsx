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
    <div className={cn(
      "rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5 animate-fade-in",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <p
            className={cn(
              "mt-2 text-2xl font-bold tracking-tight",
              variant === "income" && "text-emerald-500",
              variant === "expense" && "text-red-500"
            )}
          >
            {value}
          </p>
          {change !== undefined && (
            <div
              className={cn(
                "mt-1.5 flex items-center gap-1 text-xs font-medium",
                isPositive ? "text-emerald-500" : "text-red-500"
              )}
            >
              {isPositive ? (
                <TrendUp size={12} weight="bold" />
              ) : (
                <TrendDown size={12} weight="bold" />
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
              "flex h-10 w-10 items-center justify-center rounded-xl",
              iconBg ?? "bg-accent",
              "text-foreground"
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
