import { Skeleton, SkeletonTable } from "@/components/skeleton";

export default function ExtrinsicsLoading() {
  return (
    <div className="space-y-4">
      <div>
        <Skeleton className="h-6 w-28" />
        <Skeleton className="mt-1 h-3 w-48" />
      </div>
      <SkeletonTable rows={15} cols={5} />
    </div>
  );
}
