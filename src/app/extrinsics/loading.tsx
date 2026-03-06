import { Skeleton, SkeletonRows } from "@/components/skeleton";

export default function ExtrinsicsLoading() {
  return (
    <div className="space-y-4">
      <div>
        <Skeleton className="h-6 w-28" />
        <Skeleton className="mt-1 h-4 w-48" />
      </div>
      <SkeletonRows rows={10} />
    </div>
  );
}
