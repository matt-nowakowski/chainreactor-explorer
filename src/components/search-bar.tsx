"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    // Pure number → block page
    if (/^\d+$/.test(q)) {
      router.push(`/blocks/${q}`);
      setQuery("");
      return;
    }

    // 0x + 64 hex chars → block hash
    if (/^0x[a-fA-F0-9]{64}$/.test(q)) {
      router.push(`/blocks/${q}`);
      setQuery("");
      return;
    }

    // Anything else → account (SS58 or hex)
    router.push(`/accounts/${q}`);
    setQuery("");
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xs">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Block, hash, or address..."
        className="h-8 w-full rounded-md border bg-secondary/50 px-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      />
    </form>
  );
}
