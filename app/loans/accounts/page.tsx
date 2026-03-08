"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_LOAN_ACCOUNTS, APPROVE_LOAN, DISBURSE_LOAN } from "@/lib/graphql/queries";
import { LoanAccount, LoanStatus } from "@/lib/types";
import { Filter, Eye, CheckCircle, Banknote } from "lucide-react";
import Link from "next/link";
import { getStatusColor, formatCurrency, formatDate } from "@/lib/utils";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import { SkeletonTable } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { isNullListError } from "@/lib/error-utils";
import { toast } from "sonner";

export default function LoanAccountsPage() {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<LoanStatus | undefined>(
    undefined
  );

  const { data, loading, error, refetch } = useQuery(GET_LOAN_ACCOUNTS, {
    variables: { page, size: 20, status: statusFilter },
  });

  const [approveLoan] = useMutation(APPROVE_LOAN);
  const [disburseLoan] = useMutation(DISBURSE_LOAN);

  const handleQuickApprove = async (loanId: string) => {
    if (!confirm("Are you sure you want to approve this loan?")) return;
    try {
      await approveLoan({ variables: { id: loanId } });
      toast.success("Loan approved successfully");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to approve loan");
    }
  };

  const handleQuickDisburse = async (loanId: string) => {
    if (!confirm("Are you sure you want to disburse this loan?")) return;
    try {
      await disburseLoan({ variables: { id: loanId } });
      toast.success("Loan disbursed successfully");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to disburse loan");
    }
  };

  const loans: LoanAccount[] = data?.loanAccounts?.content || [];
  const totalPages = data?.loanAccounts?.totalPages || 0;

  const shouldShowError = error && !isNullListError(error) && loans.length === 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl tracking-tight font-bold text-foreground">Loan Accounts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            View and manage all loan accounts
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/loans"
            className="inline-flex items-center justify-center gap-2 text-foreground bg-card border border-border hover:bg-muted font-medium px-5 py-2.5 text-sm rounded-lg transition-colors"
          >
            Loan Products
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <select
              value={statusFilter || ""}
              onChange={(e) => {
                setStatusFilter(
                  (e.target.value as LoanStatus) || undefined
                );
                setPage(0);
              }}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none"
            >
              <option value="">All Status</option>
              <option value="APPLIED">Applied</option>
              <option value="APPROVED">Approved</option>
              <option value="DISBURSED">Disbursed</option>
              <option value="ACTIVE">Active</option>
              <option value="CLOSED">Closed</option>
              <option value="WRITTEN_OFF">Written Off</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loan Accounts Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {loading ? (
          <SkeletonTable rows={8} cols={6} />
        ) : shouldShowError ? (
          <ErrorDisplay error={error} onRetry={() => refetch()} />
        ) : loans.length === 0 ? (
          <EmptyState title="No loan accounts found" description="Loan accounts will appear here once members apply for loans." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30 border-b border-border">
                  <tr>
                    <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Loan #
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Member
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Product
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Principal
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Outstanding
                    </th>
                    <th className="text-center py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-center py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Days in Arrears
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-center py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((loan: LoanAccount) => (
                    <tr
                      key={loan.id}
                      className="border-t border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-4 px-6 text-sm font-medium text-foreground">
                        {loan.loanNumber}
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {loan.member?.firstName} {loan.member?.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {loan.member?.memberNumber}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-muted-foreground">
                        {loan.product?.productName}
                      </td>
                      <td className="py-4 px-6 text-sm text-foreground text-right font-medium">
                        {formatCurrency(loan.principalAmount)}
                      </td>
                      <td className="py-4 px-6 text-sm text-foreground text-right font-medium">
                        {formatCurrency(
                          Number(loan.outstandingPrincipal || 0) +
                          Number(loan.outstandingInterest || 0) +
                          Number(loan.outstandingFees || 0) +
                          Number(loan.outstandingPenalties || 0)
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium border ${getStatusColor(
                            loan.status
                          )}`}
                        >
                          {loan.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-center">
                        {loan.daysInArrears > 0 ? (
                          <span className="text-destructive font-medium">
                            {loan.daysInArrears}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-sm text-muted-foreground">
                        {formatDate(
                          loan.disbursementDate || loan.applicationDate
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/loans/accounts/${loan.id}`}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {loan.status === "APPLIED" && (
                            <button
                              onClick={() => handleQuickApprove(loan.id)}
                              className="p-2 text-blue-600 hover:bg-blue-600/10 rounded-lg transition-colors"
                              title="Approve Loan"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {loan.status === "APPROVED" && (
                            <button
                              onClick={() => handleQuickDisburse(loan.id)}
                              className="p-2 text-purple-600 hover:bg-purple-600/10 rounded-lg transition-colors"
                              title="Disburse Loan"
                            >
                              <Banknote className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-muted-foreground">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={page >= totalPages - 1}
                  className="px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
