import { getRecentBlocks } from "@/lib/sidecar";
import { StatsCards } from "@/components/stats-cards";
import { LatestFeed } from "@/components/latest-feed";
import type { BlockSummary } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let blocks: BlockSummary[];
  try {
    blocks = await getRecentBlocks(10);
  } catch {
    blocks = [];
  }

  return (
    <div className="space-y-6">
      <StatsCards />
      <LatestFeed initialBlocks={blocks} />
    </div>
  );
}
