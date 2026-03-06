import { Skeleton, SkeletonCard, SkeletonRows } from "@/components/skeleton";

export default function HomeLoading() {
  return (
    <div className="space-y-6">
      {/* Hero skeleton */}
      <div className="rounded-xl p-8 space-y-5">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-80" />
        <Skeleton className="mt-2 h-12 w-full max-w-xl rounded-full" />
      </div>
      {/* Stats cards skeleton */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      {/* Feed panels skeleton */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SkeletonRows />
        <SkeletonRows />
      </div>
    </div>
  );
}
