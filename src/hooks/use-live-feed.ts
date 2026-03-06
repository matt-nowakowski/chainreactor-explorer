"use client";

import { useState, useEffect, useRef } from "react";
import type { BlockSummary, ExtrinsicSummary } from "@/lib/types";

const MAX_ITEMS = 30;
const POLL_INTERVAL = 6000;

export function useLiveFeed(initialBlocks: BlockSummary[]) {
  const [blocks, setBlocks] = useState<BlockSummary[]>(initialBlocks);
  const [extrinsics, setExtrinsics] = useState<ExtrinsicSummary[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [newBlockNumbers, setNewBlockNumbers] = useState<Set<number>>(new Set());
  const lastBlockRef = useRef(initialBlocks[0]?.number || 0);

  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch("/api/blocks/latest");
        if (!res.ok) return;

        const data = await res.json();
        const fetchedBlocks: BlockSummary[] = data.blocks || [];
        const fetchedExtrinsics: ExtrinsicSummary[] = data.extrinsics || [];

        if (fetchedBlocks.length > 0) {
          const newest = fetchedBlocks[0].number;

          if (newest > lastBlockRef.current) {
            // Track which blocks are new for animation
            const newNums = new Set<number>();
            for (const b of fetchedBlocks) {
              if (b.number > lastBlockRef.current) newNums.add(b.number);
            }
            setNewBlockNumbers(newNums);
            // Clear animation flags after 1.5s
            setTimeout(() => setNewBlockNumbers(new Set()), 1500);

            lastBlockRef.current = newest;
          }

          setBlocks((prev) => {
            const seen = new Set<number>();
            const merged = [...fetchedBlocks, ...prev].filter((b) => {
              if (seen.has(b.number)) return false;
              seen.add(b.number);
              return true;
            });
            return merged.slice(0, MAX_ITEMS);
          });

          setExtrinsics(fetchedExtrinsics);
          setIsLive(true);
        }
      } catch {
        setIsLive(false);
      }
    }

    poll();
    const id = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(id);
  }, []);

  return { blocks, extrinsics, isLive, newBlockNumbers };
}
