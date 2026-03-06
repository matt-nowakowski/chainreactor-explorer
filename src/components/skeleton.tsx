export function Skeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded bg-muted/60 ${className}`}
      style={style}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg border p-4 space-y-2">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-6 w-24" />
    </div>
  );
}

export function SkeletonBlock() {
  return (
    <div className="space-y-3 rounded-lg border p-5">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton
            className="h-4 flex-1"
            style={{ maxWidth: `${40 + ((i * 17) % 45)}%` }}
          />
        </div>
      ))}
    </div>
  );
}

export function SkeletonRows({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-2.5 rounded-lg border p-5">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ maxWidth: `${55 + ((i * 13) % 40)}%` }}
        />
      ))}
    </div>
  );
}

/** @deprecated Use SkeletonRows or SkeletonBlock instead */
export function SkeletonTable({ rows }: { rows: number; cols?: number }) {
  return <SkeletonRows rows={rows} />;
}

/** @deprecated Use SkeletonBlock instead */
export function SkeletonDetail({ rows }: { rows: number }) {
  return (
    <div className="space-y-3 rounded-lg border p-5">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton
            className="h-3.5"
            style={{ width: `${30 + ((i * 19) % 35)}%` }}
          />
        </div>
      ))}
    </div>
  );
}
