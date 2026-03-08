"use client";

import ErrorDisplay from "@/components/ui/ErrorDisplay";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <ErrorDisplay
        error={error}
        variant="full-page"
        onRetry={reset}
      />
    </div>
  );
}
