"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { truncateAddress, formatBalance } from "@/lib/utils";
import { Badge } from "@/components/badge";
import { Pagination } from "@/components/pagination";
import { Timestamp } from "@/components/timestamp";
import { SkeletonTable } from "@/components/skeleton";
import { ErrorState } from "@/components/error-state";
import type { TransferSummary } from "@/lib/types";

const BLOCK_WINDOW = 30;

interface RuntimeInfo {
  tokenSymbol: string;
  tokenDecimals: number;
}

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<TransferSummary[]>([]);
  const [runtime, setRuntime] = useState<RuntimeInfo | null>(null);
  const [headHeight, setHeadHeight] = useState<number | null>(null);
  const [pageEnd, setPageEnd] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(async (endBlock?: number) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch runtime info for token formatting
      if (!runtime) {
        const runtimeRes = await fetch("/api/runtime");
        if (runtimeRes.ok) {
          const data = await runtimeRes.json();
          setRuntime({
            tokenSymbol: data.tokenSymbol || "TOKEN",
            tokenDecimals: Number(data.tokenDecimals) || 18,
          });
        }
      }

      let to = endBlock;
      if (to === undefined) {
        const statsRes = await fetch("/api/stats");
        if (statsRes.ok) {
          const stats = await statsRes.json();
          to = stats.blockHeight;
          setHeadHeight(stats.blockHeight);
        } else {
          throw new Error("Failed to fetch stats");
        }
      }

      const from = Math.max(0, to! - BLOCK_WINDOW + 1);
      const res = await fetch(`/api/blocks/range?from=${from}&to=${to}`);
      if (!res.ok) throw new Error("Failed to fetch transfers");

      const data = await res.json();
      const sorted = (data.transfers as TransferSummary[]).sort((a, b) =>
        b.blockNumber !== a.blockNumber
          ? b.blockNumber - a.blockNumber
          : b.extrinsicIndex - a.extrinsicIndex
      );
      setTransfers(sorted);
      setPageEnd(to!);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [runtime]);

  useEffect(() => {
    fetchPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const decimals = runtime?.tokenDecimals ?? 18;
  const symbol = runtime?.tokenSymbol ?? "TOKEN";

  const hasNewer = pageEnd !== null && headHeight !== null && pageEnd < headHeight;
  const hasOlder = pageEnd !== null && pageEnd - BLOCK_WINDOW >= 0;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Transfers</h1>
        <p className="text-xs text-muted-foreground">
          Token transfers from recent blocks
        </p>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={() => fetchPage(pageEnd ?? undefined)} />
      ) : loading ? (
        <SkeletonTable rows={10} cols={5} />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-xs text-muted-foreground">
                  <th className="px-4 py-2.5 text-left font-medium">Block</th>
                  <th className="px-4 py-2.5 text-left font-medium">From</th>
                  <th className="px-4 py-2.5 text-left font-medium">To</th>
                  <th className="px-4 py-2.5 text-right font-medium">Amount</th>
                  <th className="px-4 py-2.5 text-right font-medium hidden sm:table-cell">Time</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((tx, i) => (
                  <tr
                    key={`${tx.blockNumber}-${tx.extrinsicIndex}-${i}`}
                    className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/blocks/${tx.blockNumber}`}
                        className="font-mono text-xs text-primary hover:underline"
                      >
                        {tx.blockNumber.toLocaleString()}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/accounts/${tx.from}`}
                        className="font-mono text-xs text-muted-foreground hover:text-foreground"
                      >
                        {truncateAddress(tx.from, 6)}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/accounts/${tx.to}`}
                        className="font-mono text-xs text-muted-foreground hover:text-foreground"
                      >
                        {truncateAddress(tx.to, 6)}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="text-xs font-medium">
                        {formatBalance(tx.amount, decimals)}{" "}
                        <span className="text-muted-foreground font-normal">{symbol}</span>
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right hidden sm:table-cell">
                      <Timestamp ms={tx.timestamp} />
                    </td>
                  </tr>
                ))}
                {transfers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-xs text-muted-foreground">
                      No transfers found in this block range
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            hasNewer={hasNewer}
            hasOlder={hasOlder}
            onNewer={() => {
              if (pageEnd !== null) fetchPage(Math.min(pageEnd + BLOCK_WINDOW, headHeight!));
            }}
            onOlder={() => {
              if (pageEnd !== null) fetchPage(pageEnd - BLOCK_WINDOW);
            }}
            label={pageEnd !== null ? `Blocks ${Math.max(0, pageEnd - BLOCK_WINDOW + 1).toLocaleString()} – ${pageEnd.toLocaleString()}` : undefined}
          />
        </>
      )}
    </div>
  );
}
