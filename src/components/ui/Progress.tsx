import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "success" | "warning" | "danger";
}

const sizeClasses = {
  sm: "h-1",
  default: "h-2",
  lg: "h-3",
};

const variantClasses = {
  default: "bg-foreground",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
};

export function Progress({
  value,
  max = 100,
  className,
  barClassName,
  showLabel,
  size = "default",
  variant = "default",
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const autoVariant =
    variant === "default"
      ? percentage >= 90
        ? "danger"
        : percentage >= 75
        ? "warning"
        : "default"
      : variant;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn("flex-1 rounded-full bg-muted overflow-hidden", sizeClasses[size])}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemax={max}
        aria-valuemin={0}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            variantClasses[autoVariant],
            barClassName
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-muted-foreground shrink-0 w-9 text-right">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}
