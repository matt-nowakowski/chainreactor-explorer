import { Skeleton, SkeletonTable } from "@/components/skeleton";

export default function BlocksLoading() {
  return (
    <div className="space-y-4">
      <div>
        <Skeleton className="h-6 w-20" />
        <Skeleton className="mt-1 h-3 w-32" />
      </div>
      <SkeletonTable rows={20} cols={6} />
    </div>
  );
}
