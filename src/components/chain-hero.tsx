"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

const chainName = process.env.NEXT_PUBLIC_CHAIN_NAME || "Chain Reactor";

export function ChainHero() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    if (/^\d+$/.test(q)) {
      router.push(`/blocks/${q}`);
    } else if (/^0x[a-fA-F0-9]{64}$/.test(q)) {
      router.push(`/blocks/${q}`);
    } else {
      router.push(`/accounts/${q}`);
    }
    setQuery("");
  }

  return (
    <div className="rounded-xl bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-transparent px-8 py-8 dark:from-blue-500/20 dark:via-blue-500/5">
      <h1 className="text-2xl font-bold">{chainName} Explorer</h1>
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
