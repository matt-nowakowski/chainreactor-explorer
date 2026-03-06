"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { truncateAddress, formatMethod } from "@/lib/utils";
import { Badge } from "@/components/badge";
import { Pagination, PagePagination } from "@/components/pagination";
import { Timestamp } from "@/components/timestamp";
import { SkeletonRows } from "@/components/skeleton";
import { ErrorState } from "@/components/error-state";
import type { ExtrinsicSummary } from "@/lib/types";

const BLOCK_WINDOW = 20;
const PAGE_SIZE = 25;

interface IndexedExtrinsic {
  block_number: number;
  extrinsic_index: number;
  pallet: string;
  method: string;
  signer: string | null;
  hash: string;
  success: boolean;
  timestamp: number | null;
}

export default function ExtrinsicsPage() {
  const [extrinsics, setExtrinsics] = useState<ExtrinsicSummary[]>([]);
  const [headHeight, setHeadHeight] = useState<number | null>(null);
  const [pageEnd, setPageEnd] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [useIndexer, setUseIndexer] = useState<boolean | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch("/api/indexer/status")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setUseIndexer(data && !data.error))
      .catch(() => setUseIndexer(false));
  }, []);

  const fetchIndexedPage = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/indexer/extrinsics?limit=${PAGE_SIZE}&page=${p}`);
      if (!res.ok) throw new Error("Failed to fetch extrinsics");
      const data = await res.json();
      setExtrinsics(
        (data.extrinsics as IndexedExtrinsic[]).map((e) => ({
          blockNumber: e.block_number,
          extrinsicIndex: e.extrinsic_index,
          method: { pallet: e.pallet, method: e.method },
          signer: e.signer,
          success: e.success,
          hash: e.hash,
          timestamp: e.timestamp,
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
          throw new Error("Failed to fetch stats");
        }
      }

      const from = Math.max(0, to! - BLOCK_WINDOW + 1);
      const res = await fetch(`/api/blocks/range?from=${from}&to=${to}`);
      if (!res.ok) throw new Error("Failed to fetch extrinsics");

      const data = await res.json();
      const sorted = (data.extrinsics as ExtrinsicSummary[]).sort((a, b) =>
        b.blockNumber !== a.blockNumber
          ? b.blockNumber - a.blockNumber
          : b.extrinsicIndex - a.extrinsicIndex
      );
      setExtrinsics(sorted);
      setPageEnd(to!);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (useIndexer === null) return;
    if (useIndexer) fetchIndexedPage(1);
    else fetchSidecarPage();
  }, [useIndexer, fetchIndexedPage, fetchSidecarPage]);

  const hasNewer = pageEnd !== null && headHeight !== null && pageEnd < headHeight;
  const hasOlder = pageEnd !== null && pageEnd - BLOCK_WINDOW >= 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Extrinsics</h1>
        <p className="text-xs text-muted-foreground">
          {useIndexer && total > 0
            ? `${total.toLocaleString()} indexed extrinsics`
            : "All extrinsics from recent blocks"}
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
                  <th className="px-4 py-2.5 text-left font-medium">ID</th>
                  <th className="px-4 py-2.5 text-left font-medium">Method</th>
                  <th className="px-4 py-2.5 text-left font-medium hidden sm:table-cell">Signer</th>
                  <th className="px-4 py-2.5 text-center font-medium">Result</th>
                  <th className="px-4 py-2.5 text-right font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {extrinsics.map((ext) => (
                  <tr
                    key={`${ext.blockNumber}-${ext.extrinsicIndex}`}
                    className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/extrinsics/${ext.blockNumber}-${ext.extrinsicIndex}`}
                        className="font-mono text-sm text-primary hover:underline font-medium"
                      >
                        {ext.blockNumber}-{ext.extrinsicIndex}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant="neutral" mono>
                        {formatMethod(ext.method.pallet, ext.method.method)}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 hidden sm:table-cell">
                      {ext.signer ? (
                        <Link
                          href={`/accounts/${ext.signer}`}
                          className="font-mono text-sm text-muted-foreground hover:text-foreground"
                        >
                          {truncateAddress(ext.signer, 6)}
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">Unsigned</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <Badge variant={ext.success ? "success" : "error"}>
                        {ext.success ? "Success" : "Failed"}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Timestamp ms={ext.timestamp} />
                    </td>
                  </tr>
                ))}
                {extrinsics.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-xs text-muted-foreground">
                      No extrinsics found
                    </td>
                  </tr>
                )}
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
                if (pageEnd !== null) fetchSidecarPage(Math.min(pageEnd + BLOCK_WINDOW, headHeight!));
              }}
              onOlder={() => {
                if (pageEnd !== null) fetchSidecarPage(pageEnd - BLOCK_WINDOW);
              }}
              label={pageEnd !== null ? `Blocks ${Math.max(0, pageEnd - BLOCK_WINDOW + 1).toLocaleString()} – ${pageEnd.toLocaleString()}` : undefined}
            />
          )}
        </>
      )}
    </div>
  );
}
