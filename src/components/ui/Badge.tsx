import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "secondary"
    | "success"
    | "error"
    | "warning"
    | "outline";
  size?: "sm" | "default";
}

const badgeVariants = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  success: "bg-emerald-500/15 text-emerald-400",
  error: "bg-red-500/15 text-red-400",
  warning: "bg-amber-500/15 text-amber-400",
  outline: "border border-border text-foreground bg-transparent",
};

const sizeVariants = {
  sm: "px-2 py-0.5 text-xs",
  default: "px-3 py-1 text-xs",
};

export function Badge({
  variant = "secondary",
  size = "default",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md font-medium transition-colors",
        badgeVariants[variant],
        sizeVariants[size],
        className,
      )}
      {...props}
    />
  );
}
