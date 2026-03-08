"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_CHART_OF_ACCOUNTS, GET_GENERAL_LEDGER } from "@/lib/graphql/queries";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, FileText, Calendar, Search, Printer, Download } from "lucide-react";
import Link from "next/link";

export default function GeneralLedgerPage() {
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);

  const { data: accountsData } = useQuery(GET_CHART_OF_ACCOUNTS);

  const { data: ledgerData, loading, error } = useQuery(GET_GENERAL_LEDGER, {
    variables: {
      accountId: selectedAccountId,
      startDate,
      endDate,
    },
    skip: !selectedAccountId,
  });

  const handleAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAccountId(e.target.value);
  };

  const calculateRunningBalance = () => {
    let runningBalance = 0;
    return (
      ledgerData?.generalLedger?.map((entry: { balance: number; [key: string]: unknown }) => {
        runningBalance = entry.balance;
        return {
          ...entry,
          runningBalance,
        };
      }) || []
    );
  };

  const ledgerEntries = calculateRunningBalance();

  const totalDebits = ledgerData?.generalLedger?.reduce(
    (sum: number, entry: { debitAmount?: number }) => sum + parseFloat(String(entry.debitAmount || 0)),
    0
  ) || 0;

  const totalCredits = ledgerData?.generalLedger?.reduce(
    (sum: number, entry: { creditAmount?: number }) => sum + parseFloat(String(entry.creditAmount || 0)),
    0
  ) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/accounting" className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div className="p-3 bg-green-500/10 rounded-lg">
            <FileText className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">General Ledger</h1>
            <p className="text-muted-foreground">View detailed account transactions</p>
          </div>
        </div>
        <div className="flex gap-2">
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

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-2">
              <Search className="w-4 h-4 inline mr-1" />
              Select Account
            </label>
            <select
              value={selectedAccountId}
              onChange={handleAccountChange}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">-- Select an account --</option>
              {accountsData?.chartOfAccounts?.map((account: { id: string; accountCode: string; accountName: string }) => (
                <option key={account.id} value={account.id}>
                  {account.accountCode} - {account.accountName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Account Info */}
      {selectedAccountId && accountsData && (
        <div className="bg-card border border-border rounded-lg p-6">
          {(() => {
            const selectedAccount = accountsData.chartOfAccounts?.find(
              (a: { id: string }) => a.id === selectedAccountId
            ) as { accountCode?: string; accountName?: string; accountType?: string; balance?: number } | undefined;
            return (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Account Code</div>
                  <div className="font-mono font-semibold text-foreground">
                    {selectedAccount?.accountCode}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Account Name</div>
                  <div className="font-semibold text-foreground">
                    {selectedAccount?.accountName}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Account Type</div>
                  <div className="font-semibold text-foreground">
                    {selectedAccount?.accountType}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Current Balance</div>
                  <div className="font-mono font-semibold text-foreground">
                    {formatCurrency(selectedAccount?.balance || 0)}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Ledger Table */}
      {selectedAccountId && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">
              Loading ledger entries...
            </div>
          ) : error ? (
            <div className="p-12 text-center text-destructive">
              Error loading ledger: {error.message}
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/30">
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Reference
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Debit
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Credit
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {ledgerEntries.map((entry: { id: string; postingDate: string; description: string; branch?: { branchName: string }; reference?: string; debitAmount: number; creditAmount: number; balance: number }) => (
                      <tr key={entry.id} className="hover:bg-secondary/50 transition-colors">
                        <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">
                          {formatDate(entry.postingDate)}
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {entry.description}
                          {entry.branch && (
                            <span className="text-xs text-muted-foreground ml-2">
                              ({entry.branch.branchName})
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground font-mono">
                          {entry.reference || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-mono">
                          {Number(entry.debitAmount) > 0 ? (
                            <span className="text-blue-600">
                              {formatCurrency(entry.debitAmount)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-mono">
                          {Number(entry.creditAmount) > 0 ? (
                            <span className="text-red-600">
                              {formatCurrency(entry.creditAmount)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-mono font-semibold text-foreground">
                          {formatCurrency(entry.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/50 border-t border-border font-semibold">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-sm text-foreground">
                        Total
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono text-blue-600">
                        {formatCurrency(totalDebits)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono text-red-600">
                        {formatCurrency(totalCredits)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono text-foreground">
                        {ledgerEntries.length > 0
                          ? formatCurrency(
                              ledgerEntries[ledgerEntries.length - 1].balance
                            )
                          : formatCurrency(0)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {ledgerEntries.length === 0 && (
                <div className="p-12 text-center text-muted-foreground">
                  No transactions found for the selected period.
                </div>
              )}
            </>
          )}
        </div>
      )}

      {!selectedAccountId && (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Select an account from the dropdown above to view its general ledger.
          </p>
        </div>
      )}
    </div>
  );
}
