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

export function PagePagination({
  page,
  totalPages,
  onPage,
  total,
}: {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
  total?: number;
}) {
  return (
    <div className="flex items-center justify-between pt-3">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
        className="rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
      >
        ← Prev
      </button>
      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages.toLocaleString()}
        {total !== undefined && ` (${total.toLocaleString()} total)`}
      </span>
      <button
        onClick={() => onPage(page + 1)}
        disabled={page >= totalPages}
        className="rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next →
      </button>
    </div>
  );
}
