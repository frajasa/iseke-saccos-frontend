"use client";

import { useQuery } from "@apollo/client/react";
import { GET_ESS_LOAN_ACCOUNTS } from "@/lib/graphql/queries";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CreditCard, Eye, AlertTriangle } from "lucide-react";
import Link from "next/link";
import ErrorDisplay from "@/components/ui/ErrorDisplay";

export default function MemberLoansPage() {
  const { data, loading, error } = useQuery(GET_ESS_LOAN_ACCOUNTS);
  const loans = data?.essLoanAccounts || [];

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

  const totalOutstanding = loans.reduce((sum: number, l: any) =>
    sum + (parseFloat(l.outstandingPrincipal) || 0) + (parseFloat(l.outstandingInterest) || 0), 0
  );

  const statusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "PENDING_APPROVAL": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "DISBURSED": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "CLOSED": case "FULLY_PAID": return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
      case "DEFAULTED": case "WRITTEN_OFF": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">My Loan Accounts</h1>
        <p className="text-muted-foreground mt-1">View your loan details and repayment schedule</p>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
        <p className="text-sm opacity-90 mb-1">Total Outstanding Balance</p>
        <p className="text-3xl font-bold tabular-nums">{formatCurrency(totalOutstanding)}</p>
        <p className="text-sm opacity-80 mt-1">{loans.length} loan(s)</p>
      </div>

      {loans.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground mb-1">No Loans</h3>
          <p className="text-sm text-muted-foreground mb-4">You don&apos;t have any loan accounts yet.</p>
          <Link href="/member/apply-loan" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            Apply for a Loan
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {loans.map((loan: any) => {
            const outstanding = (parseFloat(loan.outstandingPrincipal) || 0) + (parseFloat(loan.outstandingInterest) || 0);
            const principal = parseFloat(loan.principalAmount) || 0;
            const paid = parseFloat(loan.totalPaid) || 0;
            const progress = principal > 0 ? Math.min((paid / principal) * 100, 100) : 0;

            return (
              <div key={loan.id} className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                          {loan.product?.productName || "Loan"}
                        </p>
                        <p className="text-sm font-semibold text-foreground">{loan.loanNumber}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor(loan.status)}`}>
                        {loan.status?.replace(/_/g, " ")}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Repayment Progress</span>
                        <span>{progress.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Principal</p>
                        <p className="text-sm font-semibold tabular-nums">{formatCurrency(loan.principalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Outstanding</p>
                        <p className="text-sm font-semibold tabular-nums text-amber-600">{formatCurrency(outstanding)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Paid</p>
                        <p className="text-sm font-semibold tabular-nums text-green-600">{formatCurrency(loan.totalPaid)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Interest Rate</p>
                        <p className="text-sm font-semibold">{loan.interestRate}% p.a.</p>
                      </div>
                    </div>

                    {loan.daysInArrears > 0 && (
                      <div className="mt-3 flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <p className="text-xs text-red-600 dark:text-red-400 font-medium">{loan.daysInArrears} days in arrears</p>
                      </div>
                    )}

                    <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                      {loan.disbursementDate && <span>Disbursed: {formatDate(loan.disbursementDate)}</span>}
                      {loan.nextPaymentDate && <span>Next payment: {formatDate(loan.nextPaymentDate)}</span>}
                      {loan.maturityDate && <span>Maturity: {formatDate(loan.maturityDate)}</span>}
                    </div>
                  </div>

                  <Link
                    href={`/member/loans/${loan.id}/schedule`}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Schedule
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
