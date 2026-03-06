"use client";

import Link from "next/link";
import { useLiveFeed } from "@/hooks/use-live-feed";
import { truncateAddress, formatMethod } from "@/lib/utils";
import { LiveIndicator } from "./live-indicator";
import { Badge } from "./badge";
import { Timestamp } from "./timestamp";
import { Box, ArrowLeftRight } from "lucide-react";
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
            <span className="text-xs font-semibold">Latest Blocks</span>
            <Link href="/blocks" className="text-xs text-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y">
            {blocks.slice(0, 8).map((block) => (
              <div
                key={block.number}
                className={`flex items-center justify-between px-4 py-3 transition-colors ${
                  newBlockNumbers.has(block.number)
                    ? "animate-[highlight-new_1.5s_ease-out]"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <Box className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <Link
                      href={`/blocks/${block.number}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {block.number.toLocaleString()}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {block.authorId ? `Author ${truncateAddress(block.authorId, 4)}` : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Timestamp ms={block.timestamp} />
                  <p className="text-xs text-muted-foreground">
                    {block.extrinsicCount} exts
                  </p>
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
            <span className="text-xs font-semibold">Latest Extrinsics</span>
            <Link href="/extrinsics" className="text-xs text-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y">
            {extrinsics.slice(0, 8).map((ext, i) => (
              <div key={`${ext.blockNumber}-${ext.extrinsicIndex}-${i}`} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <Link
                      href={`/extrinsics/${ext.blockNumber}-${ext.extrinsicIndex}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {ext.blockNumber}-{ext.extrinsicIndex}
                    </Link>
                    <div className="mt-0.5 flex items-center gap-2">
                      <Badge variant={ext.success ? "success" : "error"} mono>
                        {formatMethod(ext.method.pallet, ext.method.method)}
                      </Badge>
                      {ext.signer && (
                        <Link
                          href={`/accounts/${ext.signer}`}
                          className="text-xs font-mono text-muted-foreground hover:text-foreground"
                        >
                          {truncateAddress(ext.signer, 4)}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Timestamp ms={ext.timestamp} />
                  <div className={`h-2.5 w-2.5 rounded-full ${ext.success ? "bg-emerald-500" : "bg-red-500"}`} />
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
