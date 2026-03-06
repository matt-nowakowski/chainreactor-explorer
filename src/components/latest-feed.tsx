"use client";

import Link from "next/link";
import { useLiveFeed } from "@/hooks/use-live-feed";
import { truncateHash, truncateAddress, formatMethod } from "@/lib/utils";
import { LiveIndicator } from "./live-indicator";
import { Badge } from "./badge";
import { Timestamp } from "./timestamp";
import type { BlockSummary } from "@/lib/types";

export function LatestFeed({ initialBlocks }: { initialBlocks: BlockSummary[] }) {
  const { blocks, extrinsics, isLive, newBlockNumbers } = useLiveFeed(initialBlocks);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold">Latest Activity</h2>
        {isLive && <LiveIndicator />}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Latest Blocks */}
        <div className="rounded-lg border">
          <div className="flex items-center justify-between border-b px-4 py-2.5">
            <span className="text-xs font-medium text-muted-foreground">Latest Blocks</span>
            <Link href="/blocks" className="text-[10px] text-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y">
            {blocks.slice(0, 8).map((block) => (
              <div
                key={block.number}
                className={`flex items-center justify-between px-4 py-2.5 transition-colors ${
                  newBlockNumbers.has(block.number)
                    ? "animate-[highlight-new_1.5s_ease-out]"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-xs font-mono font-medium">
                    {block.number}
                  </div>
                  <div>
                    <Link
                      href={`/blocks/${block.number}`}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Block #{block.number.toLocaleString()}
                    </Link>
                    <p className="text-[10px] text-muted-foreground">
                      {block.extrinsicCount} extrinsics · {block.eventCount} events
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {block.authorId && (
                    <Link
                      href={`/accounts/${block.authorId}`}
                      className="text-[10px] font-mono text-muted-foreground hover:text-foreground"
                    >
                      {truncateAddress(block.authorId, 4)}
                    </Link>
                  )}
                  <Timestamp ms={block.timestamp} />
                </div>
              </div>
            ))}
            {blocks.length === 0 && (
              <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                Waiting for blocks...
              </div>
            )}
          </div>
        </div>

        {/* Latest Extrinsics */}
        <div className="rounded-lg border">
          <div className="flex items-center justify-between border-b px-4 py-2.5">
            <span className="text-xs font-medium text-muted-foreground">Latest Extrinsics</span>
            <Link href="/extrinsics" className="text-[10px] text-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y">
            {extrinsics.slice(0, 8).map((ext, i) => (
              <div key={`${ext.blockNumber}-${ext.extrinsicIndex}-${i}`} className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-[10px] font-mono">
                    Ext
                  </div>
                  <div>
                    <Link
                      href={`/extrinsics/${ext.blockNumber}-${ext.extrinsicIndex}`}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      {ext.blockNumber}-{ext.extrinsicIndex}
                    </Link>
                    <div className="mt-0.5">
                      <Badge variant={ext.success ? "success" : "error"} mono>
                        {formatMethod(ext.method.pallet, ext.method.method)}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {ext.signer && (
                    <Link
                      href={`/accounts/${ext.signer}`}
                      className="text-[10px] font-mono text-muted-foreground hover:text-foreground"
                    >
                      {truncateAddress(ext.signer, 4)}
                    </Link>
                  )}
                  <Timestamp ms={ext.timestamp} />
                </div>
              </div>
            ))}
            {extrinsics.length === 0 && (
              <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                No signed extrinsics in recent blocks
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
