"use client";

import { useQuery } from "@apollo/client";
import { GET_FRAUD_DASHBOARD_STATS } from "@/lib/graphql/queries";
import { FraudDashboardStats } from "@/lib/types";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import { Loader2, ShieldAlert, AlertTriangle, Search, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function FraudDashboardPage() {
  const { data, loading, error } = useQuery(GET_FRAUD_DASHBOARD_STATS);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) return <ErrorDisplay message={error.message} />;

  const stats: FraudDashboardStats = data?.fraudDashboardStats || {
    totalFraudAlerts: 0,
    unresolvedFraudAlerts: 0,
    openInvestigations: 0,
    transactionAlerts: 0,
    accountAlerts: 0,
    internalAlerts: 0,
  };

  const cards = [
    { label: "Total Fraud Alerts", value: stats.totalFraudAlerts, icon: ShieldAlert, color: "text-destructive" },
    { label: "Unresolved Alerts", value: stats.unresolvedFraudAlerts, icon: AlertTriangle, color: "text-amber-600" },
    { label: "Open Investigations", value: stats.openInvestigations, icon: Search, color: "text-blue-600" },
  ];

  const categories = [
    { label: "Transaction Fraud", value: stats.transactionAlerts, color: "bg-red-500", total: stats.totalFraudAlerts },
    { label: "Account Fraud", value: stats.accountAlerts, color: "bg-amber-500", total: stats.totalFraudAlerts },
    { label: "Internal Fraud", value: stats.internalAlerts, color: "bg-purple-500", total: stats.totalFraudAlerts },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Fraud Detection Dashboard</h1>
        <p className="text-muted-foreground">Monitor and investigate suspicious activities</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
              </div>
              <card.icon className={`h-8 w-8 ${card.color} opacity-50`} />
            </div>
          </div>
        ))}
      </div>

      {/* Category Breakdown */}
      <div className="bg-card border border-border rounded-lg p-5">
        <h2 className="text-lg font-semibold text-foreground mb-4">Alert Categories</h2>
        <div className="space-y-4">
          {categories.map((cat) => {
            const pct = cat.total > 0 ? (cat.value / cat.total) * 100 : 0;
            return (
              <div key={cat.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{cat.label}</span>
                  <span className="text-sm text-muted-foreground">{cat.value} alerts</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${cat.color}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/dashboard/fraud/alerts"
          className="bg-card border border-border rounded-lg p-5 hover:border-primary/50 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Fraud Alerts</h3>
              <p className="text-sm text-muted-foreground">View and resolve fraud alerts</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </Link>
        <Link
          href="/dashboard/fraud/investigations"
          className="bg-card border border-border rounded-lg p-5 hover:border-primary/50 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Investigations</h3>
              <p className="text-sm text-muted-foreground">Manage fraud investigations</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </Link>
      </div>
    </div>
  );
}
