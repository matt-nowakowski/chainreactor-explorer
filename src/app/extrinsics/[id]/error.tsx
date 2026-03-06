"use client";

import { ErrorState } from "@/components/error-state";

export default function ExtrinsicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Extrinsic not found"
      message={error.message || "This extrinsic could not be loaded."}
      onRetry={reset}
    />
  );
}
