"use client";

import { useQuery } from "@apollo/client/react";
import { GET_ESS_SAVINGS_ACCOUNTS } from "@/lib/graphql/queries";
import { formatCurrency } from "@/lib/utils";
import { PiggyBank, Eye, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Link from "next/link";
import ErrorDisplay from "@/components/ui/ErrorDisplay";

export default function MemberAccountsPage() {
  const { data, loading, error } = useQuery(GET_ESS_SAVINGS_ACCOUNTS);
  const accounts = data?.essSavingsAccounts || [];

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

  const totalBalance = accounts.reduce((sum: number, a: any) => sum + (parseFloat(a.balance) || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">My Savings Accounts</h1>
        <p className="text-muted-foreground mt-1">View and manage your savings accounts</p>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl p-6 text-white">
        <p className="text-sm opacity-90 mb-1">Total Savings Balance</p>
        <p className="text-3xl font-bold tabular-nums">{formatCurrency(totalBalance)}</p>
        <p className="text-sm opacity-80 mt-1">{accounts.length} account(s)</p>
      </div>

      {/* Accounts List */}
      {accounts.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <PiggyBank className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground mb-1">No Savings Accounts</h3>
          <p className="text-sm text-muted-foreground">You don&apos;t have any savings accounts yet. Contact your branch to open one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((account: any) => (
            <div key={account.id} className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    {account.product?.productName || "Savings"}
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{account.accountNumber}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  account.status === "ACTIVE"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                }`}>
                  {account.status}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Available Balance</p>
                  <p className="text-2xl font-bold text-foreground tabular-nums">{formatCurrency(account.availableBalance)}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Balance</p>
                    <p className="text-sm font-semibold tabular-nums">{formatCurrency(account.balance)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Interest Accrued</p>
                    <p className="text-sm font-semibold tabular-nums text-green-600">{formatCurrency(account.accruedInterest)}</p>
                  </div>
                </div>

                {account.product?.interestRate && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ArrowUpRight className="w-3 h-3 text-green-500" />
                    {account.product.interestRate}% p.a. interest rate
                  </div>
                )}

                {account.branch && (
                  <p className="text-xs text-muted-foreground">Branch: {account.branch.branchName}</p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-border flex gap-2">
                <Link
                  href={`/member/accounts/${account.id}/transactions`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Transactions
                </Link>
                <Link
                  href="/member/withdraw"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
                >
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  Withdraw
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
