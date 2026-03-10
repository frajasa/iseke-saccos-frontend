"use client";

import { useQuery } from "@apollo/client/react";
import { GET_ESS_DASHBOARD } from "@/lib/graphql/queries";
import { formatCurrency, formatDateTime, getStatusColor } from "@/lib/utils";
import { Wallet, CreditCard, Receipt, Clock, BarChart3, TrendingUp } from "lucide-react";
import Link from "next/link";
import ErrorDisplay from "@/components/ui/ErrorDisplay";

export default function MemberDashboardPage() {
  const { data, loading, error } = useQuery(GET_ESS_DASHBOARD);
  const dashboard = data?.essDashboard;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-[3px] border-muted border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay error={error} variant="full-page" />;
  }

  if (!dashboard) {
    return <ErrorDisplay variant="full-page" title="Not Available" message="Dashboard data is not available." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Welcome, {dashboard.memberName}</h1>
        <p className="text-muted-foreground mt-1">
          Member #{dashboard.memberNumber}
          {dashboard.employerName && ` | ${dashboard.employerName}`}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Total Savings</h3>
            <Wallet className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-2xl font-bold tabular-nums">{formatCurrency(dashboard.totalSavings)}</p>
          <p className="text-xs opacity-80 mt-1">{dashboard.activeSavingsAccounts} active account(s)</p>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Loan Outstanding</h3>
            <CreditCard className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-2xl font-bold tabular-nums">{formatCurrency(dashboard.totalLoanOutstanding)}</p>
          <p className="text-xs opacity-80 mt-1">{dashboard.activeLoans} active loan(s)</p>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Monthly Deductions</h3>
            <Receipt className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-2xl font-bold tabular-nums">{formatCurrency(dashboard.monthlyDeductions)}</p>
          <p className="text-xs opacity-80 mt-1">from salary</p>
        </div>

        <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Pending Requests</h3>
            <Clock className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-2xl font-bold tabular-nums">
            {dashboard.recentRequests?.filter((r: any) => r.status === "PENDING").length || 0}
          </p>
          <p className="text-xs opacity-80 mt-1">awaiting review</p>
        </div>
      </div>

      {/* Share Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Shares Owned</h3>
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground tabular-nums">{dashboard.shares || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">shares</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Share Value</h3>
            <Wallet className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground tabular-nums">{formatCurrency(dashboard.shareValue || 0)}</p>
          <p className="text-xs text-muted-foreground mt-1">total value</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Max Loan Eligible</h3>
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground tabular-nums">{formatCurrency(dashboard.maxLoanByShares || 0)}</p>
          <p className="text-xs text-muted-foreground mt-1">based on shares (3x)</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/member/apply-loan"
          className="card-interactive flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Apply for a Loan</h3>
            <p className="text-sm text-muted-foreground">Submit a new loan application</p>
          </div>
        </Link>
        <Link
          href="/member/withdraw"
          className="card-interactive flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
            <Wallet className="w-6 h-6 text-success" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Request Withdrawal</h3>
            <p className="text-sm text-muted-foreground">Withdraw from your savings</p>
          </div>
        </Link>
      </div>

      {/* Recent Requests */}
      {dashboard.recentRequests && dashboard.recentRequests.length > 0 && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Recent Requests</h2>
            <Link href="/member/requests" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Request #</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                  <th className="text-right py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                  <th className="text-center py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recentRequests.map((req: any) => (
                  <tr key={req.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-6 text-sm font-medium">{req.requestNumber}</td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">{req.requestType?.replace(/_/g, " ")}</td>
                    <td className="py-4 px-6 text-sm text-right font-semibold">{req.amount ? formatCurrency(req.amount) : "N/A"}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">{formatDateTime(req.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
