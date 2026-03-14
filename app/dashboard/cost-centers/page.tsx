"use client";

import { useState } from "react";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
import {
  GET_COST_CENTERS, CREATE_COST_CENTER, UPDATE_COST_CENTER, GET_COST_CENTER_REPORT,
} from "@/lib/graphql/queries";
import { CostCenter } from "@/lib/types";
import { formatDate, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, BarChart3, X } from "lucide-react";

const CENTER_TYPES = ["COST", "PROFIT", "INVESTMENT"];

export default function CostCentersPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportStart, setReportStart] = useState("");
  const [reportEnd, setReportEnd] = useState("");
  const [form, setForm] = useState({ centerCode: "", centerName: "", description: "", centerType: "COST", parentCenterId: "", managerName: "" });

  const { data, loading, error, refetch } = useQuery(GET_COST_CENTERS);
  const [fetchReport, { data: reportData, loading: reportLoading }] = useLazyQuery(GET_COST_CENTER_REPORT);

  const [createCenter] = useMutation(CREATE_COST_CENTER, {
    onCompleted: () => { toast.success("Cost center created"); refetch(); setShowAdd(false); setForm({ centerCode: "", centerName: "", description: "", centerType: "COST", parentCenterId: "", managerName: "" }); },
    onError: (err) => toast.error(err.message),
  });

  const [updateCenter] = useMutation(UPDATE_COST_CENTER, {
    onCompleted: () => { toast.success("Cost center updated"); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const centers: CostCenter[] = data?.costCenters || [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let reportRows: any[] = [];
  if (reportData?.costCenterReport) {
    try { reportRows = typeof reportData.costCenterReport === "string" ? JSON.parse(reportData.costCenterReport) : reportData.costCenterReport; } catch { reportRows = []; }
  }

  const runReport = () => {
    if (!reportStart || !reportEnd) { toast.error("Select both dates"); return; }
    fetchReport({ variables: { startDate: reportStart, endDate: reportEnd } });
  };

  if (loading) return <div className="p-8"><div className="animate-pulse text-muted-foreground">Loading cost centers...</div></div>;
  if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cost Center Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage cost, profit, and investment centers</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowReport(!showReport)} className="flex items-center gap-2 px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 text-sm font-medium">
            <BarChart3 className="w-4 h-4" /> Profitability Report
          </button>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium">
            <Plus className="w-4 h-4" /> Add Cost Center
          </button>
        </div>
      </div>

      {/* Cost Centers Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border"><h2 className="text-lg font-semibold">Cost Centers ({centers.length})</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-border bg-muted/50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Code</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Name</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Type</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Parent</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Branch</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Manager</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Created</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
            </tr></thead>
            <tbody>
              {centers.map((c) => (
                <tr key={c.id} className="border-b border-border hover:bg-muted/30">
                  <td className="px-6 py-3 font-mono text-sm">{c.centerCode}</td>
                  <td className="px-6 py-3 font-medium">{c.centerName}</td>
                  <td className="px-6 py-3 text-sm">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      c.centerType === "PROFIT" ? "bg-green-100 text-green-700" :
                      c.centerType === "INVESTMENT" ? "bg-blue-100 text-blue-700" :
                      "bg-orange-100 text-orange-700"
                    }`}>{c.centerType}</span>
                  </td>
                  <td className="px-6 py-3 text-sm">{c.parentCenter?.centerName || "-"}</td>
                  <td className="px-6 py-3 text-sm">{c.branch?.branchName || "-"}</td>
                  <td className="px-6 py-3 text-sm">{c.managerName || "-"}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${c.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm">{formatDate(c.createdAt)}</td>
                  <td className="px-6 py-3">
                    <button onClick={() => updateCenter({ variables: { id: c.id, isActive: !c.isActive } })}
                      className="text-xs px-2 py-1 rounded border border-border hover:bg-muted">
                      {c.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
              {centers.length === 0 && <tr><td colSpan={9} className="px-6 py-8 text-center text-muted-foreground">No cost centers found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profitability Report */}
      {showReport && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center">
            <h2 className="text-lg font-semibold">Cost Center Profitability Report</h2>
            <button onClick={() => setShowReport(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
          <div className="px-6 py-4 flex gap-3 items-end border-b border-border">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Start Date</label>
              <input type="date" value={reportStart} onChange={(e) => setReportStart(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">End Date</label>
              <input type="date" value={reportEnd} onChange={(e) => setReportEnd(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            </div>
            <button onClick={runReport} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium">Generate</button>
          </div>
          {reportLoading ? <div className="p-6 text-muted-foreground">Loading report...</div> : (
            <table className="w-full">
              <thead><tr className="border-b border-border bg-muted/50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Center</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Type</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Income</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Expenses</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Net Result</th>
              </tr></thead>
              <tbody>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {reportRows.map((r: any, i: number) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-6 py-3 text-sm font-medium">{r.centerName || r.center}</td>
                    <td className="px-6 py-3 text-sm">{r.centerType || r.type || "-"}</td>
                    <td className="px-6 py-3 text-sm text-right">{formatCurrency(r.income || 0)}</td>
                    <td className="px-6 py-3 text-sm text-right">{formatCurrency(r.expenses || 0)}</td>
                    <td className={`px-6 py-3 text-sm text-right font-semibold ${(r.netResult || 0) < 0 ? "text-red-600" : "text-green-600"}`}>
                      {formatCurrency(r.netResult || 0)}
                    </td>
                  </tr>
                ))}
                {reportRows.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Generate a report to see data</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Add Cost Center Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowAdd(false)}>
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Add Cost Center</h2>
            <div className="space-y-3">
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Center Code *</label>
                <input type="text" value={form.centerCode} onChange={(e) => setForm({ ...form, centerCode: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" placeholder="e.g. CC-001" /></div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Center Name *</label>
                <input type="text" value={form.centerName} onChange={(e) => setForm({ ...form, centerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" placeholder="e.g. Main Branch Operations" /></div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /></div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Center Type *</label>
                <select value={form.centerType} onChange={(e) => setForm({ ...form, centerType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
                  {CENTER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select></div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Parent Center</label>
                <select value={form.parentCenterId} onChange={(e) => setForm({ ...form, parentCenterId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
                  <option value="">None</option>
                  {centers.map(c => <option key={c.id} value={c.id}>{c.centerCode} - {c.centerName}</option>)}
                </select></div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Manager Name</label>
                <input type="text" value={form.managerName} onChange={(e) => setForm({ ...form, managerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /></div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-border rounded-lg text-sm">Cancel</button>
              <button onClick={() => createCenter({ variables: { ...form, parentCenterId: form.parentCenterId || undefined } })}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
