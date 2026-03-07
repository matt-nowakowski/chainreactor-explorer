"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { truncateHash, truncateAddress } from "@/lib/utils";
import { Pagination, PagePagination } from "@/components/pagination";
import { Timestamp } from "@/components/timestamp";
import { SkeletonRows } from "@/components/skeleton";
import { ErrorState } from "@/components/error-state";
import type { BlockSummary } from "@/lib/types";

const PAGE_SIZE = 20;

interface IndexedBlock {
  number: number;
  hash: string;
  author: string | null;
  extrinsic_count: number;
  event_count: number;
  timestamp: number | null;
}

export default function BlocksPage() {
  const [blocks, setBlocks] = useState<BlockSummary[]>([]);
  const [headHeight, setHeadHeight] = useState<number | null>(null);
  const [pageEnd, setPageEnd] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Indexed mode state
  const [useIndexer, setUseIndexer] = useState<boolean | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Detect indexer on mount
  useEffect(() => {
    fetch("/api/indexer/status")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setUseIndexer(data != null && !data.error))
      .catch(() => setUseIndexer(false));
  }, []);

  // Indexed fetch
  const fetchIndexedPage = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/indexer/blocks?limit=${PAGE_SIZE}&page=${p}`);
      if (!res.ok) throw new Error("Failed to fetch blocks");
      const data = await res.json();
      setBlocks(
        (data.blocks as IndexedBlock[]).map((b) => ({
          number: Number(b.number),
          hash: b.hash,
          parentHash: "",
          extrinsicCount: b.extrinsic_count,
          eventCount: b.event_count,
          timestamp: b.timestamp != null ? Number(b.timestamp) : null,
          authorId: b.author,
          finalized: true,
        }))
      );
      setTotal(data.total);
      setPage(p);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  // Sidecar fetch (fallback)
  const fetchSidecarPage = useCallback(async (endBlock?: number) => {
    setLoading(true);
    setError(null);
    try {
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

  // Initial load
  useEffect(() => {
    if (useIndexer === null) return;
    if (useIndexer) {
      fetchIndexedPage(1);
    } else {
      fetchSidecarPage();
    }
  }, [useIndexer, fetchIndexedPage, fetchSidecarPage]);

  const hasNewer = pageEnd !== null && headHeight !== null && pageEnd < headHeight;
  const hasOlder = pageEnd !== null && pageEnd - PAGE_SIZE >= 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Blocks</h1>
        <p className="text-xs text-muted-foreground">
          {useIndexer && total > 0
            ? `${total.toLocaleString()} indexed blocks`
            : headHeight !== null
            ? `Latest: #${headHeight.toLocaleString()}`
            : "Loading..."}
        </p>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={() => useIndexer ? fetchIndexedPage(page) : fetchSidecarPage(pageEnd ?? undefined)} />
      ) : loading ? (
        <SkeletonRows />
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

          {useIndexer ? (
            <PagePagination page={page} totalPages={totalPages} total={total} onPage={fetchIndexedPage} />
          ) : (
            <Pagination
              hasNewer={hasNewer}
              hasOlder={hasOlder}
              onNewer={() => {
                if (pageEnd !== null) {
                  const newEnd = Math.min(pageEnd + PAGE_SIZE, headHeight!);
                  fetchSidecarPage(newEnd);
                }
              }}
              onOlder={() => {
                if (pageEnd !== null) fetchSidecarPage(pageEnd - PAGE_SIZE);
              }}
              label={
                blocks.length > 0
                  ? `Blocks ${blocks[blocks.length - 1].number.toLocaleString()} – ${blocks[0].number.toLocaleString()}`
                  : undefined
              }
            />
          )}
        </>
      )}
    </div>
  );
}
