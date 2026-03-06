import { NextResponse } from "next/server";
import { getRecentBlocks } from "@/lib/sidecar";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const blocks = await getRecentBlocks(5);
    return NextResponse.json(blocks);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch blocks" },
      { status: 502 }
    );
  }
}
