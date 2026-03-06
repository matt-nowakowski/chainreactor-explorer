import { NextResponse } from "next/server";
import { getLatestBlock, getBlock, toBlockSummary, extractExtrinsics } from "@/lib/sidecar";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const head = await getLatestBlock();
    const headNum = Number(head.number);
    const start = Math.max(0, headNum - 4);

    const promises = [];
    for (let i = headNum; i >= start; i--) {
      promises.push(i === headNum ? Promise.resolve(head) : getBlock(i));
    }

    const rawBlocks = await Promise.all(promises);
    const blocks = rawBlocks.map(toBlockSummary);

    // Extract signed extrinsics from these blocks
    const extrinsics = rawBlocks
      .flatMap(extractExtrinsics)
      .filter((e) => e.signer !== null)
      .slice(0, 10);

    return NextResponse.json({ blocks, extrinsics });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch blocks";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
