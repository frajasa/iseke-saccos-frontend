"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_TRIAL_BALANCE } from "@/lib/graphql/queries";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Scale, Calendar, Printer, Download, CheckCircle, XCircle } from "lucide-react";

export default function TrialBalancePage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);

  const { data, loading, error, refetch } = useQuery(GET_TRIAL_BALANCE, {
    variables: { date: selectedDate },
  });

  const isBalanced =
    data?.trialBalance?.totalDebits === data?.trialBalance?.totalCredits;

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 rounded-lg">
            <Scale className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Trial Balance</h1>
            <p className="text-muted-foreground">
              Verify accounting accuracy with debit and credit balances
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
          >
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors">
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-foreground">
            <Calendar className="w-4 h-4 inline mr-2" />
            As of Date:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Balance Status */}
      {data && (
        <div
          className={`p-6 rounded-lg border-2 ${
            isBalanced
              ? "bg-success/5 border-success"
              : "bg-destructive/5 border-destructive"
          }`}
        >
          <div className="flex items-center gap-3">
            {isBalanced ? (
              <CheckCircle className="w-6 h-6 text-success" />
            ) : (
              <XCircle className="w-6 h-6 text-destructive" />
            )}
            <div>
              <h3 className="font-semibold text-foreground">
                {isBalanced ? "Balanced" : "Out of Balance"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isBalanced
                  ? "Total debits equal total credits. The books are balanced."
                  : `Difference: ${formatCurrency(
                      Math.abs(data.trialBalance.totalDebits - data.trialBalance.totalCredits)
                    )}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-1">Total Debits</div>
            <div className="text-2xl font-bold tabular-nums text-blue-600">
              {formatCurrency(data.trialBalance.totalDebits)}
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-1">Total Credits</div>
            <div className="text-2xl font-bold tabular-nums text-red-600">
              {formatCurrency(data.trialBalance.totalCredits)}
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-1">Difference</div>
            <div
              className={`text-2xl font-bold tabular-nums ${
                isBalanced ? "text-success" : "text-destructive"
              }`}
            >
              {formatCurrency(
                Math.abs(data.trialBalance.totalDebits - data.trialBalance.totalCredits)
              )}
            </div>
          </div>
        </div>
      )}

      {/* Trial Balance Table */}
      {loading ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <div className="text-muted-foreground">Loading trial balance...</div>
        </div>
      ) : error ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <div className="text-destructive">Error loading trial balance: {error.message}</div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Account Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Account Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Debit Balance
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Credit Balance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data?.trialBalance?.entries?.map((entry: { account: { id: string; accountCode: string; accountName: string; accountType: string; accountCategory?: string }; debitBalance: number; creditBalance: number }) => (
                  <tr key={entry.account.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-foreground">
                      {entry.account.accountCode}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {entry.account.accountName}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          entry.account.accountType === "ASSET"
                            ? "text-blue-600 bg-blue-50"
                            : entry.account.accountType === "LIABILITY"
                            ? "text-red-600 bg-red-50"
                            : entry.account.accountType === "EQUITY"
                            ? "text-purple-600 bg-purple-50"
                            : entry.account.accountType === "INCOME"
                            ? "text-green-600 bg-green-50"
                            : "text-orange-600 bg-orange-50"
                        }`}
                      >
                        {entry.account.accountType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {entry.account.accountCategory?.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono">
                      {entry.debitBalance > 0 ? (
                        <span className="text-blue-600 font-semibold">
                          {formatCurrency(entry.debitBalance)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono">
                      {entry.creditBalance > 0 ? (
                        <span className="text-red-600 font-semibold">
                          {formatCurrency(entry.creditBalance)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/50 border-t-2 border-border">
                <tr className="font-bold">
                  <td colSpan={4} className="px-4 py-4 text-sm text-foreground">
                    Total
                  </td>
                  <td className="px-4 py-4 text-sm text-right font-mono text-blue-600">
                    {formatCurrency(data?.trialBalance?.totalDebits || 0)}
                  </td>
                  <td className="px-4 py-4 text-sm text-right font-mono text-red-600">
                    {formatCurrency(data?.trialBalance?.totalCredits || 0)}
                  </td>
                </tr>
                {!isBalanced && (
                  <tr>
                    <td colSpan={4} className="px-4 py-4 text-sm text-destructive font-semibold">
                      Difference (Out of Balance)
                    </td>
                    <td
                      colSpan={2}
                      className="px-4 py-4 text-sm text-right font-mono text-destructive font-semibold"
                    >
                      {formatCurrency(
                        Math.abs(
                          data.trialBalance.totalDebits - data.trialBalance.totalCredits
                        )
                      )}
                    </td>
                  </tr>
                )}
              </tfoot>
            </table>
          </div>

          {data?.trialBalance?.entries?.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              No entries found for the selected date.
            </div>
          )}
        </div>
      )}

      {/* Report Info */}
      <div className="bg-muted/30 border border-border rounded-lg p-4 text-sm text-muted-foreground">
        <p>
          <strong>Report Date:</strong> {formatDate(selectedDate)}
        </p>
        <p className="mt-1">
          <strong>Note:</strong> This trial balance shows the debit and credit balances of all
          accounts as of the selected date. The totals must equal for the books to be in balance.
        </p>
      </div>
    </div>
  );
}
