"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_PORTFOLIO_SUMMARY, GET_BRANCHES } from "@/lib/graphql/queries";
import { formatCurrency } from "@/lib/utils";
import { PieChart, Calendar, Building2, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";

export default function PortfolioSummaryPage() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedBranchId, setSelectedBranchId] = useState("");

  const { data: branchesData } = useQuery(GET_BRANCHES);
  const { data, loading, error } = useQuery(GET_PORTFOLIO_SUMMARY, {
    variables: {
      branchId: selectedBranchId || undefined,
      startDate,
      endDate,
    },
  });

  const portfolio = data?.portfolioSummary;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-pink-500/10 rounded-lg">
          <PieChart className="w-6 h-6 text-pink-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Portfolio Summary</h1>
          <p className="text-muted-foreground">View loan portfolio statistics and performance</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {loading ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <div className="text-muted-foreground">Loading portfolio summary...</div>
        </div>
      ) : error ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <div className="text-destructive">Error: {error.message}</div>
        </div>
      ) : portfolio ? (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <div className="text-sm text-muted-foreground">Total Loans</div>
              </div>
              <div className="text-2xl font-bold text-foreground tracking-tight">{portfolio.totalLoans}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {portfolio.activeLoans} active
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div className="text-sm text-muted-foreground">Total Disbursed</div>
              </div>
              <div className="text-2xl font-bold tabular-nums text-green-600">
                {formatCurrency(portfolio.totalDisbursed)}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <div className="text-sm text-muted-foreground">Total Outstanding</div>
              </div>
              <div className="text-2xl font-bold tabular-nums text-orange-600">
                {formatCurrency(portfolio.totalOutstanding)}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-purple-600" />
                <div className="text-sm text-muted-foreground">Total Paid</div>
              </div>
              <div className="text-2xl font-bold tabular-nums text-purple-600">
                {formatCurrency(portfolio.totalPaid)}
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Average Loan Size</div>
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(portfolio.averageLoanSize)}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Delinquent Loans</div>
              <div className="text-2xl font-bold text-destructive">
                {portfolio.delinquentLoans}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {portfolio.totalLoans > 0
                  ? ((portfolio.delinquentLoans / portfolio.totalLoans) * 100).toFixed(1)
                  : 0}
                % of total
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Portfolio at Risk</div>
              <div className="text-2xl font-bold text-destructive">
                {formatCurrency(portfolio.portfolioAtRisk)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {portfolio.totalOutstanding > 0
                  ? ((portfolio.portfolioAtRisk / portfolio.totalOutstanding) * 100).toFixed(1)
                  : 0}
                % of outstanding
              </div>
            </div>
          </div>

          {/* Collection Rate */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Collection Performance</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Collection Rate</span>
                  <span className="font-semibold text-foreground">
                    {portfolio.totalDisbursed > 0
                      ? ((portfolio.totalPaid / portfolio.totalDisbursed) * 100).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-4">
                  <div
                    className="bg-success h-4 rounded-full transition-all"
                    style={{
                      width: `${
                        portfolio.totalDisbursed > 0
                          ? Math.min(
                              (portfolio.totalPaid / portfolio.totalDisbursed) * 100,
                              100
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Health Indicator */}
          <div
            className={`p-6 rounded-lg border-2 ${
              portfolio.portfolioAtRisk < portfolio.totalOutstanding * 0.05
                ? "bg-success/5 border-success"
                : portfolio.portfolioAtRisk < portfolio.totalOutstanding * 0.1
                ? "bg-amber-500/5 border-amber-500"
                : "bg-destructive/5 border-destructive"
            }`}
          >
            <h3 className="text-lg font-semibold text-foreground mb-2">Portfolio Health</h3>
            <p className="text-sm text-muted-foreground">
              {portfolio.portfolioAtRisk < portfolio.totalOutstanding * 0.05
                ? "Excellent: Portfolio at risk is less than 5% of outstanding loans."
                : portfolio.portfolioAtRisk < portfolio.totalOutstanding * 0.1
                ? "Good: Portfolio at risk is between 5-10% of outstanding loans."
                : "Attention Required: Portfolio at risk exceeds 10% of outstanding loans."}
            </p>
          </div>
        </>
      ) : (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <PieChart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No portfolio data available for the selected period.</p>
        </div>
      )}
    </div>
  );
}
