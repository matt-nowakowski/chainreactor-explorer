"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { BlockSummary } from "@/lib/types";

const MAX_BLOCKS = 30;

export function useLatestBlocks(initialBlocks: BlockSummary[]) {
  const [blocks, setBlocks] = useState<BlockSummary[]>(initialBlocks);
  const lastBlockRef = useRef(initialBlocks[0]?.number ?? 0);

  const poll = useCallback(async () => {
    try {
      const res = await fetch("/api/blocks/latest");
      if (!res.ok) return;
      const data: BlockSummary[] = await res.json();
      if (!data.length) return;

      const newest = data[0].number;
      if (newest <= lastBlockRef.current) return;
      lastBlockRef.current = newest;

      setBlocks((prev) => {
        const existing = new Set(prev.map((b) => b.number));
        const newBlocks = data.filter((b) => !existing.has(b.number));
        return [...newBlocks, ...prev].slice(0, MAX_BLOCKS);
      });
    } catch {
      // silently retry on next interval
    }
  }, []);

  useEffect(() => {
    const id = setInterval(poll, 6000);
    return () => clearInterval(id);
  }, [poll]);

  return blocks;
}
