import { getRuntimeSpec, getNodeVersion, getNodeNetwork, getTotalIssuance } from "@/lib/sidecar";
import { formatBalance, formatNumber } from "@/lib/utils";
import { Badge } from "@/components/badge";
import { DetailRow } from "@/components/detail-row";

export const dynamic = "force-dynamic";

export default async function NetworkPage() {
  let spec = null;
  let version = null;
  let network = null;
  let totalIssuance = null;

  try {
    [spec, version, network, totalIssuance] = await Promise.all([
      getRuntimeSpec().catch(() => null),
      getNodeVersion().catch(() => null),
      getNodeNetwork().catch(() => null),
      getTotalIssuance().catch(() => null),
    ]);
  } catch {
    // Will render partial data
  }

  const tokenSymbol = spec?.properties?.tokenSymbol?.[0] || "TOKEN";
  const tokenDecimals = Number(spec?.properties?.tokenDecimals?.[0] || "18");
  const ss58Format = spec?.properties?.ss58Format || "42";
  const issuanceStr = totalIssuance?.value ? String(totalIssuance.value) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Network</h1>
        <p className="text-xs text-muted-foreground">
          Runtime, token, and network information
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Runtime Section */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">Runtime</h2>
          <div className="rounded-lg border p-4 space-y-0.5">
            {spec ? (
              <>
                <DetailRow label="Spec Name" value={spec.specName} mono />
                <DetailRow label="Spec Version" value={spec.specVersion} />
                <DetailRow label="Impl Version" value={spec.implVersion} />
                <DetailRow label="Transaction Version" value={spec.transactionVersion} />
              </>
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">
                Unable to fetch runtime spec
              </p>
            )}
          </div>
        </div>

        {/* Token Section */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">Token</h2>
          <div className="rounded-lg border p-4 space-y-0.5">
            <DetailRow label="Symbol" value={tokenSymbol} />
            <DetailRow label="Decimals" value={String(tokenDecimals)} />
            <DetailRow label="SS58 Format" value={ss58Format} />
            {issuanceStr && (
              <DetailRow
                label="Total Issuance"
                value={`${formatBalance(issuanceStr, tokenDecimals)} ${tokenSymbol}`}
              />
            )}
          </div>
        </div>

        {/* Node Section */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">Node</h2>
          <div className="rounded-lg border p-4 space-y-0.5">
            {version ? (
              <>
                <DetailRow label="Client" value={version.clientImplName} />
                <DetailRow label="Version" value={version.clientVersion} mono />
                <DetailRow label="Chain" value={version.chain} />
              </>
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">
                Unable to fetch node info
              </p>
            )}
          </div>
        </div>

        {/* Network Section */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">Network Status</h2>
          <div className="rounded-lg border p-4 space-y-0.5">
            {network ? (
              <>
                <DetailRow label="Peers" value={formatNumber(network.numPeers)} />
                <div className="flex items-start justify-between gap-4 py-1.5">
                  <span className="shrink-0 text-sm text-muted-foreground">Syncing</span>
                  <Badge variant={network.isSyncing ? "warning" : "success"}>
                    {network.isSyncing ? "Syncing" : "Synced"}
                  </Badge>
                </div>
                <DetailRow label="Peer ID" value={network.localPeerId} mono copy />
              </>
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">
                Unable to fetch network info
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
