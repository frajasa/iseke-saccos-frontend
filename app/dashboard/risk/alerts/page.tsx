"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_RISK_ALERTS, RESOLVE_RISK_ALERT } from "@/lib/graphql/queries";
import { RiskAlert } from "@/lib/types";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import { isNullListError } from "@/lib/error-utils";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

export default function RiskAlertsPage() {
  const [page, setPage] = useState(0);
  const size = 20;

  const { data, loading, error, refetch } = useQuery(GET_RISK_ALERTS, {
    variables: { page, size },
  });

  const [resolveAlert, { loading: resolving }] = useMutation(RESOLVE_RISK_ALERT, {
    onCompleted: () => {
      toast.success("Alert resolved");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const alerts: RiskAlert[] = data?.riskAlerts?.content || [];
  const totalElements = data?.riskAlerts?.totalElements || 0;
  const totalPages = data?.riskAlerts?.totalPages || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-6 h-6 text-amber-500" />
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Risk Alerts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {totalElements} unresolved alert{totalElements !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-[3px] border-muted border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {error && !isNullListError(error) && <ErrorDisplay error={error} />}

      {!loading && alerts.length === 0 && (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-lg font-medium text-foreground">All clear</p>
          <p className="text-sm text-muted-foreground mt-1">No unresolved risk alerts</p>
        </div>
      )}

      {alerts.length > 0 && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Severity</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Member</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Message</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          alert.severity === "CRITICAL"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : alert.severity === "WARNING"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        }`}
                      >
                        {alert.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {alert.alertType.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {alert.member?.firstName} {alert.member?.lastName}
                      <br />
                      <span className="text-xs text-muted-foreground">
                        {alert.member?.memberNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-sm truncate">{alert.message}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => resolveAlert({ variables: { alertId: alert.id } })}
                        disabled={resolving}
                        className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        {resolving ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <CheckCircle className="w-3 h-3" />
                        )}
                        Resolve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Page {page + 1} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-1.5 rounded border border-border hover:bg-muted transition-colors disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-1.5 rounded border border-border hover:bg-muted transition-colors disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
