import { Skeleton, SkeletonBlock, SkeletonRows } from "@/components/skeleton";

export default function ExtrinsicDetailLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-3 w-32" />
        <Skeleton className="mt-2 h-7 w-40" />
      </div>
      <SkeletonBlock />
      <div>
        <Skeleton className="h-5 w-24 mb-3" />
        <SkeletonRows rows={4} />
      </div>
    </div>
  );
}
