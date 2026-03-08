"use client";

import { useQuery } from "@apollo/client/react";
import { GET_ESS_PAYROLL_DEDUCTIONS } from "@/lib/graphql/queries";
import { formatCurrency } from "@/lib/utils";
import { Receipt } from "lucide-react";
import ErrorDisplay from "@/components/ui/ErrorDisplay";

export default function MemberDeductionsPage() {
  const { data, loading, error } = useQuery(GET_ESS_PAYROLL_DEDUCTIONS);
  const deductions = data?.essPayrollDeductions || [];

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

  const totalMonthly = deductions
    .filter((d: any) => d.isActive)
    .reduce((sum: number, d: any) => sum + (d.amount || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">My Deductions</h1>
        <p className="text-muted-foreground mt-1">Your monthly payroll deductions</p>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white">
        <p className="text-sm opacity-90 mb-1">Total Monthly Deductions</p>
        <p className="text-2xl font-bold tabular-nums">{formatCurrency(totalMonthly)}</p>
        <p className="text-sm opacity-80 mt-1">{deductions.filter((d: any) => d.isActive).length} active deduction(s)</p>
      </div>

      {/* Deductions List */}
      {deductions.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Receipt className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No payroll deductions set up</p>
        </div>
      ) : (
        <div className="space-y-4">
          {deductions.map((d: any) => (
            <div key={d.id} className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    d.deductionType === "SAVINGS" ? "bg-success/10" : "bg-primary/10"
                  }`}>
                    <Receipt className={`w-5 h-5 ${
                      d.deductionType === "SAVINGS" ? "text-success" : "text-primary"
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {d.deductionType === "SAVINGS" ? "Savings Contribution" : "Loan Repayment"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {d.deductionType === "SAVINGS" && d.savingsAccount
                        ? `Account: ${d.savingsAccount.accountNumber}`
                        : d.loanAccount
                        ? `Loan: ${d.loanAccount.loanNumber}`
                        : d.description || "N/A"}
                    </p>
                    {d.employer && (
                      <p className="text-xs text-muted-foreground mt-1">via {d.employer.employerName}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">{formatCurrency(d.amount)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full border ${
                    d.isActive
                      ? "bg-success/10 text-success border-success/20"
                      : "bg-muted text-muted-foreground border-border"
                  }`}>
                    {d.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
