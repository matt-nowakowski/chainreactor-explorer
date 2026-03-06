import { Skeleton, SkeletonTable } from "@/components/skeleton";

export default function EventsLoading() {
  return (
    <div className="space-y-4">
      <div>
        <Skeleton className="h-6 w-20" />
        <Skeleton className="mt-1 h-3 w-40" />
      </div>
      <SkeletonTable rows={15} cols={4} />
    </div>
  );
}
