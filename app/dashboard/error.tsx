"use client";

import ErrorDisplay from "@/components/ui/ErrorDisplay";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorDisplay
      error={error}
      variant="full-page"
      onRetry={reset}
    />
  );
}
