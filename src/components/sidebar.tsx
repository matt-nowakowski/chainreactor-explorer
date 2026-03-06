"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./sidebar-provider";
import { useTheme } from "./theme-provider";
import {
  Home,
  Box,
  ArrowLeftRight,
  Sparkles,
  ArrowRightLeft,
  Shield,
  Globe,
  Moon,
  Sun,
} from "lucide-react";

const chainName = process.env.NEXT_PUBLIC_CHAIN_NAME || "Chain Reactor";
const initials = chainName.slice(0, 2).toUpperCase();

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/blocks", label: "Blocks", icon: Box },
  { href: "/extrinsics", label: "Extrinsics", icon: ArrowLeftRight },
  { href: "/events", label: "Events", icon: Sparkles },
  { href: "/transfers", label: "Transfers", icon: ArrowRightLeft },
  { href: "/validators", label: "Validators", icon: Shield },
  { href: "/network", label: "Network", icon: Globe },
];

interface Stats {
  blockHeight: number;
}

export function Sidebar() {
  const { open } = useSidebar();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const data = await res.json();
          setStats({ blockHeight: data.blockHeight });
        }
      } catch { /* ignore */ }
    }
    fetchStats();
    const id = setInterval(fetchStats, 6000);
    return () => clearInterval(id);
  }, []);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <aside
      className="fixed inset-y-0 left-0 z-30 flex w-[256px] flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200 ease-linear"
      style={{ transform: open ? "translateX(0)" : "translateX(-100%)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <span className="text-xs font-bold text-primary-foreground">{initials}</span>
        </div>
        <span className="font-[family-name:var(--font-sans)] text-[15px] font-[900] italic uppercase tracking-[-0.02em]">
          {chainName}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-sidebar-accent text-primary font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-5 pb-5 space-y-3">
        {stats && (
          <div className="flex items-center gap-2 text-xs text-sidebar-foreground/60">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Height</span>
            <span className="ml-auto font-mono font-medium text-sidebar-foreground">
              {stats.blockHeight.toLocaleString()}
            </span>
          </div>
        )}
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent transition-colors hover:bg-sidebar-accent/80"
          title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
        >
          {resolvedTheme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
