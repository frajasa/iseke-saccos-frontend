"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_DAILY_TRANSACTION_SUMMARY } from "@/lib/graphql/queries";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  ArrowDownCircle,
  ArrowUpCircle,
  CreditCard,
  Banknote,
  Hash,
} from "lucide-react";
import Link from "next/link";

export default function DailyTransactionsPage() {
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

  const { data, loading, error } = useQuery(GET_DAILY_TRANSACTION_SUMMARY, {
    variables: { date },
    fetchPolicy: "network-only",
  });

  const summary = data?.dailyTransactionSummary;

  const cards = summary
    ? [
        {
          label: "Total Deposits",
          value: summary.deposits,
          icon: ArrowDownCircle,
          color: "from-green-500 to-green-600",
        },
        {
          label: "Total Withdrawals",
          value: summary.withdrawals,
          icon: ArrowUpCircle,
          color: "from-red-500 to-red-600",
        },
        {
          label: "Loan Disbursements",
          value: summary.loanDisbursements,
          icon: CreditCard,
          color: "from-blue-500 to-blue-600",
        },
        {
          label: "Loan Repayments",
          value: summary.loanRepayments,
          icon: Banknote,
          color: "from-purple-500 to-purple-600",
        },
      ]
    : [];

  const netFlow = summary
    ? (parseFloat(summary.deposits) || 0) +
      (parseFloat(summary.loanRepayments) || 0) -
      (parseFloat(summary.withdrawals) || 0) -
      (parseFloat(summary.loanDisbursements) || 0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/accounting" className="p-2 hover:bg-secondary rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div className="p-3 bg-violet-500/10 rounded-lg">
          <BarChart3 className="w-6 h-6 text-violet-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Daily Transaction Summary</h1>
          <p className="text-muted-foreground">Overview of daily financial activity</p>
        </div>
      </div>

      {/* Date Selector */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="max-w-xs">
          <label className="block text-sm font-medium text-foreground mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Select Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center text-muted-foreground">
          Loading daily summary...
        </div>
      ) : error ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center text-destructive">
          Error: {error.message}
        </div>
      ) : !summary ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center text-muted-foreground">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>No transaction data available for the selected date.</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card) => (
              <div
                key={card.label}
                className={`bg-gradient-to-br ${card.color} rounded-xl p-6 text-white`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium opacity-90">{card.label}</h3>
                  <card.icon className="w-5 h-5 opacity-80" />
                </div>
                <p className="text-2xl font-bold">{formatCurrency(card.value)}</p>
              </div>
            ))}
          </div>

          {/* Totals Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Hash className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total Transaction Count</span>
              </div>
              <p className="text-2xl font-bold text-foreground tracking-tight">{summary.totalCount}</p>
            </div>
            <div className={`rounded-lg p-6 border ${netFlow >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className={`w-5 h-5 ${netFlow >= 0 ? "text-green-600" : "text-red-600"}`} />
                <span className={`text-sm ${netFlow >= 0 ? "text-green-700" : "text-red-700"}`}>Net Cash Flow</span>
              </div>
              <p className={`text-3xl font-bold ${netFlow >= 0 ? "text-green-700" : "text-red-700"}`}>
                {netFlow >= 0 ? "+" : "-"}{formatCurrency(Math.abs(netFlow))}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
