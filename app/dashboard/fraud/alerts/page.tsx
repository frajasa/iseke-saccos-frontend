"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_FRAUD_ALERTS, RESOLVE_RISK_ALERT } from "@/lib/graphql/queries";
import { RiskAlert } from "@/lib/types";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import { isNullListError } from "@/lib/error-utils";
import { formatDate, getStatusColor } from "@/lib/utils";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Filter,
} from "lucide-react";

const CATEGORIES = [
  { value: "", label: "All Fraud Alerts" },
  { value: "FRAUD_TRANSACTION", label: "Transaction" },
  { value: "FRAUD_ACCOUNT", label: "Account" },
  { value: "FRAUD_INTERNAL", label: "Internal" },
];

function getSeverityBadge(severity: string) {
  if (severity === "CRITICAL") return "bg-destructive/10 text-destructive border-destructive/20";
  if (severity === "WARNING") return "bg-amber-500/10 text-amber-600 border-amber-500/20";
  return "bg-muted text-muted-foreground border-border";
}

export default function FraudAlertsPage() {
  const [page, setPage] = useState(0);
  const [category, setCategory] = useState("");
  const size = 20;

  const { data, loading, error, refetch } = useQuery(GET_FRAUD_ALERTS, {
    variables: { category: category || null, page, size },
  });

  const [resolveAlert, { loading: resolving }] = useMutation(RESOLVE_RISK_ALERT, {
    onCompleted: () => {
      toast.success("Alert resolved");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const alerts: RiskAlert[] = data?.fraudAlerts?.content || [];
  const totalElements = data?.fraudAlerts?.totalElements || 0;
  const totalPages = data?.fraudAlerts?.totalPages || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !isNullListError(error)) {
    return <ErrorDisplay message={error.message} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fraud Alerts</h1>
          <p className="text-muted-foreground">{totalElements} alert(s)</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(0); }}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Severity</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Category</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Member</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Message</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <ShieldAlert className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    No fraud alerts found
                  </td>
                </tr>
              ) : (
                alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-mono">
                      {alert.alertType.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getSeverityBadge(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="text-xs px-2 py-0.5 bg-muted rounded">
                        {(alert.alertCategory || "RISK").replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium">{alert.member.firstName} {alert.member.lastName}</div>
                      <div className="text-xs text-muted-foreground">{alert.member.memberNumber}</div>
                    </td>
                    <td className="px-4 py-3 text-sm max-w-xs truncate">{alert.message}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(alert.createdAt)}</td>
                    <td className="px-4 py-3 text-center">
                      {alert.isResolved ? (
                        <span className="text-xs text-success flex items-center justify-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Resolved
                        </span>
                      ) : (
                        <button
                          onClick={() => resolveAlert({ variables: { alertId: alert.id } })}
                          disabled={resolving}
                          className="px-2.5 py-1 text-xs rounded-lg bg-success/10 text-success hover:bg-success/20 border border-success/20"
                        >
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
            <span className="text-sm text-muted-foreground">
              Page {page + 1} of {totalPages} ({totalElements} total)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="p-1 rounded hover:bg-muted disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="p-1 rounded hover:bg-muted disabled:opacity-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
