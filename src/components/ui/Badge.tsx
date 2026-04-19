import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "success" | "error" | "warning" | "outline";
  size?: "sm" | "default";
}

const badgeVariants = {
  default: "bg-foreground text-background",
  secondary: "bg-secondary text-secondary-foreground",
  success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  error: "bg-red-500/15 text-red-600 dark:text-red-400",
  warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  outline: "border border-border text-foreground bg-transparent",
};

const sizeVariants = {
  sm: "px-1.5 py-0.5 text-[10px]",
  default: "px-2.5 py-0.5 text-xs",
};

export function Badge({ variant = "secondary", size = "default", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        badgeVariants[variant],
        sizeVariants[size],
        className
      )}
      {...props}
    />
  );
}
