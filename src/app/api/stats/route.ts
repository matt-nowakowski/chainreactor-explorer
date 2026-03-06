import { NextResponse } from "next/server";
import { getLatestBlock, getFinalizedHead } from "@/lib/sidecar";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [head, finalized] = await Promise.all([
      getLatestBlock(),
      getFinalizedHead(),
    ]);

    // Extract token symbol from timestamp extrinsic metadata or default
    const tokenSymbol = process.env.NEXT_PUBLIC_TOKEN_SYMBOL || "TOKEN";

    return NextResponse.json({
      blockHeight: Number(head.number),
      finalizedHeight: Number(finalized.number),
      tokenSymbol,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch stats" },
      { status: 502 }
    );
  }
}
