import { getRecentBlocks } from "@/lib/sidecar";
import { BlockList } from "@/components/block-list";
import type { BlockSummary } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let blocks: BlockSummary[];
  try {
    blocks = await getRecentBlocks(20);
  } catch {
    blocks = [];
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Latest Blocks</h1>
        <p className="text-xs text-muted-foreground">
          Real-time block production on the network
        </p>
      </div>
      <BlockList initialBlocks={blocks} />
    </div>
  );
}
