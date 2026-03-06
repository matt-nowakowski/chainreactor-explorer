"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { truncateHash, truncateAddress } from "@/lib/utils";
import { Badge } from "@/components/badge";
import { Pagination } from "@/components/pagination";
import { Timestamp } from "@/components/timestamp";
import { SkeletonRows } from "@/components/skeleton";
import { ErrorState } from "@/components/error-state";
import type { BlockSummary } from "@/lib/types";

const PAGE_SIZE = 20;

export default function BlocksPage() {
  const [blocks, setBlocks] = useState<BlockSummary[]>([]);
  const [headHeight, setHeadHeight] = useState<number | null>(null);
  const [pageEnd, setPageEnd] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(async (endBlock?: number) => {
    setLoading(true);
    setError(null);
    try {
      // If no endBlock, fetch the latest head first
      let to = endBlock;
      if (to === undefined) {
        const statsRes = await fetch("/api/stats");
        if (statsRes.ok) {
          const stats = await statsRes.json();
          to = stats.blockHeight;
          setHeadHeight(stats.blockHeight);
        } else {
          throw new Error("Failed to fetch chain stats");
        }
      }

      const from = Math.max(0, to! - PAGE_SIZE + 1);
      const res = await fetch(`/api/blocks/range?from=${from}&to=${to}`);
      if (!res.ok) throw new Error("Failed to fetch blocks");

      const data = await res.json();
      setBlocks(data.blocks.sort((a: BlockSummary, b: BlockSummary) => b.number - a.number));
      setPageEnd(to!);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load blocks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  const hasNewer = pageEnd !== null && headHeight !== null && pageEnd < headHeight;
  const hasOlder = pageEnd !== null && pageEnd - PAGE_SIZE >= 0;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Blocks</h1>
        <p className="text-xs text-muted-foreground">
          {headHeight !== null ? `Latest: #${headHeight.toLocaleString()}` : "Loading..."}
        </p>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={() => fetchPage(pageEnd ?? undefined)} />
      ) : loading ? (
        <SkeletonRows rows={10} />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-xs text-muted-foreground">
                  <th className="px-4 py-2.5 text-left font-medium">Block</th>
                  <th className="px-4 py-2.5 text-left font-medium">Hash</th>
                  <th className="px-4 py-2.5 text-left font-medium hidden md:table-cell">Author</th>
                  <th className="px-4 py-2.5 text-center font-medium">Exts</th>
                  <th className="px-4 py-2.5 text-center font-medium hidden sm:table-cell">Events</th>
                  <th className="px-4 py-2.5 text-right font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {blocks.map((block) => (
                  <tr key={block.number} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/blocks/${block.number}`}
                        className="font-mono text-sm text-primary hover:underline font-medium"
                      >
                        {block.number.toLocaleString()}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="font-mono text-sm text-muted-foreground">
                        {truncateHash(block.hash, 8)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 hidden md:table-cell">
                      {block.authorId ? (
                        <Link
                          href={`/accounts/${block.authorId}`}
                          className="font-mono text-sm text-muted-foreground hover:text-foreground"
                        >
                          {truncateAddress(block.authorId, 6)}
                        </Link>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="text-sm">{block.extrinsicCount}</span>
                    </td>
                    <td className="px-4 py-2.5 text-center hidden sm:table-cell">
                      <span className="text-sm">{block.eventCount}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Timestamp ms={block.timestamp} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            hasNewer={hasNewer}
            hasOlder={hasOlder}
            onNewer={() => {
              if (pageEnd !== null) {
                const newEnd = Math.min(pageEnd + PAGE_SIZE, headHeight!);
                fetchPage(newEnd);
              }
            }}
            onOlder={() => {
              if (pageEnd !== null) {
                fetchPage(pageEnd - PAGE_SIZE);
              }
            }}
            label={
              blocks.length > 0
                ? `Blocks ${blocks[blocks.length - 1].number.toLocaleString()} – ${blocks[0].number.toLocaleString()}`
                : undefined
            }
          />
        </>
      )}
    </div>
  );
}
