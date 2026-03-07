"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatMethod } from "@/lib/utils";
import { Badge } from "@/components/badge";
import { Pagination, PagePagination } from "@/components/pagination";
import { Timestamp } from "@/components/timestamp";
import { SkeletonRows } from "@/components/skeleton";
import { ErrorState } from "@/components/error-state";
import type { EventSummary } from "@/lib/types";

const BLOCK_WINDOW = 20;
const PAGE_SIZE = 25;

const HIDDEN_PALLETS = new Set(["system", "paraInherent"]);

interface IndexedEvent {
  block_number: number;
  event_index: number;
  extrinsic_index: number | null;
  pallet: string;
  method: string;
  data: string | null;
  timestamp: number | null;
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [headHeight, setHeadHeight] = useState<number | null>(null);
  const [pageEnd, setPageEnd] = useState<number | null>(null);
  const [showSystem, setShowSystem] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [useIndexer, setUseIndexer] = useState<boolean | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch("/api/indexer/status")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setUseIndexer(data != null && !data.error))
      .catch(() => setUseIndexer(false));
  }, []);

  const fetchIndexedPage = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/indexer/events?limit=${PAGE_SIZE}&page=${p}`);
      if (!res.ok) throw new Error("Failed to fetch events");
      const data = await res.json();
      setEvents(
        (data.events as IndexedEvent[]).map((e) => ({
          blockNumber: e.block_number,
          eventIndex: e.event_index,
          extrinsicIndex: e.extrinsic_index,
          method: { pallet: e.pallet, method: e.method },
          data: e.data ? (typeof e.data === "string" ? JSON.parse(e.data) : e.data) : [],
          timestamp: e.timestamp != null ? Number(e.timestamp) : null,
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
      if (!res.ok) throw new Error("Failed to fetch events");

      const data = await res.json();
      const sorted = (data.events as EventSummary[]).sort((a, b) =>
        b.blockNumber !== a.blockNumber
          ? b.blockNumber - a.blockNumber
          : b.eventIndex - a.eventIndex
      );
      setEvents(sorted);
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

  const displayed = showSystem
    ? events
    : events.filter((e) => !HIDDEN_PALLETS.has(e.method.pallet));

  const hasNewer = pageEnd !== null && headHeight !== null && pageEnd < headHeight;
  const hasOlder = pageEnd !== null && pageEnd - BLOCK_WINDOW >= 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Events</h1>
          <p className="text-xs text-muted-foreground">
            {useIndexer && total > 0
              ? `${total.toLocaleString()} indexed events`
              : "All events from recent blocks"}
          </p>
        </div>
        <button
          onClick={() => setShowSystem(!showSystem)}
          className="rounded-md border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted"
        >
          {showSystem ? "Hide" : "Show"} system events
        </button>
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
                  <th className="px-4 py-2.5 text-left font-medium hidden sm:table-cell">Extrinsic</th>
                  <th className="px-4 py-2.5 text-left font-medium">Method</th>
                  <th className="px-4 py-2.5 text-left font-medium hidden md:table-cell">Data</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((event, i) => (
                  <tr
                    key={`${event.blockNumber}-${event.eventIndex}-${i}`}
                    className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/blocks/${event.blockNumber}`}
                        className="font-mono text-sm text-primary hover:underline"
                      >
                        {event.blockNumber.toLocaleString()}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 hidden sm:table-cell">
                      {event.extrinsicIndex !== null ? (
                        <Link
                          href={`/extrinsics/${event.blockNumber}-${event.extrinsicIndex}`}
                          className="font-mono text-sm text-primary hover:underline"
                        >
                          {event.blockNumber}-{event.extrinsicIndex}
                        </Link>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant="neutral" mono>
                        {formatMethod(event.method.pallet, event.method.method)}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 hidden md:table-cell max-w-xs">
                      {event.data.length > 0 ? (
                        <details className="group">
                          <summary className="cursor-pointer font-mono text-sm text-muted-foreground truncate max-w-[300px] hover:text-foreground">
                            {JSON.stringify(event.data).slice(0, 80)}
                            {JSON.stringify(event.data).length > 80 ? "..." : ""}
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
                {displayed.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-xs text-muted-foreground">
                      No events found
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
