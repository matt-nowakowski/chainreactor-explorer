import { Skeleton, SkeletonCard, SkeletonDetail } from "@/components/skeleton";

export default function AccountLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-2 h-5 w-64" />
      </div>
      <div className="rounded-lg border p-4 space-y-3">
        <Skeleton className="h-3 w-16" />
        <div className="grid gap-4 sm:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
      <SkeletonDetail rows={4} />
    </div>
  );
}
