"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_ESS_LOAN_REPAYMENT_SCHEDULE, GET_ESS_LOAN_ACCOUNTS } from "@/lib/graphql/queries";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, CheckCircle, Clock, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import ErrorDisplay from "@/components/ui/ErrorDisplay";

export default function LoanSchedulePage() {
  const params = useParams();
  const loanId = params.id as string;
  const [page, setPage] = useState(0);

  const { data: loansData } = useQuery(GET_ESS_LOAN_ACCOUNTS);
  const loan = loansData?.essLoanAccounts?.find((l: any) => l.id === loanId);

  const { data, loading, error } = useQuery(GET_ESS_LOAN_REPAYMENT_SCHEDULE, {
    variables: { loanId, page, size: 20 },
    skip: !loanId,
  });

  const schedule = data?.essLoanRepaymentSchedule;
  const items = schedule?.content || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-[3px] border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay error={error} variant="full-page" />;
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case "PAID": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "OVERDUE": return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  const statusStyle = (status: string) => {
    switch (status) {
      case "PAID": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "OVERDUE": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "PARTIALLY_PAID": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      default: return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/member/loans" className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Repayment Schedule</h1>
          {loan && (
            <p className="text-muted-foreground mt-0.5">
              {loan.loanNumber} - {loan.product?.productName} | Principal: {formatCurrency(loan.principalAmount)}
            </p>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <p className="text-muted-foreground">No repayment schedule found for this loan.</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">#</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Due Date</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Principal</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Interest</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Due</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Paid</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any) => (
                  <tr key={item.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4 text-sm text-center font-medium">{item.installmentNumber}</td>
                    <td className="py-3 px-4 text-sm">{formatDate(item.dueDate)}</td>
                    <td className="py-3 px-4 text-sm text-right tabular-nums">{formatCurrency(item.principalDue)}</td>
                    <td className="py-3 px-4 text-sm text-right tabular-nums">{formatCurrency(item.interestDue)}</td>
                    <td className="py-3 px-4 text-sm text-right font-semibold tabular-nums">{formatCurrency(item.totalDue)}</td>
                    <td className="py-3 px-4 text-sm text-right tabular-nums text-green-600">{formatCurrency(item.totalPaid)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle(item.status)}`}>
                        {statusIcon(item.status)}
                        {item.status?.replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {schedule && schedule.totalPages > 1 && (
            <div className="p-4 border-t border-border flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page + 1} of {schedule.totalPages} ({schedule.totalElements} installments)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(schedule.totalPages - 1, p + 1))}
                  disabled={page >= schedule.totalPages - 1}
                  className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
