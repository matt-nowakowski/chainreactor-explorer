import { SkeletonCard, SkeletonTable } from "@/components/skeleton";

export default function HomeLoading() {
  return (
    <div className="space-y-6">
      {/* Stats cards skeleton */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      {/* Feed panels skeleton */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SkeletonTable rows={8} cols={3} />
        <SkeletonTable rows={8} cols={3} />
      </div>
    </div>
  );
}
