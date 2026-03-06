"use client";

import { useState, useEffect } from "react";
import { formatBalance, formatNumber } from "@/lib/utils";
import { Skeleton } from "./skeleton";
import {
  Box,
  CheckCircle,
  Clock,
  Shield,
  Coins,
  Globe,
} from "lucide-react";
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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-lg border p-5">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    { label: "Block Height", value: formatNumber(stats.blockHeight), icon: Box },
    { label: "Finalized Block", value: formatNumber(stats.finalizedHeight), icon: CheckCircle },
    { label: "Avg Block Time", value: `${(stats.avgBlockTime / 1000).toFixed(1)}s`, icon: Clock },
    { label: "Validators", value: String(stats.validatorCount), icon: Shield },
    {
      label: "Total Supply",
      value: `${formatBalance(stats.totalIssuance, stats.tokenDecimals, 0)} ${stats.tokenSymbol}`,
      icon: Coins,
    },
    { label: "Connected Peers", value: String(stats.peerCount), icon: Globe },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="flex items-center gap-4 rounded-lg border p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-500/10 dark:bg-blue-400/10">
              <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <p className="mt-0.5 font-mono text-base font-semibold tabular-nums">{card.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
