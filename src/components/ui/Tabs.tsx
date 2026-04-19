"use client";

import { cn } from "@/lib/utils";


interface TabItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  variant?: "default" | "pill" | "underline";
}

export function Tabs({ items, value, onChange, className, variant = "default" }: TabsProps) {
  return (
    <div
      role="tablist"
      className={cn(
        variant === "default" &&
          "flex gap-1 rounded-xl bg-muted p-1",
        variant === "pill" && "flex gap-2",
        variant === "underline" &&
          "flex gap-0 border-b border-border",
        className
      )}
    >
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={item.value === value}
          onClick={() => onChange(item.value)}
          className={cn(
            "flex items-center gap-1.5 text-sm font-medium transition-all duration-200",
            variant === "default" && [
              "flex-1 rounded-lg px-3 py-1.5 justify-center",
              item.value === value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            ],
            variant === "pill" && [
              "rounded-full px-4 py-1.5",
              item.value === value
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-accent",
            ],
            variant === "underline" && [
              "pb-2.5 px-4 border-b-2 rounded-none",
              item.value === value
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            ]
          )}
        >
          {item.icon}
          {item.label}
          {item.badge !== undefined && (
            <span
              className={cn(
                "ml-1 rounded-full px-1.5 py-0.5 text-xs",
                item.value === value
                  ? "bg-background/20 text-current"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {item.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

interface TabsPanelProps {
  value: string;
  activeValue: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsPanel({ value, activeValue, children, className }: TabsPanelProps) {
  if (value !== activeValue) return null;
  return (
    <div role="tabpanel" className={cn("animate-fade-in", className)}>
      {children}
    </div>
  );
}
