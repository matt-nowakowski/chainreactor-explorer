import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlock, toBlockSummary } from "@/lib/sidecar";
import { truncateHash, formatMethod, timeAgo } from "@/lib/utils";
import { CopyButton } from "@/components/copy-button";

export const dynamic = "force-dynamic";

export default async function BlockPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let block;
  try {
    block = await getBlock(id);
  } catch {
    notFound();
  }

  const summary = toBlockSummary(block);
  const allEvents = [
    ...block.onInitialize.events,
    ...block.extrinsics.flatMap((e) => e.events),
    ...block.onFinalize.events,
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">
            Blocks
          </Link>
          <span className="text-xs text-muted-foreground">/</span>
          <span className="text-xs font-medium">#{summary.number.toLocaleString()}</span>
        </div>
        <h1 className="mt-1 text-lg font-semibold tracking-tight">
          Block #{summary.number.toLocaleString()}
        </h1>
      </div>

      {/* Details */}
      <div className="space-y-2 rounded-lg border p-4">
        <DetailRow label="Block Height" value={summary.number.toLocaleString()} />
        <DetailRow label="Hash" value={block.hash} mono copy />
        <DetailRow label="Parent Hash" value={block.parentHash} mono copy />
        <DetailRow label="State Root" value={block.stateRoot} mono copy />
        <DetailRow label="Extrinsics Root" value={block.extrinsicsRoot} mono copy />
        {summary.authorId && (
          <DetailRow label="Author" value={summary.authorId} mono copy />
        )}
        {summary.timestamp && (
          <DetailRow label="Time" value={`${new Date(summary.timestamp).toLocaleString()} (${timeAgo(summary.timestamp)})`} />
        )}
        <DetailRow label="Extrinsics" value={String(summary.extrinsicCount)} />
        <DetailRow label="Events" value={String(summary.eventCount)} />
      </div>

      {/* Extrinsics */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold">
          Extrinsics ({block.extrinsics.length})
        </h2>
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-xs text-muted-foreground">
                <th className="px-4 py-2 text-left font-medium">Index</th>
                <th className="px-4 py-2 text-left font-medium">Method</th>
                <th className="px-4 py-2 text-left font-medium">Signer</th>
                <th className="px-4 py-2 text-right font-medium">Result</th>
              </tr>
            </thead>
            <tbody>
              {block.extrinsics.map((ext, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-2">
                    <Link
                      href={`/extrinsics/${summary.number}-${i}`}
                      className="font-mono text-xs text-primary hover:underline"
                    >
                      {summary.number}-{i}
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                      {formatMethod(ext.method.pallet, ext.method.method)}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                    {ext.signature?.signer?.id
                      ? truncateHash(ext.signature.signer.id, 6)
                      : "—"}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <span
                      className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${
                        ext.success
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-red-500/10 text-red-600"
                      }`}
                    >
                      {ext.success ? "Success" : "Failed"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Events */}
      {allEvents.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">Events ({allEvents.length})</h2>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-xs text-muted-foreground">
                  <th className="px-4 py-2 text-left font-medium">#</th>
                  <th className="px-4 py-2 text-left font-medium">Method</th>
                </tr>
              </thead>
              <tbody>
                {allEvents.slice(0, 50).map((event, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{i}</td>
                    <td className="px-4 py-2">
                      <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                        {formatMethod(event.method.pallet, event.method.method)}
                      </span>
                    </td>
                  </tr>
                ))}
                {allEvents.length > 50 && (
                  <tr>
                    <td colSpan={2} className="px-4 py-2 text-xs text-muted-foreground">
                      ... and {allEvents.length - 50} more events
                    </td>
                  </tr>
                )}
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
}: {
  label: string;
  value: string;
  mono?: boolean;
  copy?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-0.5 text-right">
        <span
          className={`text-xs break-all ${mono ? "font-mono" : ""}`}
        >
          {value}
        </span>
        {copy && <CopyButton value={value} />}
      </div>
    </div>
  );
}
