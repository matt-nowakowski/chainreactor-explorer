"use client";

export function Pagination({
  hasNewer,
  hasOlder,
  onNewer,
  onOlder,
  label,
}: {
  hasNewer: boolean;
  hasOlder: boolean;
  onNewer: () => void;
  onOlder: () => void;
  label?: string;
}) {
  return (
    <div className="flex items-center justify-between pt-3">
      <button
        onClick={onNewer}
        disabled={!hasNewer}
        className="rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
      >
        ← Newer
      </button>
      {label && (
        <span className="text-sm text-muted-foreground">{label}</span>
      )}
      <button
        onClick={onOlder}
        disabled={!hasOlder}
        className="rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Older →
      </button>
    </div>
  );
}
