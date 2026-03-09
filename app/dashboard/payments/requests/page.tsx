"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_PAYMENT_REQUESTS } from "@/lib/graphql/queries";
import { formatCurrency, formatDateTime, getStatusColor } from "@/lib/utils";
import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import { isNullListError } from "@/lib/error-utils";

export default function PaymentRequestsPage() {
  const [page, setPage] = useState(0);
  const [providerFilter, setProviderFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data, loading, error, refetch } = useQuery(GET_PAYMENT_REQUESTS, {
    variables: {
      provider: providerFilter || undefined,
      status: statusFilter || undefined,
      page,
      size: 20,
    },
  });

  const requests = data?.paymentRequests?.content || [];
  const totalPages = data?.paymentRequests?.totalPages || 0;
  const totalElements = data?.paymentRequests?.totalElements || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-[3px] border-muted border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/payments" className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Payment Requests</h1>
          <p className="text-muted-foreground mt-1">{totalElements} total payment requests</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={providerFilter}
          onChange={(e) => { setProviderFilter(e.target.value); setPage(0); }}
          className="px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        >
          <option value="">All Providers</option>
          <option value="MPESA">M-Pesa</option>
          <option value="TIGOPESA">Tigopesa</option>
          <option value="NMB_BANK">NMB Bank</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          className="px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        >
          <option value="">All Statuses</option>
          <option value="INITIATED">Initiated</option>
          <option value="SENT">Sent</option>
          <option value="CALLBACK_RECEIVED">Callback Received</option>
          <option value="COMPLETED">Completed</option>
          <option value="FAILED">Failed</option>
          <option value="EXPIRED">Expired</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="REVERSED">Reversed</option>
        </select>
      </div>

      {/* Table */}
      {error && !isNullListError(error) ? (
        <ErrorDisplay error={error} onRetry={() => refetch()} />
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Request #</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Provider</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Direction</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Member</th>
                  <th className="text-right py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Purpose</th>
                  <th className="text-center py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Initiated</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground">
                      No payment requests found
                    </td>
                  </tr>
                ) : (
                  requests.map((req: any) => (
                    <tr key={req.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-6 text-sm">
                        <Link href={`/dashboard/payments/requests/${req.id}`} className="text-primary hover:underline font-medium">
                          {req.requestNumber}
                        </Link>
                      </td>
                      <td className="py-4 px-6 text-sm font-medium">{req.provider}</td>
                      <td className="py-4 px-6 text-sm text-muted-foreground">{req.direction}</td>
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-4 py-2 text-sm rounded-lg border border-input hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 text-sm rounded-lg border border-input hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
