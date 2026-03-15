"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_TCDC_COMPLIANCE_REPORT, GET_BRANCHES } from "@/lib/graphql/queries";
import { formatCurrency } from "@/lib/utils";
import { isNullListError } from "@/lib/error-utils";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import Link from "next/link";
// Helper to safely convert Decimal scalar (string) to number
const num = (v: any): number => (v == null ? 0 : Number(v) || 0);

import {
  ArrowLeft,
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  DollarSign,
  Users,
  Landmark,
  TrendingUp,
  Wallet,
  PiggyBank,
  Building2,
  Calendar,
  FileText,
  FileSpreadsheet,
  Printer,
} from "lucide-react";
import { exportToPDF, exportToExcel, type ExportOptions } from "@/lib/export-utils";
import { toast } from "sonner";

export default function TCDCCompliancePage() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [branchId, setBranchId] = useState<string>("");

  const { data, loading, error } = useQuery(GET_TCDC_COMPLIANCE_REPORT, {
    variables: { date, branchId: branchId || undefined },
    fetchPolicy: "network-only",
  });

  const { data: branchData } = useQuery(GET_BRANCHES, {
    variables: { status: "ACTIVE" },
  });

  const report = data?.tcdcComplianceReport || null;
  const branches = branchData?.branches || [];

  const handleExportPDF = async () => {
    if (!report) return;
    try {
      const summaryData = [
        { metric: "Total Assets", value: formatCurrency(report.totalAssets) },
        { metric: "Total Liabilities", value: formatCurrency(report.totalLiabilities) },
        { metric: "Total Equity", value: formatCurrency(report.totalEquity) },
        { metric: "Total Loans", value: formatCurrency(report.totalLoans) },
        { metric: "Total Deposits", value: formatCurrency(report.totalDeposits) },
        { metric: "Total Members", value: String(report.totalMembers || 0) },
        { metric: "Total Borrowers", value: String(report.totalBorrowers || 0) },
        { metric: "Capital Adequacy Ratio", value: `${num(report.capitalAdequacy?.capitalAdequacyRatio).toFixed(2)}% (Min: ${num(report.capitalAdequacy?.minimumRequired).toFixed(2)}%)` },
        { metric: "Capital Adequacy Status", value: report.capitalAdequacy?.compliant ? "COMPLIANT" : "NON-COMPLIANT" },
        { metric: "Liquidity Ratio", value: `${num(report.liquidityRatio?.liquidityRatio).toFixed(2)}% (Min: ${num(report.liquidityRatio?.minimumRequired).toFixed(2)}%)` },
        { metric: "Liquidity Status", value: report.liquidityRatio?.compliant ? "COMPLIANT" : "NON-COMPLIANT" },
      ];
      await exportToPDF({
        title: "TCDC Compliance Report",
        subtitle: `Report Date: ${date}`,
        filename: `tcdc-compliance-${date}`,
        columns: [
          { header: "Metric", key: "metric", width: 50 },
          { header: "Value", key: "value", width: 50 },
        ],
        data: summaryData,
      });
      toast.success("PDF exported successfully");
    } catch {
      toast.error("Failed to export PDF");
    }
  };

  const handleExportExcel = async () => {
    if (!report) return;
    try {
      const summaryData = [
        { Metric: "Total Assets", Value: num(report.totalAssets) },
        { Metric: "Total Liabilities", Value: num(report.totalLiabilities) },
        { Metric: "Total Equity", Value: num(report.totalEquity) },
        { Metric: "Total Loans", Value: num(report.totalLoans) },
        { Metric: "Total Deposits", Value: num(report.totalDeposits) },
        { Metric: "Total Members", Value: report.totalMembers || 0 },
        { Metric: "Total Borrowers", Value: report.totalBorrowers || 0 },
        { Metric: "Capital Adequacy Ratio (%)", Value: num(report.capitalAdequacy?.capitalAdequacyRatio) },
        { Metric: "CAR Minimum Required (%)", Value: num(report.capitalAdequacy?.minimumRequired) },
        { Metric: "Capital Compliant", Value: report.capitalAdequacy?.compliant ? "Yes" : "No" },
        { Metric: "Liquidity Ratio (%)", Value: num(report.liquidityRatio?.liquidityRatio) },
        { Metric: "Liquidity Minimum Required (%)", Value: num(report.liquidityRatio?.minimumRequired) },
        { Metric: "Liquidity Compliant", Value: report.liquidityRatio?.compliant ? "Yes" : "No" },
      ];
      // Add sector concentration data
      if (report.sectorConcentration?.length) {
        summaryData.push({ Metric: "", Value: "" });
        summaryData.push({ Metric: "--- Sector Concentration ---", Value: "" });
        report.sectorConcentration.forEach((s: any) => {
          summaryData.push({ Metric: `${s.sector} (${s.loanCount} loans)`, Value: `${formatCurrency(num(s.totalExposure))} (${num(s.percentageOfPortfolio).toFixed(1)}%)` });
        });
      }
      // Add insider lending data
      if (report.insiderLending?.length) {
        summaryData.push({ Metric: "", Value: "" });
        summaryData.push({ Metric: "--- Insider Lending ---", Value: "" });
        report.insiderLending.forEach((i: any) => {
          summaryData.push({ Metric: `${i.memberName} (${i.position})`, Value: `${formatCurrency(num(i.outstandingBalance))} (${num(i.percentageOfCoreCapital).toFixed(2)}% of capital)` });
        });
      }
      await exportToExcel({
        title: "TCDC Compliance Report",
        subtitle: `Report Date: ${date}`,
        filename: `tcdc-compliance-${date}`,
        columns: [
          { header: "Metric", key: "Metric" },
          { header: "Value", key: "Value" },
        ],
        data: summaryData,
      });
      toast.success("Excel exported successfully");
    } catch {
      toast.error("Failed to export Excel");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (error && !isNullListError(error)) return <ErrorDisplay error={error} />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/accounting"
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div className="p-3 bg-blue-500/10 rounded-lg">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              TCDC Compliance Report
            </h1>
            <p className="text-muted-foreground">
              Regulatory compliance dashboard for TCDC reporting requirements
            </p>
          </div>
        </div>
        {report && (
          <div className="flex items-center gap-2 no-print">
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
              title="Export PDF"
            >
              <FileText className="w-4 h-4 text-red-500" />
              PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
              title="Export Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-green-600" />
              Excel
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
              title="Print"
            >
              <Printer className="w-4 h-4 text-blue-500" />
              Print
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
          className="px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm focus:ring-2 focus:ring-primary"
        >
          <option value="">All Branches</option>
          {branches.map((b: any) => (
            <option key={b.id} value={b.id}>
              {b.branchName}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-4 animate-pulse"
              >
                <div className="h-3 bg-muted rounded w-2/3 mb-3" />
                <div className="h-6 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-6 animate-pulse"
              >
                <div className="h-4 bg-muted rounded w-1/3 mb-4" />
                <div className="h-20 bg-muted rounded mb-4" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      ) : report ? (
        <>
          {/* Executive Summary Cards */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">
              Executive Summary
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Key financial indicators as of{" "}
              {new Date(report.reportDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <SummaryCard
                label="Total Assets"
                value={formatCurrency(report.totalAssets)}
                icon={<Landmark className="w-4 h-4 text-blue-500" />}
              />
              <SummaryCard
                label="Total Liabilities"
                value={formatCurrency(report.totalLiabilities)}
                icon={<Wallet className="w-4 h-4 text-red-500" />}
              />
              <SummaryCard
                label="Total Equity"
                value={formatCurrency(report.totalEquity)}
                icon={<TrendingUp className="w-4 h-4 text-green-500" />}
              />
              <SummaryCard
                label="Total Loans"
                value={formatCurrency(report.totalLoans)}
                icon={<DollarSign className="w-4 h-4 text-orange-500" />}
              />
              <SummaryCard
                label="Total Deposits"
                value={formatCurrency(report.totalDeposits)}
                icon={<PiggyBank className="w-4 h-4 text-purple-500" />}
              />
              <SummaryCard
                label="Total Members"
                value={report.totalMembers?.toLocaleString() || "0"}
                icon={<Users className="w-4 h-4 text-cyan-500" />}
              />
              <SummaryCard
                label="Total Borrowers"
                value={report.totalBorrowers?.toLocaleString() || "0"}
                icon={<Building2 className="w-4 h-4 text-amber-500" />}
              />
            </div>
          </div>

          {/* Capital Adequacy & Liquidity Ratio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Capital Adequacy */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    Capital Adequacy
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Core capital as percentage of risk-weighted assets
                  </p>
                </div>
                <ComplianceBadge compliant={report.capitalAdequacy?.compliant} />
              </div>

              <div className="flex items-end gap-1 mb-4">
                <span
                  className={`text-4xl font-bold tabular-nums ${
                    report.capitalAdequacy?.compliant
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {num(report.capitalAdequacy?.capitalAdequacyRatio).toFixed(2)}
                </span>
                <span className="text-xl font-semibold text-muted-foreground mb-1">
                  %
                </span>
              </div>

              <RatioBar
                ratio={num(report.capitalAdequacy?.capitalAdequacyRatio)}
                minimum={num(report.capitalAdequacy?.minimumRequired)}
                compliant={report.capitalAdequacy?.compliant}
              />

              <div className="mt-4 space-y-2">
                <DetailRow
                  label="Core Capital"
                  value={formatCurrency(
                    report.capitalAdequacy?.coreCapital || 0
                  )}
                />
                <DetailRow
                  label="Risk-Weighted Assets"
                  value={formatCurrency(
                    report.capitalAdequacy?.riskWeightedAssets || 0
                  )}
                />
                <DetailRow
                  label="CAR Ratio"
                  value={`${num(report.capitalAdequacy?.capitalAdequacyRatio).toFixed(2)}%`}
                />
                <DetailRow
                  label="Minimum Required"
                  value={`${num(report.capitalAdequacy?.minimumRequired).toFixed(2)}%`}
                />
              </div>
            </div>

            {/* Liquidity Ratio */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    Liquidity Ratio
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Liquid assets as percentage of short-term liabilities
                  </p>
                </div>
                <ComplianceBadge compliant={report.liquidityRatio?.compliant} />
              </div>

              <div className="flex items-end gap-1 mb-4">
                <span
                  className={`text-4xl font-bold tabular-nums ${
                    report.liquidityRatio?.compliant
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {num(report.liquidityRatio?.liquidityRatio).toFixed(2)}
                </span>
                <span className="text-xl font-semibold text-muted-foreground mb-1">
                  %
                </span>
              </div>

              <RatioBar
                ratio={num(report.liquidityRatio?.liquidityRatio)}
                minimum={num(report.liquidityRatio?.minimumRequired)}
                compliant={report.liquidityRatio?.compliant}
              />

              <div className="mt-4 space-y-2">
                <DetailRow
                  label="Liquid Assets"
                  value={formatCurrency(
                    report.liquidityRatio?.liquidAssets || 0
                  )}
                />
                <DetailRow
                  label="Short-Term Liabilities"
                  value={formatCurrency(
                    report.liquidityRatio?.shortTermLiabilities || 0
                  )}
                />
                <DetailRow
                  label="Liquidity Ratio"
                  value={`${num(report.liquidityRatio?.liquidityRatio).toFixed(2)}%`}
                />
                <DetailRow
                  label="Minimum Required"
                  value={`${num(report.liquidityRatio?.minimumRequired).toFixed(2)}%`}
                />
              </div>
            </div>
          </div>

          {/* Sector Concentration */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">
              Sector Concentration
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Loan portfolio distribution by economic sector
            </p>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Sector
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Loan Count
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Total Exposure
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      % of Portfolio
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {report.sectorConcentration &&
                  report.sectorConcentration.length > 0 ? (
                    report.sectorConcentration.map((sector: any) => (
                      <tr
                        key={sector.sector}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-5 py-3 font-medium text-foreground">
                          {sector.sector}
                        </td>
                        <td className="px-5 py-3 text-right text-foreground tabular-nums">
                          {sector.loanCount}
                        </td>
                        <td className="px-5 py-3 text-right text-foreground tabular-nums">
                          {formatCurrency(sector.totalExposure)}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{
                                  width: `${Math.min(num(sector.percentageOfPortfolio), 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-foreground tabular-nums font-medium">
                              {num(sector.percentageOfPortfolio).toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-8 text-center text-muted-foreground"
                      >
                        No sector concentration data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Insider Lending */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Insider Lending
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Loans to board members, officers, and connected parties
            </p>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Member Name
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Loan Amount
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Outstanding Balance
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      % of Core Capital
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {report.insiderLending &&
                  report.insiderLending.length > 0 ? (
                    report.insiderLending.map((insider: any, idx: number) => (
                      <tr
                        key={idx}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-5 py-3 font-medium text-foreground">
                          {insider.memberName}
                        </td>
                        <td className="px-5 py-3 text-foreground">
                          {insider.position}
                        </td>
                        <td className="px-5 py-3 text-right text-foreground tabular-nums">
                          {formatCurrency(insider.loanAmount)}
                        </td>
                        <td className="px-5 py-3 text-right text-foreground tabular-nums">
                          {formatCurrency(insider.outstandingBalance)}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium tabular-nums ${
                              num(insider.percentageOfCoreCapital) > 5
                                ? "bg-red-500/10 text-red-600 border border-red-500/20"
                                : "bg-green-500/10 text-green-600 border border-green-500/20"
                            }`}
                          >
                            {num(insider.percentageOfCoreCapital).toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-8 text-center text-muted-foreground"
                      >
                        No insider lending data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No compliance data available for the selected date
        </div>
      )}
    </div>
  );
}

/* ── Helper Components ── */

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-lg font-bold text-foreground tabular-nums">{value}</p>
    </div>
  );
}

function ComplianceBadge({ compliant }: { compliant?: boolean }) {
  if (compliant === undefined || compliant === null) return null;
  return compliant ? (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-600 border border-green-500/20">
      <ShieldCheck className="w-4 h-4" />
      Compliant
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 border border-red-500/20">
      <ShieldAlert className="w-4 h-4" />
      Non-Compliant
    </span>
  );
}

function RatioBar({
  ratio,
  minimum,
  compliant,
}: {
  ratio: number;
  minimum: number;
  compliant?: boolean;
}) {
  const maxDisplay = Math.max(ratio, minimum) * 1.3 || 100;
  const ratioWidth = Math.min((ratio / maxDisplay) * 100, 100);
  const minimumPos = Math.min((minimum / maxDisplay) * 100, 100);

  return (
    <div className="relative">
      <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            compliant ? "bg-green-500" : "bg-red-500"
          }`}
          style={{ width: `${ratioWidth}%` }}
        />
      </div>
      {/* Minimum threshold marker */}
      <div
        className="absolute top-0 h-4 border-r-2 border-dashed border-foreground/40"
        style={{ left: `${minimumPos}%` }}
      />
      <div className="flex justify-between mt-1.5">
        <span className="text-xs text-muted-foreground">0%</span>
        <span className="text-xs text-muted-foreground">
          Min: {Number(minimum || 0).toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground tabular-nums">{value}</span>
    </div>
  );
}
