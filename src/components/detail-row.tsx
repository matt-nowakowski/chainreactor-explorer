"use client";

import Link from "next/link";
import { CopyButton } from "./copy-button";

export function DetailRow({
  label,
  value,
  mono,
  copy,
  badge,
  link,
}: {
  label: string;
  value: string;
  mono?: boolean;
  copy?: boolean;
  badge?: "success" | "error";
  link?: string;
}) {
  const content = badge ? (
    <span
      className={`inline-block rounded px-1.5 py-0.5 text-[11px] font-medium ${
        badge === "success"
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-red-500/10 text-red-600 dark:text-red-400"
      }`}
    >
      {value}
    </span>
  ) : link ? (
    <Link
      href={link}
      className={`text-sm text-primary hover:underline ${mono ? "font-mono" : ""}`}
    >
      {value}
    </Link>
  ) : (
    <span className={`text-sm break-all ${mono ? "font-mono" : ""}`}>
      {value}
    </span>
  );

  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1 text-right">
        {content}
        {copy && <CopyButton value={value} />}
      </div>
    </div>
  );
}
