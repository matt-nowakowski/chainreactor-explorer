import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlock } from "@/lib/sidecar";
import { formatMethod } from "@/lib/utils";
import { CopyButton } from "@/components/copy-button";

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

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div>
        <div className="flex items-center gap-2">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">
            Blocks
          </Link>
          <span className="text-xs text-muted-foreground">/</span>
          <Link href={`/blocks/${blockNum}`} className="text-xs text-muted-foreground hover:text-foreground">
            #{blockNum.toLocaleString()}
          </Link>
          <span className="text-xs text-muted-foreground">/</span>
          <span className="text-xs font-medium">Extrinsic {extIndex}</span>
        </div>
        <h1 className="mt-1 text-lg font-semibold tracking-tight">
          {formatMethod(ext.method.pallet, ext.method.method)}
        </h1>
      </div>

      {/* Details */}
      <div className="space-y-2 rounded-lg border p-4">
        <DetailRow label="Block" value={`#${blockNum.toLocaleString()}`} />
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
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-xs text-muted-foreground">
                  <th className="px-4 py-2 text-left font-medium">#</th>
                  <th className="px-4 py-2 text-left font-medium">Method</th>
                  <th className="px-4 py-2 text-left font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {ext.events.map((event, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{i}</td>
                    <td className="px-4 py-2">
                      <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                        {formatMethod(event.method.pallet, event.method.method)}
                      </span>
                    </td>
                    <td className="max-w-xs truncate px-4 py-2 font-mono text-xs text-muted-foreground">
                      {event.data.length > 0 ? JSON.stringify(event.data) : "—"}
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

function DetailRow({
  label,
  value,
  mono,
  copy,
  badge,
  link,
}: {
  label: string;
  value: string;
  mono?: boolean;
  copy?: boolean;
  badge?: "success" | "error";
  link?: string;
}) {
  const content = badge ? (
    <span
      className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${
        badge === "success"
          ? "bg-emerald-500/10 text-emerald-600"
          : "bg-red-500/10 text-red-600"
      }`}
    >
      {value}
    </span>
  ) : link ? (
    <Link href={link} className={`text-xs text-primary hover:underline ${mono ? "font-mono" : ""}`}>
      {value}
    </Link>
  ) : (
    <span className={`text-xs break-all ${mono ? "font-mono" : ""}`}>
      {value}
    </span>
  );

  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-0.5 text-right">
        {content}
        {copy && <CopyButton value={value} />}
      </div>
    </div>
  );
}
