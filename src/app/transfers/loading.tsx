import { Skeleton, SkeletonRows } from "@/components/skeleton";

export default function TransfersLoading() {
  return (
    <div className="space-y-4">
      <div>
        <Skeleton className="h-6 w-24" />
        <Skeleton className="mt-1 h-4 w-44" />
      </div>
      <SkeletonRows rows={8} />
    </div>
  );
}
