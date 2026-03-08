"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_PAYMENT_DASHBOARD, GET_PAYMENT_REQUESTS } from "@/lib/graphql/queries";
import { formatCurrency, formatDateTime, getStatusColor } from "@/lib/utils";
import { Smartphone, CheckCircle, XCircle, Clock, ArrowRight, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import { isNullListError } from "@/lib/error-utils";

const PAGE_SIZE = 10;

export default function PaymentDashboardPage() {
  const [page, setPage] = useState(0);
  const { data: dashData, loading: dashLoading } = useQuery(GET_PAYMENT_DASHBOARD);
  const { data: reqData, loading: reqLoading, error: reqError } = useQuery(GET_PAYMENT_REQUESTS, {
    variables: { page, size: PAGE_SIZE },
  });

  const dashboard = dashData?.paymentDashboard;
  const requests = reqData?.paymentRequests?.content || [];
  const totalElements = reqData?.paymentRequests?.totalElements || 0;
  const totalPages = reqData?.paymentRequests?.totalPages || 0;

  if (dashLoading || reqLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-[3px] border-muted border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Payment Gateway</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Mobile money & bank payment integrations</p>
        </div>
        <Link
          href="/dashboard/payments/requests"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm text-sm"
        >
          View All Requests
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Today&apos;s Payments</h3>
            <Smartphone className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-2xl font-bold tabular-nums">{dashboard?.totalPaymentsToday ?? 0}</p>
          <p className="text-xs opacity-80 mt-1">Total transactions</p>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Completed</h3>
            <CheckCircle className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-2xl font-bold tabular-nums">{dashboard?.completedPayments ?? 0}</p>
          <p className="text-xs opacity-80 mt-1">Successful payments</p>
        </div>

        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Failed</h3>
            <XCircle className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-2xl font-bold tabular-nums">{dashboard?.failedPayments ?? 0}</p>
          <p className="text-xs opacity-80 mt-1">Failed payments</p>
        </div>

        <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Pending</h3>
            <Clock className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-2xl font-bold tabular-nums">{dashboard?.pendingPayments ?? 0}</p>
          <p className="text-xs opacity-80 mt-1">Awaiting callback</p>
        </div>
      </div>

      {/* Provider Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl border border-border p-6 card-interactive">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">M-Pesa</h3>
              <p className="text-xs text-muted-foreground">Vodacom Tanzania</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{dashboard?.mpesaCount ?? 0}</p>
          <p className="text-sm text-muted-foreground">transactions today</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 card-interactive">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Tigopesa</h3>
              <p className="text-xs text-muted-foreground">Airtel Money</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{dashboard?.tigopesaCount ?? 0}</p>
          <p className="text-sm text-muted-foreground">transactions today</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 card-interactive">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">NMB Bank</h3>
              <p className="text-xs text-muted-foreground">Bank Transfer</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{dashboard?.nmbCount ?? 0}</p>
          <p className="text-sm text-muted-foreground">transactions today</p>
        </div>
      </div>

      {/* Recent Payment Requests */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Recent Payment Requests {totalElements > 0 && <span className="text-muted-foreground font-normal text-sm">({totalElements})</span>}</h2>
          <Link href="/dashboard/payments/requests" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        {reqError && !isNullListError(reqError) ? (
          <div className="p-6"><ErrorDisplay error={reqError} /></div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No payment requests yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Request #</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Provider</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Member</th>
                  <th className="text-right py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Purpose</th>
                  <th className="text-center py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req: any) => (
                  <tr key={req.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-6 text-sm">
                      <Link href={`/dashboard/payments/requests/${req.id}`} className="text-primary hover:underline font-medium">
                        {req.requestNumber}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-sm font-medium">{req.provider}</td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">
                      {req.member ? `${req.member.firstName} ${req.member.lastName}` : "N/A"}
                    </td>
                    <td className="py-4 px-6 text-sm text-right font-semibold">{formatCurrency(req.amount)}</td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">{req.purpose || "N/A"}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">{formatDateTime(req.initiatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, totalElements)} of {totalElements}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
