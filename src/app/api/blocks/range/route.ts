import { NextResponse } from "next/server";
import { getBlock, toBlockSummary, extractExtrinsics, extractEvents, extractTransfers } from "@/lib/sidecar";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = Number(searchParams.get("from") || "0");
  const to = Number(searchParams.get("to") || "0");

  if (isNaN(from) || isNaN(to) || to < from || to - from > 50) {
    return NextResponse.json(
      { error: "Invalid range (max 50 blocks)" },
      { status: 400 }
    );
  }

  try {
    // Fetch blocks in parallel (individual requests for reliability)
    const promises = [];
    for (let i = to; i >= from; i--) {
      promises.push(getBlock(i));
    }
    const rawBlocks = await Promise.all(promises);

    const blocks = rawBlocks.map(toBlockSummary);
    const extrinsics = rawBlocks.flatMap(extractExtrinsics);
    const events = rawBlocks.flatMap(extractEvents);
    const transfers = rawBlocks.flatMap(extractTransfers);

    return NextResponse.json({ blocks, extrinsics, events, transfers });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Range fetch failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
