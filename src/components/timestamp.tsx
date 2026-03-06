"use client";

import { useState, useEffect } from "react";
import { timeAgo, formatTimestamp } from "@/lib/utils";

export function Timestamp({ ms }: { ms: number | null }) {
  const [, setTick] = useState(0);

  // Re-render every 10s to keep relative time fresh
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 10_000);
    return () => clearInterval(id);
  }, []);

  if (!ms) return <span className="text-xs text-muted-foreground">—</span>;

  return (
    <span
      className="text-xs text-muted-foreground cursor-default"
      title={formatTimestamp(ms)}
    >
      {timeAgo(ms)}
    </span>
  );
}
