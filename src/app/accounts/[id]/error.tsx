"use client";

import { ErrorState } from "@/components/error-state";

export default function AccountError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Account not found"
      message={error.message || "This account could not be loaded. Check the address and try again."}
      onRetry={reset}
    />
  );
}
