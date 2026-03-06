export function Skeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted/30 ${className}`}
      style={style}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg p-5 space-y-3">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-8 w-28" />
    </div>
  );
}

export function SkeletonBlock() {
  return (
    <div className="space-y-5 rounded-lg p-6">
      <Skeleton className="h-5 w-2/5" />
      <Skeleton className="h-5 w-3/5" />
      <Skeleton className="h-5 w-1/3" />
    </div>
  );
}

export function SkeletonRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4 rounded-lg py-6 px-2">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton
          key={i}
          className="h-6 rounded-lg"
          style={{ maxWidth: `${45 + ((i * 19) % 40)}%` }}
        />
      ))}
    </div>
  );
}

/** @deprecated Use SkeletonRows or SkeletonBlock instead */
export function SkeletonTable({ rows }: { rows: number; cols?: number }) {
  return <SkeletonRows rows={Math.min(rows, 5)} />;
}

/** @deprecated Use SkeletonBlock instead */
export function SkeletonDetail({ rows }: { rows: number }) {
  return <SkeletonBlock />;
}
