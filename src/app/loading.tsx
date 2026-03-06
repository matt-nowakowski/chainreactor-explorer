import { Skeleton, SkeletonCard, SkeletonRows } from "@/components/skeleton";

export default function HomeLoading() {
  return (
    <div className="space-y-6">
      {/* Hero skeleton */}
      <div className="rounded-xl border p-8 space-y-4">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="mt-2 h-11 w-full max-w-xl rounded-full" />
      </div>
      {/* Stats cards skeleton */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      {/* Feed panels skeleton */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SkeletonRows rows={8} />
        <SkeletonRows rows={8} />
      </div>
    </div>
  );
}
