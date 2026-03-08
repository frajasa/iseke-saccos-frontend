"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_FINANCIAL_STATEMENTS, GET_BRANCHES } from "@/lib/graphql/queries";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, TrendingUp, Calendar, Building2, Printer, Download } from "lucide-react";
import Link from "next/link";

export default function FinancialStatementsPage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [activeTab, setActiveTab] = useState<"balance-sheet" | "income-statement">("balance-sheet");

  const { data: branchesData } = useQuery(GET_BRANCHES);
  const { data, loading, error } = useQuery(GET_FINANCIAL_STATEMENTS, {
    variables: {
      date: selectedDate,
      branchId: selectedBranchId || undefined,
    },
  });

  const balanceSheet = data?.financialStatements?.balanceSheet;
  const incomeStatement = data?.financialStatements?.incomeStatement;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/accounting" className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div className="p-3 bg-orange-500/10 rounded-lg">
            <TrendingUp className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Financial Statements</h1>
            <p className="text-muted-foreground">
              View balance sheet and income statement
            </p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              As of Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Building2 className="w-4 h-4 inline mr-1" />
              Branch (Optional)
            </label>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Branches</option>
              {branchesData?.branches?.map((branch: { id: string; branchName: string }) => (
                <option key={branch.id} value={branch.id}>
                  {branch.branchName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("balance-sheet")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "balance-sheet"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Balance Sheet
          </button>
          <button
            onClick={() => setActiveTab("income-statement")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "income-statement"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Income Statement
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <div className="text-muted-foreground">Loading financial statements...</div>
        </div>
      ) : error ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <div className="text-destructive">Error: {error.message}</div>
        </div>
      ) : (
        <>
          {/* Balance Sheet */}
          {activeTab === "balance-sheet" && balanceSheet && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="text-sm text-muted-foreground mb-1">Total Assets</div>
                  <div className="text-3xl font-bold text-blue-600">
                    {formatCurrency(balanceSheet.assets)}
                  </div>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="text-sm text-muted-foreground mb-1">Total Liabilities</div>
                  <div className="text-3xl font-bold text-red-600">
                    {formatCurrency(balanceSheet.liabilities)}
                  </div>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="text-sm text-muted-foreground mb-1">Total Equity</div>
                  <div className="text-3xl font-bold text-purple-600">
                    {formatCurrency(balanceSheet.equity)}
                  </div>
                </div>
              </div>

              {/* Detailed Balance Sheet */}
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="p-6 bg-muted/50 border-b border-border">
                  <h2 className="text-xl font-bold text-foreground">Balance Sheet</h2>
                  <p className="text-sm text-muted-foreground">As of {formatDate(selectedDate)}</p>
                </div>

                <div className="p-6 space-y-6">
                  {balanceSheet.details?.map((item: { category: string; amount: number; accounts?: Array<{ accountName: string; amount: number }> }, index: number) => (
                    <div key={index}>
                      <h3 className="text-lg font-semibold text-foreground mb-3">
                        {item.category}
                      </h3>
                      <table className="w-full mb-4">
                        <tbody>
                          {item.accounts?.map((account: { accountName: string; amount: number }, accIndex: number) => (
                            <tr key={accIndex} className="border-b border-border last:border-0">
                              <td className="py-2 text-foreground">{account.accountName}</td>
                              <td className="py-2 text-right font-mono text-foreground">
                                {formatCurrency(account.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="font-semibold border-t-2 border-border">
                            <td className="py-2 text-foreground">Total {item.category}</td>
                            <td className="py-2 text-right font-mono text-foreground">
                              {formatCurrency(item.amount)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ))}

                  <div className="pt-4 border-t-2 border-border">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span className="text-foreground">Total Liabilities and Equity</span>
                      <span className="font-mono text-foreground">
                        {formatCurrency(Number(balanceSheet.liabilities || 0) + Number(balanceSheet.equity || 0))}
                      </span>
                    </div>
                    {Math.abs(Number(balanceSheet.assets || 0) - (Number(balanceSheet.liabilities || 0) + Number(balanceSheet.equity || 0))) > 0.01 && (
                      <div className="mt-2 text-destructive text-sm">
                        Warning: Assets do not equal Liabilities + Equity
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Income Statement */}
          {activeTab === "income-statement" && incomeStatement && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="text-sm text-muted-foreground mb-1">Total Revenue</div>
                  <div className="text-3xl font-bold text-green-600">
                    {formatCurrency(incomeStatement.revenue)}
                  </div>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="text-sm text-muted-foreground mb-1">Total Expenses</div>
                  <div className="text-3xl font-bold text-red-600">
                    {formatCurrency(incomeStatement.expenses)}
                  </div>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="text-sm text-muted-foreground mb-1">Net Income</div>
                  <div
                    className={`text-3xl font-bold ${
                      Number(incomeStatement.netIncome || 0) >= 0 ? "text-success" : "text-destructive"
                    }`}
                  >
                    {formatCurrency(incomeStatement.netIncome)}
                  </div>
                </div>
              </div>

              {/* Detailed Income Statement */}
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="p-6 bg-muted/50 border-b border-border">
                  <h2 className="text-xl font-bold text-foreground">Income Statement</h2>
                  <p className="text-sm text-muted-foreground">For the period ending {formatDate(selectedDate)}</p>
                </div>

                <div className="p-6 space-y-6">
                  {incomeStatement.details?.map((item: { category: string; amount: number; accounts?: Array<{ accountName: string; amount: number }> }, index: number) => (
                    <div key={index}>
                      <h3 className="text-lg font-semibold text-foreground mb-3">
                        {item.category}
                      </h3>
                      <table className="w-full mb-4">
                        <tbody>
                          {item.accounts?.map((account: { accountName: string; amount: number }, accIndex: number) => (
                            <tr key={accIndex} className="border-b border-border last:border-0">
                              <td className="py-2 text-foreground">{account.accountName}</td>
                              <td className="py-2 text-right font-mono text-foreground">
                                {formatCurrency(account.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="font-semibold border-t-2 border-border">
                            <td className="py-2 text-foreground">Total {item.category}</td>
                            <td className="py-2 text-right font-mono text-foreground">
                              {formatCurrency(item.amount)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ))}

                  <div className="pt-4 border-t-2 border-border">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span className="text-foreground">Net Income (Loss)</span>
                      <span
                        className={`font-mono ${
                          Number(incomeStatement.netIncome || 0) >= 0 ? "text-success" : "text-destructive"
                        }`}
                      >
                        {formatCurrency(incomeStatement.netIncome)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
