"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_CASH_FLOW_STATEMENT } from "@/lib/graphql/queries";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, TrendingUp, Calendar, Printer, Download } from "lucide-react";
import Link from "next/link";

export default function CashFlowPage() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);

  const { data, loading, error } = useQuery(GET_CASH_FLOW_STATEMENT, {
    variables: { startDate, endDate },
    fetchPolicy: "network-only",
  });

  const cashFlow = data?.cashFlowStatement;

  const renderSection = (section: any) => {
    if (!section) return null;
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-3 border-b border-border pb-2">
          {section.name}
        </h3>
        <div className="space-y-2">
          {section.items?.map((item: any, idx: number) => (
            <div key={idx} className="flex justify-between items-center px-4 py-2 hover:bg-muted/30 rounded-lg">
              <span className="text-sm text-foreground">{item.description}</span>
              <span className={`text-sm font-mono font-semibold ${item.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(Math.abs(item.amount))}
                {item.amount < 0 && " (-)"}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center px-4 py-3 mt-2 bg-muted/50 rounded-lg font-semibold">
          <span className="text-sm text-foreground">Net {section.name}</span>
          <span className={`text-sm font-mono ${section.total >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(Math.abs(section.total))}
            {section.total < 0 && " (-)"}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/accounting" className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div className="p-3 bg-cyan-500/10 rounded-lg">
            <TrendingUp className="w-6 h-6 text-cyan-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Cash Flow Statement</h1>
            <p className="text-muted-foreground">Operating, investing, and financing activities</p>
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

      {/* Date Filters */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Cash Flow Report */}
      <div className="bg-card border border-border rounded-lg p-6">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">Loading cash flow statement...</div>
        ) : error ? (
          <div className="p-12 text-center text-destructive">Error: {error.message}</div>
        ) : !cashFlow ? (
          <div className="p-12 text-center text-muted-foreground">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>No cash flow data available for the selected period.</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground">ISEKE SACCOS</h2>
              <p className="text-sm text-muted-foreground">
                Cash Flow Statement for the period {startDate} to {endDate}
              </p>
            </div>

            {renderSection(cashFlow.operatingActivities)}
            {renderSection(cashFlow.investingActivities)}
            {renderSection(cashFlow.financingActivities)}

            {/* Net Cash Flow */}
            <div className="flex justify-between items-center px-4 py-4 mt-4 bg-primary/10 rounded-lg border border-primary/20">
              <span className="text-lg font-bold text-foreground">Net Cash Flow</span>
              <span className={`text-lg font-mono font-bold ${cashFlow.netCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(Math.abs(cashFlow.netCashFlow))}
                {cashFlow.netCashFlow < 0 && " (-)"}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
