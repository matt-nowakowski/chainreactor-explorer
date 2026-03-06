"use client";

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
        <span className="text-lg text-destructive">!</span>
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        {message && (
          <p className="mt-1 text-xs text-muted-foreground">{message}</p>
        )}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
        >
          Try again
        </button>
      )}
    </div>
  );
}
