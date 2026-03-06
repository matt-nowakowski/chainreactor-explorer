import { Skeleton, SkeletonTable } from "@/components/skeleton";

export default function TransfersLoading() {
  return (
    <div className="space-y-4">
      <div>
        <Skeleton className="h-6 w-24" />
        <Skeleton className="mt-1 h-3 w-44" />
      </div>
      <SkeletonTable rows={10} cols={5} />
    </div>
  );
}
