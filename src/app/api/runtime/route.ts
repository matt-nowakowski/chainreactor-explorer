import { NextResponse } from "next/server";
import { getRuntimeSpec, getNodeVersion, getNodeNetwork, getTotalIssuance } from "@/lib/sidecar";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [spec, version, network, issuance] = await Promise.all([
      getRuntimeSpec(),
      getNodeVersion().catch(() => null),
      getNodeNetwork().catch(() => null),
      getTotalIssuance().catch(() => null),
    ]);

    return NextResponse.json({
      specName: spec.specName,
      specVersion: spec.specVersion,
      implVersion: spec.implVersion,
      transactionVersion: spec.transactionVersion,
      tokenSymbol: spec.properties?.tokenSymbol?.[0] || "TOKEN",
      tokenDecimals: spec.properties?.tokenDecimals?.[0] || "18",
      ss58Format: spec.properties?.ss58Format || "42",
      totalIssuance: issuance?.value ? String(issuance.value) : null,
      clientVersion: version?.clientVersion || null,
      clientImplName: version?.clientImplName || null,
      chain: version?.chain || null,
      peerCount: network ? Number(network.numPeers) : null,
      isSyncing: network?.isSyncing ?? null,
      nodeRoles: network?.nodeRoles || [],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch runtime";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
