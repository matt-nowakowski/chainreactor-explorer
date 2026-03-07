"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";

export function ChainHero() {
  const [query, setQuery] = useState("");
  const [chainName, setChainName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchName() {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const data = await res.json();
          if (data.chainName) setChainName(data.chainName);
        }
      } catch { /* ignore */ }
    }
    fetchName();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    // Try indexer search first for hash lookups
    if (/^0x[a-fA-F0-9]{64}$/.test(q)) {
      try {
        const res = await fetch(`/api/indexer/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.result) {
            if (data.result.type === "block") {
              router.push(`/blocks/${data.result.value}`);
              setQuery("");
              return;
            }
            if (data.result.type === "extrinsic") {
              router.push(`/extrinsics/${data.result.value}`);
              setQuery("");
              return;
            }
          }
        }
      } catch { /* fall through to default */ }
      router.push(`/blocks/${q}`);
    } else if (/^\d+$/.test(q)) {
      router.push(`/blocks/${q}`);
    } else {
      router.push(`/accounts/${q}`);
    }
    setQuery("");
  }

  return (
    <div className="rounded-xl bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-transparent px-8 py-8 dark:from-blue-500/20 dark:via-blue-500/5">
      {chainName ? (
        <h1 className="text-2xl font-bold">{chainName} Explorer</h1>
      ) : (
        <div className="h-8 w-48 rounded bg-muted/50 animate-pulse" />
      )}
      <p className="mt-1 text-sm text-muted-foreground">
        Blockchain explorer and analytics platform
      </p>
      <form onSubmit={handleSubmit} className="mt-5 flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by address / block number / block hash..."
          className="h-11 flex-1 rounded-full border bg-background px-5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          className="h-11 rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Search
        </button>
      </form>
    </div>
  );
}
