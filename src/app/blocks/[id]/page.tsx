import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlock, getFinalizedHead, toBlockSummary } from "@/lib/sidecar";
import { truncateHash, formatMethod, timeAgo, formatTimestamp } from "@/lib/utils";
import { DetailRow } from "@/components/detail-row";
import { Badge } from "@/components/badge";

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
  const blockNum = summary.number;

  // Check finalized status
  let isFinalized = false;
  try {
    const finalized = await getFinalizedHead();
    isFinalized = Number(finalized.number) >= blockNum;
  } catch {
    // Can't determine, leave false
  }

  const allEvents = [
    ...block.onInitialize.events,
    ...block.extrinsics.flatMap((e) => e.events),
    ...block.onFinalize.events,
  ];

  return (
    <div className="space-y-6">
      {/* Header with prev/next nav */}
      <div>
        <div className="flex items-center gap-2">
          <Link href="/blocks" className="text-xs text-muted-foreground hover:text-foreground">
            Blocks
          </Link>
          <span className="text-xs text-muted-foreground">/</span>
          <span className="text-xs font-medium">#{blockNum.toLocaleString()}</span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight">
              Block #{blockNum.toLocaleString()}
            </h1>
            <Badge variant={isFinalized ? "success" : "warning"}>
              {isFinalized ? "Finalized" : "Unfinalized"}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            {blockNum > 0 && (
              <Link
                href={`/blocks/${blockNum - 1}`}
                className="rounded-md border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted"
              >
                ← {(blockNum - 1).toLocaleString()}
              </Link>
            )}
            <Link
              href={`/blocks/${blockNum + 1}`}
              className="rounded-md border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted"
            >
              {(blockNum + 1).toLocaleString()} →
            </Link>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-0.5 rounded-lg border p-4">
        <DetailRow label="Block Height" value={blockNum.toLocaleString()} />
        <DetailRow label="Hash" value={block.hash} mono copy />
        <DetailRow label="Parent Hash" value={block.parentHash} mono copy />
        <DetailRow label="State Root" value={block.stateRoot} mono copy />
        <DetailRow label="Extrinsics Root" value={block.extrinsicsRoot} mono copy />
        {summary.authorId && (
          <DetailRow
            label="Author"
            value={summary.authorId}
            mono
            copy
            link={`/accounts/${summary.authorId}`}
          />
        )}
        {summary.timestamp && (
          <DetailRow
            label="Time"
            value={`${formatTimestamp(summary.timestamp)} (${timeAgo(summary.timestamp)})`}
          />
        )}
        <DetailRow label="Extrinsics" value={String(summary.extrinsicCount)} />
        <DetailRow label="Events" value={String(summary.eventCount)} />
        <DetailRow
          label="Status"
          value={isFinalized ? "Finalized" : "Unfinalized"}
          badge={isFinalized ? "success" : "error"}
        />
      </div>

      {/* Digest Logs */}
      {block.logs && block.logs.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">Digest Logs ({block.logs.length})</h2>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-xs text-muted-foreground">
                  <th className="px-4 py-2 text-left font-medium">#</th>
                  <th className="px-4 py-2 text-left font-medium">Type</th>
                  <th className="px-4 py-2 text-left font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {block.logs.map((log, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{log.index}</td>
                    <td className="px-4 py-2">
                      <Badge variant="neutral" mono>{log.type}</Badge>
                    </td>
                    <td className="px-4 py-2 max-w-xs">
                      <span className="font-mono text-xs text-muted-foreground truncate block max-w-[400px]">
                        {log.value}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Extrinsics */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold">
          Extrinsics ({block.extrinsics.length})
        </h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-xs text-muted-foreground">
                <th className="px-4 py-2 text-left font-medium">Index</th>
                <th className="px-4 py-2 text-left font-medium">Method</th>
                <th className="px-4 py-2 text-left font-medium hidden sm:table-cell">Signer</th>
                <th className="px-4 py-2 text-right font-medium">Result</th>
              </tr>
            </thead>
            <tbody>
              {block.extrinsics.map((ext, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-2">
                    <Link
                      href={`/extrinsics/${blockNum}-${i}`}
                      className="font-mono text-xs text-primary hover:underline"
                    >
                      {blockNum}-{i}
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    <Badge variant="neutral" mono>
                      {formatMethod(ext.method.pallet, ext.method.method)}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 hidden sm:table-cell">
                    {ext.signature?.signer?.id ? (
                      <Link
                        href={`/accounts/${ext.signature.signer.id}`}
                        className="font-mono text-xs text-muted-foreground hover:text-foreground"
                      >
                        {truncateHash(ext.signature.signer.id, 6)}
                      </Link>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Badge variant={ext.success ? "success" : "error"}>
                      {ext.success ? "Success" : "Failed"}
                    </Badge>
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
                {allEvents.map((event, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{i}</td>
                    <td className="px-4 py-2">
                      <Badge variant="neutral" mono>
                        {formatMethod(event.method.pallet, event.method.method)}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 hidden md:table-cell max-w-xs">
                      {event.data.length > 0 ? (
                        <details className="group">
                          <summary className="cursor-pointer font-mono text-xs text-muted-foreground truncate max-w-[300px] hover:text-foreground">
                            {JSON.stringify(event.data).slice(0, 60)}
                            {JSON.stringify(event.data).length > 60 ? "..." : ""}
                          </summary>
                          <pre className="mt-1 rounded bg-muted/40 p-2 font-mono text-[10px] leading-relaxed overflow-x-auto max-h-40">
                            {JSON.stringify(event.data, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
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
