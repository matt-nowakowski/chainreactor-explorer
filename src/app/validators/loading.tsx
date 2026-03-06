import { Skeleton, SkeletonCard, SkeletonTable } from "@/components/skeleton";

export default function ValidatorsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-6 w-28" />
        <Skeleton className="mt-1 h-3 w-48" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <SkeletonTable rows={5} cols={2} />
    </div>
  );
}
