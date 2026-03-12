"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_LOAN_OFFICER_PERFORMANCE } from "@/lib/graphql/queries";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, Users, Calendar, TrendingUp, AlertTriangle } from "lucide-react";
import Link from "next/link";
import ExportDropdown from "@/components/ExportDropdown";
import { ExportOptions, handleExport } from "@/lib/export-utils";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import { isNullListError } from "@/lib/error-utils";

export default function LoanOfficerPerformancePage() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);

  const { data, loading, error } = useQuery(GET_LOAN_OFFICER_PERFORMANCE, {
    variables: { startDate, endDate },
  });

  const officers = data?.loanOfficerPerformance || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/accounting" className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div className="p-3 bg-indigo-500/10 rounded-lg">
            <Users className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Loan Officer Performance</h1>
            <p className="text-muted-foreground">Track loan officer KPIs and portfolio quality</p>
          </div>
        </div>
        <ExportDropdown
          onExport={(format) => {
            const exportOptions: ExportOptions = {
              title: "Loan Officer Performance",
              subtitle: `Period: ${startDate} to ${endDate}`,
              filename: "loan-officer-performance",
              columns: [
                { header: "Loan Officer", key: "loanOfficer", width: 22 },
                { header: "Total Loans", key: "totalLoans", width: 12, format: "number" },
                { header: "Active Loans", key: "activeLoans", width: 12, format: "number" },
                { header: "Delinquent", key: "delinquentLoans", width: 12, format: "number" },
                { header: "Total Disbursed", key: "totalDisbursed", width: 18, format: "currency" },
                { header: "Outstanding", key: "totalOutstanding", width: 18, format: "currency" },
                { header: "PAR %", key: "parPercentage", width: 10, format: "percent" },
              ],
              data: officers.map((o: any) => ({
                loanOfficer: o.loanOfficer,
                totalLoans: o.totalLoans,
                activeLoans: o.activeLoans,
                delinquentLoans: o.delinquentLoans,
                totalDisbursed: o.totalDisbursed,
                totalOutstanding: o.totalOutstanding,
                parPercentage: Number(o.parPercentage),
              })),
            };
            handleExport(format, exportOptions, "print-report");
          }}
          disabled={!officers.length}
        />
      </div>

      {/* Filters */}
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

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003B73]" />
        </div>
      )}

      {/* Error */}
      {error && !isNullListError(error) && <ErrorDisplay error={error} />}

      {/* Results */}
      {!loading && officers.length === 0 && (
        <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground">
          No loan officer data available for the selected period.
        </div>
      )}

      {officers.length > 0 && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Officers</p>
              <p className="text-2xl font-bold">{officers.length}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Active Loans</p>
              <p className="text-2xl font-bold">{officers.reduce((sum: number, o: any) => sum + Number(o.activeLoans), 0)}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Outstanding</p>
              <p className="text-2xl font-bold">{formatCurrency(officers.reduce((sum: number, o: any) => sum + Number(o.totalOutstanding), 0))}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Delinquent</p>
              <p className="text-2xl font-bold text-red-600">{officers.reduce((sum: number, o: any) => sum + Number(o.delinquentLoans), 0)}</p>
            </div>
          </div>

          {/* Table */}
          <div id="print-report" className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Loan Officer</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Total Loans</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Active</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Delinquent</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Total Disbursed</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Outstanding</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">PAR %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {officers.map((officer: any) => (
                  <tr key={officer.loanOfficer} className="hover:bg-muted/50">
                    <td className="px-6 py-4 font-medium">{officer.loanOfficer}</td>
                    <td className="px-6 py-4 text-right">{officer.totalLoans}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-green-600 font-medium">{officer.activeLoans}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {officer.delinquentLoans > 0 ? (
                        <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {officer.delinquentLoans}
                        </span>
                      ) : (
                        <span className="text-green-600">0</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">{formatCurrency(officer.totalDisbursed)}</td>
                    <td className="px-6 py-4 text-right font-medium">{formatCurrency(officer.totalOutstanding)}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        Number(officer.parPercentage) > 10 ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                        Number(officer.parPercentage) > 5 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" :
                        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      }`}>
                        {Number(officer.parPercentage).toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
