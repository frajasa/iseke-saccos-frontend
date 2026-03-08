"use client";

import { useQuery } from "@apollo/client/react";
import { GET_SAVINGS_ACCOUNT, GET_ACCOUNT_TRANSACTIONS } from "@/lib/graphql/queries";
import { useParams } from "next/navigation";
import { ArrowLeft, DollarSign, TrendingUp, Calendar, Plus, Minus } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDateTime, getStatusColor } from "@/lib/utils";
import ErrorDisplay from "@/components/ui/ErrorDisplay";

export default function SavingsAccountDetailPage() {
  const { id: accountId } = useParams<{ id: string }>();

  const { data, loading, error, refetch } = useQuery(GET_SAVINGS_ACCOUNT, {
    variables: { id: accountId },
  });

  const { data: transactionsData, loading: transactionsLoading } = useQuery(GET_ACCOUNT_TRANSACTIONS, {
    variables: { accountId },
    fetchPolicy: "network-only",
  });

  const account = data?.savingsAccount;
  const transactions = transactionsData?.accountTransactions || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-[3px] border-muted border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay error={error} variant="full-page" onRetry={() => refetch()} />;
  }

  if (!account) {
    return <ErrorDisplay variant="full-page" title="Account Not Found" message="The savings account you're looking for doesn't exist." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/members/${account.member?.id}`}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Savings Account
            </h1>
            <p className="text-muted-foreground mt-1">
              {account.accountNumber} - {account.member?.firstName} {account.member?.lastName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/savings/accounts/${accountId}/deposit`}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Deposit
          </Link>
          <Link
            href={`/savings/accounts/${accountId}/withdraw`}
            className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Minus className="w-4 h-4" />
            Withdraw
          </Link>
        </div>
      </div>

      {/* Status Badge */}
      <div>
        <span
          className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
            account.status
          )}`}
        >
          {account.status}
        </span>
      </div>

      {/* Account Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Current Balance</h3>
            <DollarSign className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-2xl font-bold tabular-nums">{formatCurrency(account.balance)}</p>
          <p className="text-xs opacity-80 mt-1">Available: {formatCurrency(account.availableBalance)}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Accrued Interest</h3>
            <TrendingUp className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-2xl font-bold tabular-nums">{formatCurrency(account.accruedInterest)}</p>
          <p className="text-xs opacity-80 mt-1">{(Number(account.product?.interestRate || 0) * 100).toFixed(2)}% p.a.</p>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Account Age</h3>
            <Calendar className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-2xl font-bold tabular-nums">
            {Math.floor((new Date().getTime() - new Date(account.openingDate).getTime()) / (1000 * 60 * 60 * 24 * 30))} mo
          </p>
          <p className="text-xs opacity-80 mt-1">Opened {new Date(account.openingDate).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Account Details */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">
          Account Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Product</p>
            <p className="text-foreground font-medium">{account.product?.productName}</p>
            <p className="text-xs text-muted-foreground">{account.product?.productType}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Branch</p>
            <p className="text-foreground font-medium">{account.branch?.branchName}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Opening Date</p>
            <p className="text-foreground font-medium">{new Date(account.openingDate).toLocaleDateString()}</p>
          </div>
          {account.beneficiaryName && (
            <>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Beneficiary</p>
                <p className="text-foreground font-medium">{account.beneficiaryName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Relationship</p>
                <p className="text-foreground font-medium">{account.beneficiaryRelationship}</p>
              </div>
            </>
          )}
          {account.lastTransactionDate && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Last Transaction</p>
              <p className="text-foreground font-medium">{new Date(account.lastTransactionDate).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">
            Recent Transactions
          </h2>
        </div>
        {transactionsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-[3px] border-muted border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No transactions yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date & Time</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
                  <th className="text-right py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                  <th className="text-right py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Balance</th>
                  <th className="text-center py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction: any) => (
                  <tr
                    key={transaction.id}
                    className="border-t border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 px-6 text-sm text-muted-foreground">
                      {formatDateTime(transaction.transactionDate)}
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-foreground">
                      {transaction.transactionType.replace(/_/g, " ")}
                    </td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">
                      {transaction.description || "-"}
                    </td>
                    <td className={`py-4 px-6 text-sm font-semibold text-right ${
                      ["DEPOSIT", "INTEREST", "LOAN_REPAYMENT"].includes(transaction.transactionType) ? "text-green-600" : "text-orange-600"
                    }`}>
                      {["DEPOSIT", "INTEREST", "LOAN_REPAYMENT"].includes(transaction.transactionType) ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-right text-foreground">
                      {formatCurrency(transaction.balanceAfter)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                          transaction.status
                        )}`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
