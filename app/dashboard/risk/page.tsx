"use client";

import { useQuery, useMutation } from "@apollo/client";
import {
  GET_RISK_DASHBOARD,
  GET_RISK_ALERTS,
  BATCH_RECALCULATE_SCORES,
} from "@/lib/graphql/queries";
import { RiskDashboard, RiskAlert } from "@/lib/types";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import { isNullListError } from "@/lib/error-utils";
import { toast } from "sonner";
import { Loader2, ShieldCheck, AlertTriangle, Users, BarChart3, RefreshCw } from "lucide-react";
import Link from "next/link";

const RISK_COLORS: Record<string, string> = {
  VERY_LOW: "bg-green-500",
  LOW: "bg-emerald-400",
  MODERATE: "bg-yellow-400",
  HIGH: "bg-orange-500",
  VERY_HIGH: "bg-red-500",
};

export default function RiskDashboardPage() {
  const { data, loading, error } = useQuery(GET_RISK_DASHBOARD);
  const {
    data: alertsData,
    loading: alertsLoading,
    error: alertsError,
  } = useQuery(GET_RISK_ALERTS, { variables: { page: 0, size: 5 } });

  const [batchRecalculate, { loading: batchLoading }] = useMutation(BATCH_RECALCULATE_SCORES, {
    onCompleted: (d) => toast.success(`Recalculated scores for ${d.batchRecalculateScores} members`),
    onError: (err) => toast.error(err.message),
    refetchQueries: [{ query: GET_RISK_DASHBOARD }],
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-[3px] border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  if (error && !isNullListError(error)) return <ErrorDisplay error={error} />;

  const dashboard: RiskDashboard | null = data?.riskDashboard || null;
  const alerts: RiskAlert[] = alertsData?.riskAlerts?.content || [];
  const totalAlerts = alertsData?.riskAlerts?.totalElements || 0;

  const distribution = dashboard?.riskDistribution
    ? Object.entries(dashboard.riskDistribution)
    : [];
  const totalDistribution = distribution.reduce((sum, [, v]) => sum + (v as number), 0) || 1;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Risk Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Overview of credit risk across all members
            </p>
          </div>
        </div>
        <button
          onClick={() => batchRecalculate()}
          disabled={batchLoading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-2"
        >
          {batchLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Recalculate All
        </button>
      </div>

      {/* Stats Cards */}
      {dashboard && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Scored Members</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {dashboard.scoredMembers}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                / {dashboard.totalMembers}
              </span>
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-muted-foreground">Average Score</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{dashboard.averageScore}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-muted-foreground">Critical Alerts</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{dashboard.criticalAlerts}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span className="text-sm text-muted-foreground">Warning Alerts</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">{dashboard.warningAlerts}</p>
          </div>
        </div>
      )}

      {/* Risk Distribution */}
      {distribution.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">Risk Distribution</h3>
          <div className="space-y-3">
            {distribution.map(([level, count]) => (
              <div key={level} className="flex items-center gap-3">
                <span className="w-24 text-sm text-muted-foreground">
                  {level.replace(/_/g, " ")}
                </span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full ${RISK_COLORS[level] || "bg-gray-400"}`}
                    style={{
                      width: `${((count as number) / totalDistribution) * 100}%`,
                    }}
                  />
                </div>
                <span className="w-12 text-sm font-medium text-foreground text-right">
                  {count as number}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Alerts */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">Recent Unresolved Alerts</h3>
          {totalAlerts > 5 && (
            <Link
              href="/dashboard/risk/alerts"
              className="text-sm text-primary hover:underline"
            >
              View all ({totalAlerts})
            </Link>
          )}
        </div>
        {alertsLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : alertsError && !isNullListError(alertsError) ? (
          <div className="p-6">
            <ErrorDisplay error={alertsError} />
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No unresolved alerts
          </div>
        ) : (
          <div className="divide-y divide-border">
            {alerts.map((alert) => (
              <div key={alert.id} className="px-6 py-4 flex items-center gap-4">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    alert.severity === "CRITICAL" ? "bg-red-500" : "bg-amber-500"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {alert.alertType.replace(/_/g, " ")} &middot;{" "}
                    {new Date(alert.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    alert.severity === "CRITICAL"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  }`}
                >
                  {alert.severity}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
