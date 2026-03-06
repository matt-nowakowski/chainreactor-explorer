import { Skeleton, SkeletonDetail, SkeletonTable } from "@/components/skeleton";

export default function BlockDetailLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-2 h-6 w-48" />
      </div>
      <SkeletonDetail rows={10} />
      <div>
        <Skeleton className="h-4 w-28 mb-2" />
        <SkeletonTable rows={5} cols={4} />
      </div>
    </div>
  );
}
