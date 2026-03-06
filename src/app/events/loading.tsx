import { Skeleton, SkeletonRows } from "@/components/skeleton";

export default function EventsLoading() {
  return (
    <div className="space-y-4">
      <div>
        <Skeleton className="h-6 w-20" />
        <Skeleton className="mt-1 h-4 w-40" />
      </div>
      <SkeletonRows />
    </div>
  );
}
