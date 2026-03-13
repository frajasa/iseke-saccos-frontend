"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_DIVIDEND_ALLOCATIONS,
  CALCULATE_ENHANCED_DIVIDENDS,
} from "@/lib/graphql/queries";
import { formatCurrency } from "@/lib/utils";
import { isNullListError } from "@/lib/error-utils";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import ExportDropdown from "@/components/ExportDropdown";
import { handleExport, ExportColumn, ExportOptions } from "@/lib/export-utils";
import { Coins, Calculator, Eye, X } from "lucide-react";

interface Allocation {
  id: string;
  member: { id: string; fullName: string; memberNumber: string };
  savingsAccount?: { id: string; accountNumber: string };
  interestPoints?: number;
  allocationAmount: number;
  taxAmount: number;
  netAmount: number;
  posted: boolean;
  createdAt?: string;
}

const DISTRIBUTION_METHODS = [
  { value: "EQUAL", label: "Equal Distribution" },
  { value: "SHARE_PROPORTION", label: "Share Proportion" },
  { value: "INTEREST_POINTS", label: "Interest Points" },
];

const METHODS = [
  { value: "INTEREST", label: "Interest Rate (%)" },
  { value: "DIVIDEND", label: "Dividend Rate (%)" },
  { value: "PROFIT", label: "Profit Figure (TZS)" },
];

export default function EnhancedDividendsPage() {
  const currentYear = new Date().getFullYear();
  const [form, setForm] = useState({
    year: currentYear.toString(),
    method: "DIVIDEND",
    rateOrProfit: "",
    distributionMethod: "SHARE_PROPORTION",
  });
  const [viewRunId, setViewRunId] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const { data: allocData, loading: allocLoading, error: allocError } = useQuery(
    GET_DIVIDEND_ALLOCATIONS,
    { variables: { dividendRunId: viewRunId }, skip: !viewRunId }
  );

  const allocations: Allocation[] =
    allocData?.dividendAllocations || (allocError && isNullListError(allocError) ? [] : []);

  const [calculate, { loading: calculating }] = useMutation(CALCULATE_ENHANCED_DIVIDENDS, {
    onCompleted: (data) => {
      setResult(data.calculateEnhancedDividends);
      setViewRunId(data.calculateEnhancedDividends.id);
    },
  });

  const handleCalculate = () => {
    if (!form.rateOrProfit) return;
    calculate({
      variables: {
        year: parseInt(form.year),
        method: form.method,
        rateOrProfit: parseFloat(form.rateOrProfit),
        distributionMethod: form.distributionMethod,
      },
    });
  };

  const exportColumns: ExportColumn[] = [
    { header: "Member #", key: "memberNumber", width: 14 },
    { header: "Member Name", key: "memberName", width: 25 },
    { header: "Account", key: "accountNumber", width: 16 },
    { header: "Interest Points", key: "interestPoints", format: "number", width: 14 },
    { header: "Allocation", key: "allocationAmount", format: "currency", width: 18 },
    { header: "Tax", key: "taxAmount", format: "currency", width: 14 },
    { header: "Net Amount", key: "netAmount", format: "currency", width: 18 },
  ];

  const exportData = allocations.map((a) => ({
    memberNumber: a.member.memberNumber,
    memberName: a.member.fullName,
    accountNumber: a.savingsAccount?.accountNumber || "-",
    interestPoints: a.interestPoints || 0,
    allocationAmount: a.allocationAmount,
    taxAmount: a.taxAmount,
    netAmount: a.netAmount,
  }));

  const exportOptions: ExportOptions = {
    title: `Dividend Allocations - ${form.year}`,
    subtitle: `Method: ${form.distributionMethod}`,
    filename: `dividend-allocations-${form.year}`,
    columns: exportColumns,
    data: exportData,
    summary: result ? [
      { label: "Total Amount", value: formatCurrency(result.totalAmount || 0) },
      { label: "Members Paid", value: String(result.membersPaid || 0) },
    ] : [],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Enhanced Dividends</h1>
        <p className="text-sm text-muted-foreground">Calculate and distribute dividends with multiple methods</p>
      </div>

      {/* Calculate Form */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" /> Calculate Dividends
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Year</label>
            <input
              type="number"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Method</label>
            <select
              value={form.method}
              onChange={(e) => setForm({ ...form, method: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
            >
              {METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {form.method === "PROFIT" ? "Profit Figure (TZS)" : "Rate (e.g. 0.05 for 5%)"}
            </label>
            <input
              type="number"
              step={form.method === "PROFIT" ? "1" : "0.0001"}
              value={form.rateOrProfit}
              onChange={(e) => setForm({ ...form, rateOrProfit: e.target.value })}
              placeholder={form.method === "PROFIT" ? "e.g. 50000000" : "e.g. 0.05"}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Distribution Method</label>
            <select
              value={form.distributionMethod}
              onChange={(e) => setForm({ ...form, distributionMethod: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
            >
              {DISTRIBUTION_METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={handleCalculate}
            disabled={calculating || !form.rateOrProfit}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 text-sm font-medium"
          >
            <Coins className="w-4 h-4" />
            {calculating ? "Calculating..." : "Calculate Dividends"}
          </button>
        </div>
      </div>

      {/* Result Summary */}
      {result && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">Total Amount</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(result.totalAmount || 0)}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">Members Paid</p>
            <p className="text-lg font-bold text-foreground">{result.membersPaid || 0}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">Distribution</p>
            <p className="text-lg font-bold text-foreground">{result.distributionMethod?.replace(/_/g, " ") || "-"}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="text-lg font-bold text-green-600">{result.status}</p>
          </div>
        </div>
      )}

      {/* Allocations Table */}
      {viewRunId && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="font-semibold">Dividend Allocations</h3>
            <ExportDropdown
              onExport={(fmt) => handleExport(fmt, exportOptions, "dividend-print")}
              disabled={allocations.length === 0}
            />
          </div>
          {allocError && !isNullListError(allocError) && <ErrorDisplay error={allocError} />}
          <div className="overflow-x-auto" id="dividend-print">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-semibold">Member #</th>
                  <th className="text-left px-4 py-3 font-semibold">Name</th>
                  <th className="text-left px-4 py-3 font-semibold">Account</th>
                  <th className="text-right px-4 py-3 font-semibold">Interest Pts</th>
                  <th className="text-right px-4 py-3 font-semibold">Allocation</th>
                  <th className="text-right px-4 py-3 font-semibold">Tax</th>
                  <th className="text-right px-4 py-3 font-semibold">Net Amount</th>
                  <th className="text-center px-4 py-3 font-semibold">Posted</th>
                </tr>
              </thead>
              <tbody>
                {allocLoading ? (
                  <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
                ) : allocations.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">No allocations</td></tr>
                ) : (
                  allocations.map((a) => (
                    <tr key={a.id} className="border-b border-border hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-xs">{a.member.memberNumber}</td>
                      <td className="px-4 py-3">{a.member.fullName}</td>
                      <td className="px-4 py-3 font-mono text-xs">{a.savingsAccount?.accountNumber || "-"}</td>
                      <td className="px-4 py-3 text-right">{a.interestPoints?.toLocaleString() || "-"}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatCurrency(a.allocationAmount)}</td>
                      <td className="px-4 py-3 text-right text-red-600">{formatCurrency(a.taxAmount)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-green-600">{formatCurrency(a.netAmount)}</td>
                      <td className="px-4 py-3 text-center">
                        {a.posted ? (
                          <span className="text-green-600">Yes</span>
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
