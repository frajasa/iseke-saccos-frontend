"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_DELINQUENCY_REPORT, GET_BRANCHES } from "@/lib/graphql/queries";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, Calculator, Calendar, Building2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import ExportDropdown from "@/components/ExportDropdown";
import { ExportOptions, handleExport } from "@/lib/export-utils";

export default function DelinquencyReportPage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedBranchId, setSelectedBranchId] = useState("");

  const { data: branchesData } = useQuery(GET_BRANCHES);
  const { data, loading, error } = useQuery(GET_DELINQUENCY_REPORT, {
    variables: {
      branchId: selectedBranchId || undefined,
      date: selectedDate,
    },
  });

  const report = data?.delinquencyReport;

  const getRangeColor = (range: string) => {
    if (range.includes("Current") || range.includes("1-30")) return "bg-success/10 text-success";
    if (range.includes("31-60")) return "bg-amber-500/10 text-amber-600";
    if (range.includes("61-90")) return "bg-orange-500/10 text-orange-600";
    return "bg-destructive/10 text-destructive";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/accounting" className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div className="p-3 bg-red-500/10 rounded-lg">
            <Calculator className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Delinquency Report</h1>
            <p className="text-muted-foreground">View loan aging and delinquency analysis</p>
          </div>
        </div>
        <ExportDropdown
          onExport={(format) => {
            const ranges = report?.ranges || [];
            const exportOptions: ExportOptions = {
              title: "Delinquency Report",
              subtitle: `As of ${formatDate(selectedDate)}`,
              filename: "delinquency-report",
              columns: [
                { header: "Age Range", key: "range", width: 20 },
                { header: "Number of Loans", key: "numberOfLoans", width: 18, format: "number" },
                { header: "Outstanding Amount", key: "outstandingAmount", width: 22, format: "currency" },
                { header: "Percentage", key: "percentage", width: 14, format: "percent" },
              ],
              data: ranges.map((r: any) => ({
                range: r.range,
                numberOfLoans: r.numberOfLoans,
                outstandingAmount: r.outstandingAmount,
                percentage: r.percentage,
              })),
              summary: [
                { label: "Total Outstanding", value: formatCurrency(report?.totalOutstanding ?? 0) },
                { label: "Total At Risk", value: formatCurrency(report?.totalAtRisk ?? 0) },
              ],
            };
            handleExport(format, exportOptions, "print-report");
          }}
          disabled={!report?.ranges?.length}
        />
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              As of Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <div className="text-muted-foreground">Loading delinquency report...</div>
        </div>
      ) : error ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <div className="text-destructive">Error: {error.message}</div>
        </div>
      ) : report ? (
        <div id="print-report">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <div className="text-sm text-muted-foreground">Total Outstanding</div>
              </div>
              <div className="text-2xl font-bold text-foreground tracking-tight">
                {formatCurrency(report.totalOutstanding)}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <div className="text-sm text-muted-foreground">Total At Risk</div>
              </div>
              <div className="text-3xl font-bold text-destructive">
                {formatCurrency(report.totalAtRisk)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {Number(report.totalOutstanding) > 0
                  ? ((Number(report.totalAtRisk) / Number(report.totalOutstanding)) * 100).toFixed(1)
                  : 0}
                % of portfolio
              </div>
            </div>
          </div>

          {/* Aging Table */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-6 bg-muted/50 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">Loan Aging Analysis</h2>
              <p className="text-sm text-muted-foreground">
                As of {formatDate(selectedDate)}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Age Range
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Number of Loans
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Outstanding Amount
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Percentage
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Distribution
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {report.ranges?.map((range: { range: string; numberOfLoans: number; outstandingAmount: number; percentage: number }, index: number) => (
                    <tr key={index} className="hover:bg-secondary/50 transition-colors">
                      <td className="px-4 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getRangeColor(
                            range.range
                          )}`}
                        >
                          {range.range}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center text-foreground font-semibold">
                        {range.numberOfLoans}
                      </td>
                      <td className="px-4 py-4 text-right font-mono text-foreground">
                        {formatCurrency(range.outstandingAmount)}
                      </td>
                      <td className="px-4 py-4 text-right font-mono text-foreground">
                        {typeof range.percentage === 'number' ? range.percentage.toFixed(2) : '0.00'}%
                      </td>
                      <td className="px-4 py-4">
                        <div className="w-full bg-muted rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all ${
                              getRangeColor(range.range).split(" ")[0].replace("/10", "")
                            }`}
                            style={{ width: `${Math.min(typeof range.percentage === 'number' ? range.percentage : 0, 100)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted/50 border-t-2 border-border font-semibold">
                  <tr>
                    <td className="px-4 py-4 text-foreground">Total</td>
                    <td className="px-4 py-4 text-center text-foreground">
                      {report.ranges?.reduce(
                        (sum: number, r: { numberOfLoans: number }) => sum + r.numberOfLoans,
                        0
                      )}
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-foreground">
                      {formatCurrency(report.totalOutstanding)}
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-foreground">100.00%</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Risk Assessment */}
          <div
            className={`p-6 rounded-lg border-2 ${
              (Number(report.totalAtRisk) / Number(report.totalOutstanding)) * 100 < 5
                ? "bg-success/5 border-success"
                : (Number(report.totalAtRisk) / Number(report.totalOutstanding)) * 100 < 10
                ? "bg-amber-500/5 border-amber-500"
                : "bg-destructive/5 border-destructive"
            }`}
          >
            <h3 className="text-lg font-semibold text-foreground mb-2">Risk Assessment</h3>
            <p className="text-sm text-muted-foreground">
              {(Number(report.totalAtRisk) / Number(report.totalOutstanding)) * 100 < 5
                ? "Low Risk: Portfolio at risk is less than 5%. Portfolio is performing well."
                : (Number(report.totalAtRisk) / Number(report.totalOutstanding)) * 100 < 10
                ? "Moderate Risk: Portfolio at risk is between 5-10%. Monitor closely."
                : "High Risk: Portfolio at risk exceeds 10%. Immediate action recommended."}
            </p>
          </div>

          {/* Recommendations */}
          {(Number(report.totalAtRisk) / Number(report.totalOutstanding)) * 100 >= 10 && (
            <div className="bg-destructive/5 border border-destructive rounded-lg p-6">
              <h3 className="text-lg font-semibold text-destructive mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Recommended Actions
              </h3>
              <ul className="space-y-2 text-sm text-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-destructive">•</span>
                  <span>Review and contact all delinquent borrowers immediately</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive">•</span>
                  <span>Implement stricter loan approval criteria</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive">•</span>
                  <span>Increase follow-up frequency for at-risk accounts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive">•</span>
                  <span>Consider restructuring or rescheduling problem loans</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Calculator className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No delinquency data available for the selected date.
          </p>
        </div>
      )}
    </div>
  );
}
