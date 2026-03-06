"use client";

import Link from "next/link";
import { useLatestBlocks } from "@/hooks/use-latest-blocks";
import { truncateHash, timeAgo } from "@/lib/utils";
import type { BlockSummary } from "@/lib/types";

export function BlockList({ initialBlocks }: { initialBlocks: BlockSummary[] }) {
  const blocks = useLatestBlocks(initialBlocks);

  if (!blocks.length) {
    return (
      <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
        No blocks found
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/30 text-xs text-muted-foreground">
            <th className="px-4 py-2.5 text-left font-medium">Block</th>
            <th className="px-4 py-2.5 text-left font-medium">Hash</th>
            <th className="px-4 py-2.5 text-right font-medium">Extrinsics</th>
            <th className="px-4 py-2.5 text-right font-medium">Events</th>
            <th className="px-4 py-2.5 text-right font-medium">Time</th>
          </tr>
        </thead>
        <tbody>
          {blocks.map((block) => (
            <tr
              key={block.number}
              className="border-b last:border-0 transition-colors hover:bg-muted/20"
            >
              <td className="px-4 py-2.5">
                <Link
                  href={`/blocks/${block.number}`}
                  className="font-mono text-xs font-medium text-primary hover:underline"
                >
                  {block.number.toLocaleString()}
                </Link>
              </td>
              <td className="px-4 py-2.5">
                <Link
                  href={`/blocks/${block.hash}`}
                  className="font-mono text-xs text-muted-foreground hover:text-foreground"
                >
                  {truncateHash(block.hash, 10)}
                </Link>
              </td>
              <td className="px-4 py-2.5 text-right font-mono text-xs">
                {block.extrinsicCount}
              </td>
              <td className="px-4 py-2.5 text-right font-mono text-xs">
                {block.eventCount}
              </td>
              <td className="px-4 py-2.5 text-right text-xs text-muted-foreground">
                {block.timestamp ? timeAgo(block.timestamp) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
