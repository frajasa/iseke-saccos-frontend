"use client";

import { ApolloError } from "@apollo/client";
import { WifiOff, ServerCrash, AlertTriangle, RefreshCw } from "lucide-react";
import { classifyError, getUserFriendlyMessage, ErrorType } from "@/lib/error-utils";

interface ErrorDisplayProps {
  error?: ApolloError | Error | unknown;
  variant?: "inline" | "full-page" | "card";
  title?: string;
  message?: string;
  onRetry?: () => void;
}

const iconMap: Record<ErrorType, typeof WifiOff> = {
  network: WifiOff,
  graphql: ServerCrash,
  "not-found": AlertTriangle,
  unknown: AlertTriangle,
};

const titleMap: Record<ErrorType, string> = {
  network: "Connection Error",
  graphql: "Server Error",
  "not-found": "Not Found",
  unknown: "Something Went Wrong",
};

export default function ErrorDisplay({
  error,
  variant = "inline",
  title,
  message,
  onRetry,
}: ErrorDisplayProps) {
  const errorType = classifyError(error);
  const Icon = iconMap[errorType];
  const displayTitle = title || titleMap[errorType];
  const displayMessage = message || getUserFriendlyMessage(error);

  if (variant === "full-page") {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/10 mb-5">
            <Icon className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">{displayTitle}</h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{displayMessage}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-medium text-sm transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className="p-4 bg-destructive/5 border border-destructive/15 rounded-xl animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-destructive/10 rounded-lg shrink-0">
            <Icon className="w-4 h-4 text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{displayTitle}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{displayMessage}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-sm text-primary hover:text-primary/80 font-medium mt-2 inline-flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // inline variant
  return (
    <div className="py-12 px-6 text-center animate-fade-in">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-destructive/10 mb-4">
        <Icon className="w-7 h-7 text-destructive" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{displayTitle}</h3>
      <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">{displayMessage}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-medium text-sm transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
}
