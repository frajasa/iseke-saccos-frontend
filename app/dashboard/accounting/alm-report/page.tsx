"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_ALM_REPORT } from "@/lib/graphql/queries";
import { ALMReport } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { isNullListError } from "@/lib/error-utils";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import { handleExport, ExportOptions, ExportColumn } from "@/lib/export-utils";
import { Download, FileSpreadsheet, FileText, Printer, ChevronDown } from "lucide-react";

export default function ALMReportPage() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const { data, loading, error } = useQuery(GET_ALM_REPORT, {
    variables: { date },
  });

  const report: ALMReport | null = data?.almReport || null;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const doExport = (format: "excel" | "pdf" | "print") => {
    if (!report) return;
    setShowExportMenu(false);

    if (format === "print") {
      handleExport("print", {} as ExportOptions, "alm-report-printable");
      return;
    }

    // Build combined data: Loan Maturity + Deposit Maturity + Gap Analysis
    const gapColumns: ExportColumn[] = [
      { header: "Bucket", key: "bucket", width: 22 },
      { header: "Loans (Assets)", key: "loanAmount", format: "currency", width: 20 },
      { header: "Deposits (Liabilities)", key: "depositAmount", format: "currency", width: 22 },
      { header: "Gap", key: "gap", format: "currency", width: 20 },
      { header: "Cumulative Gap", key: "cumulativeGap", format: "currency", width: 20 },
    ];

    const exportOptions: ExportOptions = {
      title: "Asset Liability Management Report",
      subtitle: `Report Date: ${new Date(date).toLocaleDateString("en-GB")}`,
      filename: `ALM_Report_${date}`,
      columns: gapColumns,
      data: report.gapAnalysis,
      orientation: "landscape",
      summary: [
        { label: "Total Loans (Assets)", value: formatCurrency(report.totalLoans) },
        { label: "Total Deposits (Liabilities)", value: formatCurrency(report.totalDeposits) },
        { label: "Net Gap", value: formatCurrency(report.netGap) },
      ],
    };

    handleExport(format, exportOptions);
  };

  if (error && !isNullListError(error)) return <ErrorDisplay error={error} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Asset Liability Management Report</h1>
          <p className="text-sm text-muted-foreground">Maturity schedules and gap analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm"
          />
          {report && (
            <div className="relative" ref={exportRef}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
                <ChevronDown className="w-3 h-3" />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                  <button onClick={() => doExport("excel")} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors rounded-t-lg">
                    <FileSpreadsheet className="w-4 h-4 text-green-600" /> Export to Excel
                  </button>
                  <button onClick={() => doExport("pdf")} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                    <FileText className="w-4 h-4 text-red-600" /> Export to PDF
                  </button>
                  <button onClick={() => doExport("print")} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors rounded-b-lg">
                    <Printer className="w-4 h-4 text-blue-600" /> Print Report
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading report...</div>
      ) : report ? (
        <div id="alm-report-printable">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-sm text-muted-foreground">Total Loans (Assets)</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(report.totalLoans)}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-sm text-muted-foreground">Total Deposits (Liabilities)</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(report.totalDeposits)}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-sm text-muted-foreground">Net Gap</p>
              <p className={`text-2xl font-bold ${report.netGap >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(report.netGap)}
              </p>
            </div>
          </div>

          {/* Loan Maturity Schedule */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Loan Maturity Schedule</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Maturity Bucket</th>
                  <th className="text-right px-5 py-3 font-medium text-muted-foreground">Count</th>
                  <th className="text-right px-5 py-3 font-medium text-muted-foreground">Amount</th>
                </tr>
              </thead>
              <tbody>
                {report.loanMaturity.map((b) => (
                  <tr key={b.bucket} className="border-t border-border">
                    <td className="px-5 py-3 text-foreground">{b.bucket}</td>
                    <td className="px-5 py-3 text-right text-foreground">{b.count}</td>
                    <td className="px-5 py-3 text-right font-medium text-foreground">{formatCurrency(b.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Deposit Maturity Schedule */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Deposit Maturity Schedule</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Maturity Bucket</th>
                  <th className="text-right px-5 py-3 font-medium text-muted-foreground">Count</th>
                  <th className="text-right px-5 py-3 font-medium text-muted-foreground">Amount</th>
                </tr>
              </thead>
              <tbody>
                {report.depositMaturity.map((b) => (
                  <tr key={b.bucket} className="border-t border-border">
                    <td className="px-5 py-3 text-foreground">{b.bucket}</td>
                    <td className="px-5 py-3 text-right text-foreground">{b.count}</td>
                    <td className="px-5 py-3 text-right font-medium text-foreground">{formatCurrency(b.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Gap Analysis */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Gap Analysis</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Bucket</th>
                  <th className="text-right px-5 py-3 font-medium text-muted-foreground">Loans (Assets)</th>
                  <th className="text-right px-5 py-3 font-medium text-muted-foreground">Deposits (Liabilities)</th>
                  <th className="text-right px-5 py-3 font-medium text-muted-foreground">Gap</th>
                  <th className="text-right px-5 py-3 font-medium text-muted-foreground">Cumulative Gap</th>
                </tr>
              </thead>
              <tbody>
                {report.gapAnalysis.map((g) => (
                  <tr key={g.bucket} className="border-t border-border">
                    <td className="px-5 py-3 text-foreground">{g.bucket}</td>
                    <td className="px-5 py-3 text-right text-foreground">{formatCurrency(g.loanAmount)}</td>
                    <td className="px-5 py-3 text-right text-foreground">{formatCurrency(g.depositAmount)}</td>
                    <td className={`px-5 py-3 text-right font-medium ${g.gap >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(g.gap)}
                    </td>
                    <td className={`px-5 py-3 text-right font-medium ${g.cumulativeGap >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(g.cumulativeGap)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">No data available</div>
      )}
    </div>
  );
}
