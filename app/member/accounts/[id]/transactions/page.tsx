"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { GET_ESS_ACCOUNT_TRANSACTIONS, GET_ESS_SAVINGS_ACCOUNTS } from "@/lib/graphql/queries";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Link from "next/link";
import ErrorDisplay from "@/components/ui/ErrorDisplay";

export default function AccountTransactionsPage() {
  const params = useParams();
  const accountId = params.id as string;

  const { data: accountsData } = useQuery(GET_ESS_SAVINGS_ACCOUNTS);
  const account = accountsData?.essSavingsAccounts?.find((a: any) => a.id === accountId);

  const { data, loading, error } = useQuery(GET_ESS_ACCOUNT_TRANSACTIONS, {
    variables: { accountId, limit: 50 },
    skip: !accountId,
  });

  const transactions = data?.essAccountTransactions || [];

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

  const isCredit = (type: string) => ["DEPOSIT", "INTEREST_POSTING", "REVERSAL"].includes(type);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/member/accounts" className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Account Transactions
          </h1>
          {account && (
            <p className="text-muted-foreground mt-0.5">
              {account.accountNumber} - {account.product?.productName} | Balance: {formatCurrency(account.balance)}
            </p>
          )}
        </div>
      </div>

      {/* Mini Statement */}
      {transactions.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <p className="text-muted-foreground">No transactions found for this account.</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30">
            <p className="text-sm font-medium text-muted-foreground">
              Showing last {transactions.length} transactions
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/20">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Reference</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Debit</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Credit</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Balance</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn: any) => {
                  const credit = isCredit(txn.transactionType);
                  return (
                    <tr key={txn.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 text-sm">{formatDate(txn.transactionDate)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {credit ? (
                            <ArrowDownRight className="w-4 h-4 text-green-500 shrink-0" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-red-500 shrink-0" />
                          )}
                          <div>
                            <p className="text-sm font-medium">{txn.description || txn.transactionType?.replace(/_/g, " ")}</p>
                            <p className="text-xs text-muted-foreground">{txn.transactionType?.replace(/_/g, " ")}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground font-mono">{txn.referenceNumber || txn.transactionNumber}</td>
                      <td className="py-3 px-4 text-sm text-right font-semibold tabular-nums text-red-600">
                        {!credit ? formatCurrency(txn.amount) : ""}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-semibold tabular-nums text-green-600">
                        {credit ? formatCurrency(txn.amount) : ""}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-semibold tabular-nums">
                        {txn.balanceAfter != null ? formatCurrency(txn.balanceAfter) : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
