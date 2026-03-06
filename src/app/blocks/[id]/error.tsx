"use client";

import { ErrorState } from "@/components/error-state";

export default function BlockError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Block not found"
      message={error.message || "This block could not be loaded. The Sidecar API may be unavailable."}
      onRetry={reset}
    />
  );
}
