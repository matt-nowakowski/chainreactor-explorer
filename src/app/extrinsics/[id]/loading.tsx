import { Skeleton, SkeletonDetail, SkeletonTable } from "@/components/skeleton";

export default function ExtrinsicDetailLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-3 w-32" />
        <Skeleton className="mt-2 h-6 w-40" />
      </div>
      <SkeletonDetail rows={8} />
      <div>
        <Skeleton className="h-4 w-24 mb-2" />
        <SkeletonTable rows={4} cols={3} />
      </div>
    </div>
  );
}
