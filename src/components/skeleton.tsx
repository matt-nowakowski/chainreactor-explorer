export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-muted/60 ${className}`}
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

export function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr className="border-b last:border-0">
      {Array.from({ length: cols }, (_, i) => (
        <td key={i} className="px-4 py-2.5">
          <Skeleton className="h-4 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonTable({ rows, cols }: { rows: number; cols: number }) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/30">
            {Array.from({ length: cols }, (_, i) => (
              <th key={i} className="px-4 py-2.5">
                <Skeleton className="h-3 w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, i) => (
            <SkeletonRow key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonDetail({ rows }: { rows: number }) {
  return (
    <div className="space-y-2 rounded-lg border p-4">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center justify-between py-1.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-40" />
        </div>
      ))}
    </div>
  );
}
