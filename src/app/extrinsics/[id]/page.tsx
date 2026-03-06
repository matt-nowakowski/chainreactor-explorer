import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlock } from "@/lib/sidecar";
import { formatMethod } from "@/lib/utils";
import { DetailRow } from "@/components/detail-row";
import { Badge } from "@/components/badge";

export const dynamic = "force-dynamic";

export default async function ExtrinsicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Format: blockNumber-extrinsicIndex
  const [blockStr, indexStr] = id.split("-");
  const blockNum = Number(blockStr);
  const extIndex = Number(indexStr);

  if (isNaN(blockNum) || isNaN(extIndex)) notFound();

  let block;
  try {
    block = await getBlock(blockNum);
  } catch {
    notFound();
  }

  const ext = block.extrinsics[extIndex];
  if (!ext) notFound();

  // Extract fee/weight info
  const partialFee = ext.info?.partialFee ? String(ext.info.partialFee) : null;
  const weight = ext.info?.weight as { refTime?: string; proofSize?: string } | undefined;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div>
        <div className="flex items-center gap-2">
          <Link href="/extrinsics" className="text-xs text-muted-foreground hover:text-foreground">
            Extrinsics
          </Link>
          <span className="text-xs text-muted-foreground">/</span>
          <Link href={`/blocks/${blockNum}`} className="text-xs text-muted-foreground hover:text-foreground">
            Block #{blockNum.toLocaleString()}
          </Link>
          <span className="text-xs text-muted-foreground">/</span>
          <span className="text-xs font-medium">Extrinsic {extIndex}</span>
        </div>
        <h1 className="mt-1 text-lg font-semibold tracking-tight">
          {formatMethod(ext.method.pallet, ext.method.method)}
        </h1>
      </div>

      {/* Details */}
      <div className="space-y-0.5 rounded-lg border p-4">
        <DetailRow
          label="Block"
          value={`#${blockNum.toLocaleString()}`}
          link={`/blocks/${blockNum}`}
        />
        <DetailRow label="Index" value={String(extIndex)} />
        <DetailRow label="Method" value={formatMethod(ext.method.pallet, ext.method.method)} />
        <DetailRow label="Hash" value={ext.hash} mono copy />
        <DetailRow
          label="Signer"
          value={ext.signature?.signer?.id || "Unsigned (inherent)"}
          mono={!!ext.signature?.signer?.id}
          copy={!!ext.signature?.signer?.id}
          link={ext.signature?.signer?.id ? `/accounts/${ext.signature.signer.id}` : undefined}
        />
        <DetailRow
          label="Result"
          value={ext.success ? "Success" : "Failed"}
          badge={ext.success ? "success" : "error"}
        />
        {ext.nonce && <DetailRow label="Nonce" value={ext.nonce} />}
        {ext.tip && ext.tip !== "0" && <DetailRow label="Tip" value={ext.tip} />}
        <DetailRow label="Pays Fee" value={ext.paysFee ? "Yes" : "No"} />
        {partialFee && <DetailRow label="Fee" value={partialFee} mono />}
        {weight?.refTime && <DetailRow label="Weight (refTime)" value={weight.refTime} mono />}
        {weight?.proofSize && <DetailRow label="Weight (proofSize)" value={weight.proofSize} mono />}
      </div>

      {/* Args */}
      {Object.keys(ext.args).length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">Parameters</h2>
          <pre className="overflow-x-auto rounded-lg border bg-muted/30 p-4 font-mono text-xs leading-relaxed">
            {JSON.stringify(ext.args, null, 2)}
          </pre>
        </div>
      )}

      {/* Events */}
      {ext.events.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">Events ({ext.events.length})</h2>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-xs text-muted-foreground">
                  <th className="px-4 py-2 text-left font-medium">#</th>
                  <th className="px-4 py-2 text-left font-medium">Method</th>
                  <th className="px-4 py-2 text-left font-medium hidden md:table-cell">Data</th>
                </tr>
              </thead>
              <tbody>
                {ext.events.map((event, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-2 font-mono text-sm text-muted-foreground">{i}</td>
                    <td className="px-4 py-2">
                      <Badge variant="neutral" mono>
                        {formatMethod(event.method.pallet, event.method.method)}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 hidden md:table-cell max-w-xs">
                      {event.data.length > 0 ? (
                        <details className="group">
                          <summary className="cursor-pointer font-mono text-sm text-muted-foreground truncate max-w-[300px] hover:text-foreground">
                            {JSON.stringify(event.data).slice(0, 60)}
                            {JSON.stringify(event.data).length > 60 ? "..." : ""}
                          </summary>
                          <pre className="mt-1 rounded bg-muted/40 p-2 font-mono text-[10px] leading-relaxed overflow-x-auto max-h-40">
                            {JSON.stringify(event.data, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
