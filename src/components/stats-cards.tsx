"use client";

import { useState, useEffect } from "react";
import { formatBalance, formatNumber } from "@/lib/utils";
import { Skeleton } from "./skeleton";
import type { NetworkStats } from "@/lib/types";

export function StatsCards() {
  const [stats, setStats] = useState<NetworkStats | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) setStats(await res.json());
      } catch { /* ignore */ }
    }
    fetchStats();
    const id = setInterval(fetchStats, 6000);
    return () => clearInterval(id);
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="rounded-lg border p-3 space-y-1.5">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    { label: "Block Height", value: formatNumber(stats.blockHeight) },
    { label: "Finalized", value: formatNumber(stats.finalizedHeight) },
    {
      label: "Total Supply",
      value: `${formatBalance(stats.totalIssuance, stats.tokenDecimals, 0)} ${stats.tokenSymbol}`,
    },
    { label: "Validators", value: String(stats.validatorCount) },
    { label: "Block Time", value: `${(stats.avgBlockTime / 1000).toFixed(1)}s` },
    { label: "Peers", value: String(stats.peerCount) },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {card.label}
          </p>
          <p className="mt-1 font-mono text-sm font-semibold tabular-nums">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
