"use client";

import { cn } from "@/lib/utils";
import { SealQuestion } from "@phosphor-icons/react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    leftIcon?: React.ReactNode;
  };
  className?: string;
  size?: "sm" | "default" | "lg";
}

const sizeClasses = {
  sm: { wrapper: "py-8", icon: "h-8 w-8", title: "text-sm", desc: "text-xs" },
  default: { wrapper: "py-12", icon: "h-10 w-10", title: "text-base", desc: "text-sm" },
  lg: { wrapper: "py-16", icon: "h-12 w-12", title: "text-lg", desc: "text-sm" },
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  size = "default",
}: EmptyStateProps) {
  const classes = sizeClasses[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center animate-fade-in",
        classes.wrapper,
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent mb-4">
        {icon ?? <SealQuestion size={32} className="text-muted-foreground" />}
      </div>
      <h3 className={cn("font-semibold", classes.title)}>{title}</h3>
      {description && (
        <p
          className={cn("text-muted-foreground mt-1.5 max-w-xs", classes.desc)}
        >
          {description}
        </p>
      )}
      {action && (
        <Button
          className="mt-4"
          onClick={action.onClick}
          leftIcon={action.leftIcon}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
