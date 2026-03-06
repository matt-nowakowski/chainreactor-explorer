import { Skeleton, SkeletonBlock, SkeletonRows } from "@/components/skeleton";

export default function BlockDetailLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-2 h-7 w-48" />
      </div>
      <SkeletonBlock />
      <div>
        <Skeleton className="h-5 w-28 mb-3" />
        <SkeletonRows rows={5} />
      </div>
    </div>
  );
}
