"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchBar } from "./search-bar";
import { ThemeToggle } from "./theme-toggle";

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/blocks", label: "Blocks" },
  { href: "/extrinsics", label: "Extrinsics" },
  { href: "/events", label: "Events" },
  { href: "/transfers", label: "Transfers" },
  { href: "/validators", label: "Validators" },
  { href: "/network", label: "Network" },
];

interface Stats {
  blockHeight: number;
  finalizedHeight: number;
  chainName?: string;
}

export function ChainHeader() {
  const pathname = usePathname();
  const [stats, setStats] = useState<Stats | null>(null);

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

  const chainName = stats?.chainName || "Explorer";
  const initials = chainName.slice(0, 2).toUpperCase();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="border-b bg-card">
      {/* Top bar */}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <span className="text-xs font-bold text-primary-foreground">{initials}</span>
            </div>
            <span className="text-sm font-semibold tracking-tight">{chainName}</span>
          </Link>

          {stats && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-3 w-px bg-border" />
              <div>
                <span className="text-foreground/50">Height</span>{" "}
                <span className="font-mono font-medium text-foreground">
                  {stats.blockHeight.toLocaleString()}
                </span>
              </div>
              <div className="hidden sm:block">
                <span className="text-foreground/50">Finalized</span>{" "}
                <span className="font-mono font-medium text-foreground">
                  {stats.finalizedHeight.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <SearchBar />
          <ThemeToggle />
        </div>
      </div>

      {/* Navigation */}
      <div className="mx-auto max-w-6xl overflow-x-auto px-4">
        <nav className="flex items-center gap-0.5 -mb-px">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 border-b-2 px-3 py-2 text-xs font-medium transition-colors ${
                isActive(link.href)
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
