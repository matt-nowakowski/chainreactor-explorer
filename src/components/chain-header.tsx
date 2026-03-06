"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SearchBar } from "./search-bar";

const chainName = process.env.NEXT_PUBLIC_CHAIN_NAME || "Chain Reactor";

interface Stats {
  blockHeight: number;
  finalizedHeight: number;
  tokenSymbol: string;
}

export function ChainHeader() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) setStats(await res.json());
      } catch {}
    }
    fetchStats();
    const id = setInterval(fetchStats, 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <span className="text-xs font-bold text-primary-foreground">CR</span>
            </div>
            <span className="text-sm font-semibold tracking-tight">{chainName}</span>
          </Link>

          {stats && (
            <div className="hidden items-center gap-4 text-xs text-muted-foreground sm:flex">
              <div>
                <span className="text-foreground/50">Height</span>{" "}
                <span className="font-mono font-medium text-foreground">
                  {stats.blockHeight.toLocaleString()}
                </span>
              </div>
              <div className="h-3 w-px bg-border" />
              <div>
                <span className="text-foreground/50">Finalized</span>{" "}
                <span className="font-mono font-medium text-foreground">
                  {stats.finalizedHeight.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        <SearchBar />
      </div>
    </header>
  );
}
