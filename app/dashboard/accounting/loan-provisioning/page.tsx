"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_LOAN_PROVISION_REPORT } from "@/lib/graphql/queries";
import { formatCurrency } from "@/lib/utils";
import { ShieldAlert, Calendar, Printer, Download } from "lucide-react";

const classificationColors: Record<string, string> = {
  CURRENT: "bg-green-100 text-green-800",
  WATCH: "bg-yellow-100 text-yellow-800",
  SUBSTANDARD: "bg-orange-100 text-orange-800",
  DOUBTFUL: "bg-red-100 text-red-800",
  LOSS: "bg-red-200 text-red-900",
};

export default function LoanProvisioningPage() {
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

  const { data, loading, error } = useQuery(GET_LOAN_PROVISION_REPORT, {
    variables: { date },
    fetchPolicy: "network-only",
  });

  const report = data?.loanProvisionReport;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-500/10 rounded-lg">
            <ShieldAlert className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Loan Provisioning Report</h1>
            <p className="text-muted-foreground">Loan classification and provision analysis</p>
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

      {/* Date Selector */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="max-w-xs">
          <label className="block text-sm font-medium text-foreground mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Report Date
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
          Loading provision report...
        </div>
      ) : error ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center text-destructive">
          Error: {error.message}
        </div>
      ) : !report ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center text-muted-foreground">
          <ShieldAlert className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>No provision data available.</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-1">Total Outstanding Portfolio</div>
              <div className="text-2xl font-bold font-mono text-foreground">
                {formatCurrency(report.totalOutstanding)}
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="text-sm text-red-700 mb-1">Total Provision Required</div>
              <div className="text-2xl font-bold font-mono text-red-700">
                {formatCurrency(report.totalProvision)}
              </div>
              <div className="text-xs text-red-600 mt-1">
                {report.totalOutstanding > 0
                  ? ((report.totalProvision / report.totalOutstanding) * 100).toFixed(2)
                  : "0.00"}% of portfolio
              </div>
            </div>
          </div>

          {/* Classification Table */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Loan Classifications</h3>
              <p className="text-sm text-muted-foreground">
                As per Tanzania Registrar of Cooperative Societies standards
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Classification</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">No. of Loans</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Outstanding Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Provision Rate</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Provision Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {report.classifications?.map((cls: any) => (
                    <tr key={cls.classification} className="hover:bg-secondary/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${classificationColors[cls.classification] || "bg-gray-100 text-gray-800"}`}>
                          {cls.classification}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono text-foreground">{cls.count}</td>
                      <td className="px-4 py-3 text-sm text-right font-mono text-foreground">
                        {formatCurrency(cls.outstandingAmount)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono text-foreground">
                        {(cls.provisionRate * 100).toFixed(0)}%
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono font-semibold text-red-600">
                        {formatCurrency(cls.provisionAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted/50 border-t-2 border-border font-semibold">
                  <tr>
                    <td className="px-4 py-3 text-sm text-foreground">Total</td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-foreground">
                      {report.classifications?.reduce((sum: number, cls: any) => sum + cls.count, 0)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-foreground">
                      {formatCurrency(report.totalOutstanding)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-foreground">-</td>
                    <td className="px-4 py-3 text-sm text-right font-mono font-semibold text-red-600">
                      {formatCurrency(report.totalProvision)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
