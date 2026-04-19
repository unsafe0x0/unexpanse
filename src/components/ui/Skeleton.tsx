import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md animate-shimmer bg-[length:200%_100%]",
        "[background:linear-gradient(90deg,var(--muted)_25%,color-mix(in_srgb,var(--muted-foreground)_10%,transparent)_50%,var(--muted)_75%)]",
        className
      )}
      {...props}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-3.5 w-20" />
    </div>
  );
}

export function TransactionRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-border last:border-0">
      <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-5 w-20" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-border p-5 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
      <Skeleton className="h-[200px] w-full rounded-lg" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="bg-muted/30 px-4 py-3 flex gap-4 border-b border-border">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/6" />
        <Skeleton className="h-4 w-1/6" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <TransactionRowSkeleton key={i} />
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6 p-8">
      <div className="space-y-1">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  );
}
