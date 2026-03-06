import { Skeleton, SkeletonDetail } from "@/components/skeleton";

export default function NetworkLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-6 w-24" />
        <Skeleton className="mt-1 h-3 w-48" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <SkeletonDetail rows={4} />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <SkeletonDetail rows={4} />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <SkeletonDetail rows={3} />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <SkeletonDetail rows={4} />
        </div>
      </div>
    </div>
  );
}
