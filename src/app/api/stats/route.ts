import { NextResponse } from "next/server";
import {
  getLatestBlock,
  getFinalizedHead,
  getTotalIssuance,
  getAuthorities,
  getNodeNetwork,
  getRuntimeSpec,
  getRecentBlocks,
} from "@/lib/sidecar";
import { calculateAvgBlockTime } from "@/lib/utils";
import type { NetworkStats } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [head, finalized, runtimeSpec] = await Promise.all([
      getLatestBlock(),
      getFinalizedHead(),
      getRuntimeSpec(),
    ]);

    // These may fail on some chains — fetch with fallbacks
    const [issuanceResult, authResult, networkResult, recentBlocks] =
      await Promise.all([
        getTotalIssuance().catch(() => null),
        getAuthorities().catch(() => null),
        getNodeNetwork().catch(() => null),
        getRecentBlocks(10).catch(() => []),
      ]);

    const timestamps = recentBlocks
      .map((b) => b.timestamp)
      .filter((t): t is number => t !== null);

    const stats: NetworkStats = {
      blockHeight: Number(head.number),
      finalizedHeight: Number(finalized.number),
      totalIssuance: issuanceResult?.value
        ? String(issuanceResult.value)
        : "0",
      validatorCount: Array.isArray(authResult?.value)
        ? (authResult.value as unknown[]).length
        : 0,
      peerCount: networkResult ? Number(networkResult.numPeers) : 0,
      avgBlockTime: calculateAvgBlockTime(timestamps),
      specVersion: runtimeSpec.specVersion,
      specName: runtimeSpec.specName,
      tokenSymbol:
        runtimeSpec.properties?.tokenSymbol?.[0] ||
        process.env.NEXT_PUBLIC_TOKEN_SYMBOL ||
        "TOKEN",
      tokenDecimals: runtimeSpec.properties?.tokenDecimals?.[0]
        ? Number(runtimeSpec.properties.tokenDecimals[0])
        : 18,
      isSyncing: networkResult?.isSyncing ?? false,
    };

    return NextResponse.json(stats, {
      headers: { "Cache-Control": "public, s-maxage=6" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stats fetch failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
