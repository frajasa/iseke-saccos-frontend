"use client";

import { useState } from "react";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
import {
  GET_BUDGETS, CREATE_BUDGET, GET_BUDGET_LINES, ADD_BUDGET_LINE,
  UPDATE_BUDGET_LINE, APPROVE_BUDGET, ACTIVATE_BUDGET, CLOSE_BUDGET,
  GET_BUDGET_VS_ACTUAL, GET_CHART_OF_ACCOUNTS,
} from "@/lib/graphql/queries";
import { Budget, BudgetLine } from "@/lib/types";
import { formatDate, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, CheckCircle, Play, XCircle, BarChart3, X } from "lucide-react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function BudgetsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [showAddLine, setShowAddLine] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [form, setForm] = useState({ budgetName: "", fiscalYear: new Date().getFullYear().toString(), startDate: "", endDate: "", notes: "" });
  const [lineForm, setLineForm] = useState({ accountId: "", periodMonth: "1", amount: "", notes: "" });
  const [editLine, setEditLine] = useState<BudgetLine | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const { data, loading, error, refetch } = useQuery(GET_BUDGETS);
  const { data: accountsData } = useQuery(GET_CHART_OF_ACCOUNTS);
  const [fetchLines, { data: linesData, refetch: refetchLines }] = useLazyQuery(GET_BUDGET_LINES, { fetchPolicy: "network-only" });
  const [fetchReport, { data: reportData, loading: reportLoading }] = useLazyQuery(GET_BUDGET_VS_ACTUAL);

  const [createBudget] = useMutation(CREATE_BUDGET, {
    onCompleted: () => { toast.success("Budget created"); refetch(); setShowCreate(false); setForm({ budgetName: "", fiscalYear: new Date().getFullYear().toString(), startDate: "", endDate: "", notes: "" }); },
    onError: (err) => toast.error(err.message),
  });

  const [addBudgetLine] = useMutation(ADD_BUDGET_LINE, {
    onCompleted: () => { toast.success("Budget line added"); if (selectedBudget) refetchLines?.(); setShowAddLine(false); setLineForm({ accountId: "", periodMonth: "1", amount: "", notes: "" }); },
    onError: (err) => toast.error(err.message),
  });

  const [updateBudgetLine] = useMutation(UPDATE_BUDGET_LINE, {
    onCompleted: () => { toast.success("Budget line updated"); if (selectedBudget) refetchLines?.(); setEditLine(null); },
    onError: (err) => toast.error(err.message),
  });

  const [approveBudget] = useMutation(APPROVE_BUDGET, { onCompleted: () => { toast.success("Budget approved"); refetch(); }, onError: (err) => toast.error(err.message) });
  const [activateBudget] = useMutation(ACTIVATE_BUDGET, { onCompleted: () => { toast.success("Budget activated"); refetch(); }, onError: (err) => toast.error(err.message) });
  const [closeBudget] = useMutation(CLOSE_BUDGET, { onCompleted: () => { toast.success("Budget closed"); refetch(); }, onError: (err) => toast.error(err.message) });

  const budgets: Budget[] = data?.budgets || [];
  const accounts = accountsData?.chartOfAccounts || [];
  const lines: BudgetLine[] = linesData?.budgetLines || [];

  const statusColor = (s: string) => {
    if (s === "DRAFT") return "bg-gray-100 text-gray-600";
    if (s === "APPROVED") return "bg-blue-100 text-blue-700";
    if (s === "ACTIVE") return "bg-green-100 text-green-700";
    if (s === "CLOSED") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-600";
  };

  const selectBudget = (b: Budget) => {
    setSelectedBudget(b);
    setShowReport(false);
    fetchLines({ variables: { budgetId: b.id } });
  };

  const viewReport = (b: Budget) => {
    setSelectedBudget(b);
    setShowReport(true);
    fetchReport({ variables: { budgetId: b.id } });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let reportRows: any[] = [];
  if (reportData?.budgetVsActual) {
    try { reportRows = typeof reportData.budgetVsActual === "string" ? JSON.parse(reportData.budgetVsActual) : reportData.budgetVsActual; } catch { reportRows = []; }
  }

  if (loading) return <div className="p-8"><div className="animate-pulse text-muted-foreground">Loading budgets...</div></div>;
  if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Budget Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage budgets and budget lines</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium">
          <Plus className="w-4 h-4" /> Create Budget
        </button>
      </div>

      {/* Budgets Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border"><h2 className="text-lg font-semibold">Budgets ({budgets.length})</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-border bg-muted/50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Name</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Fiscal Year</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Start</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">End</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
            </tr></thead>
            <tbody>
              {budgets.map((b) => (
                <tr key={b.id} className="border-b border-border hover:bg-muted/30 cursor-pointer" onClick={() => selectBudget(b)}>
                  <td className="px-6 py-3 font-medium">{b.budgetName}</td>
                  <td className="px-6 py-3 text-sm">{b.fiscalYear}</td>
                  <td className="px-6 py-3 text-sm">{formatDate(b.startDate)}</td>
                  <td className="px-6 py-3 text-sm">{formatDate(b.endDate)}</td>
                  <td className="px-6 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor(b.status)}`}>{b.status}</span></td>
                  <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-1">
                      {b.status === "DRAFT" && <button onClick={() => approveBudget({ variables: { id: b.id } })} className="text-xs px-2 py-1 rounded border border-border hover:bg-muted text-blue-600" title="Approve"><CheckCircle className="w-3 h-3" /></button>}
                      {b.status === "APPROVED" && <button onClick={() => activateBudget({ variables: { id: b.id } })} className="text-xs px-2 py-1 rounded border border-border hover:bg-muted text-green-600" title="Activate"><Play className="w-3 h-3" /></button>}
                      {(b.status === "ACTIVE" || b.status === "APPROVED") && <button onClick={() => closeBudget({ variables: { id: b.id } })} className="text-xs px-2 py-1 rounded border border-border hover:bg-muted text-red-600" title="Close"><XCircle className="w-3 h-3" /></button>}
                      <button onClick={() => viewReport(b)} className="text-xs px-2 py-1 rounded border border-border hover:bg-muted text-primary" title="Budget vs Actual"><BarChart3 className="w-3 h-3" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {budgets.length === 0 && <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No budgets found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Budget Lines */}
      {selectedBudget && !showReport && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center">
            <h2 className="text-lg font-semibold">Budget Lines: {selectedBudget.budgetName}</h2>
            <div className="flex gap-2">
              {selectedBudget.status === "DRAFT" && (
                <button onClick={() => setShowAddLine(true)} className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium">
                  <Plus className="w-3 h-3" /> Add Line
                </button>
              )}
              <button onClick={() => setSelectedBudget(null)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>
          </div>
          <table className="w-full">
            <thead><tr className="border-b border-border bg-muted/50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Account</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Month</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Amount</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Notes</th>
              {selectedBudget.status === "DRAFT" && <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>}
            </tr></thead>
            <tbody>
              {lines.map((l) => (
                <tr key={l.id} className="border-b border-border">
                  <td className="px-6 py-3 text-sm">{l.account.accountCode} - {l.account.accountName}</td>
                  <td className="px-6 py-3 text-sm">{MONTHS[l.periodMonth - 1]}</td>
                  <td className="px-6 py-3 text-sm text-right">
                    {editLine?.id === l.id ? (
                      <input type="number" step="0.01" value={editAmount} onChange={(e) => setEditAmount(e.target.value)}
                        className="w-32 px-2 py-1 rounded border border-border bg-background text-sm text-right" />
                    ) : formatCurrency(l.budgetedAmount)}
                  </td>
                  <td className="px-6 py-3 text-sm">
                    {editLine?.id === l.id ? (
                      <input type="text" value={editNotes} onChange={(e) => setEditNotes(e.target.value)}
                        className="w-full px-2 py-1 rounded border border-border bg-background text-sm" />
                    ) : (l.notes || "-")}
                  </td>
                  {selectedBudget.status === "DRAFT" && (
                    <td className="px-6 py-3 text-sm">
                      {editLine?.id === l.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => updateBudgetLine({ variables: { lineId: l.id, amount: editAmount, notes: editNotes || undefined } })}
                            className="text-xs px-2 py-1 rounded bg-primary text-white">Save</button>
                          <button onClick={() => setEditLine(null)} className="text-xs px-2 py-1 rounded border border-border">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditLine(l); setEditAmount(String(l.budgetedAmount)); setEditNotes(l.notes || ""); }}
                          className="text-xs px-2 py-1 rounded border border-border hover:bg-muted">Edit</button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {lines.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No budget lines</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Budget vs Actual Report */}
      {selectedBudget && showReport && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center">
            <h2 className="text-lg font-semibold">Budget vs Actual: {selectedBudget.budgetName}</h2>
            <button onClick={() => { setShowReport(false); setSelectedBudget(null); }} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
          {reportLoading ? <div className="p-6 text-muted-foreground">Loading report...</div> : (
            <table className="w-full">
              <thead><tr className="border-b border-border bg-muted/50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Account</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Month</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Budgeted</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Actual</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Variance</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Variance %</th>
              </tr></thead>
              <tbody>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {reportRows.map((r: any, i: number) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-6 py-3 text-sm">{r.accountName || r.account}</td>
                    <td className="px-6 py-3 text-sm">{r.month ? MONTHS[(r.month as number) - 1] : "-"}</td>
                    <td className="px-6 py-3 text-sm text-right">{formatCurrency(r.budgeted || 0)}</td>
                    <td className="px-6 py-3 text-sm text-right">{formatCurrency(r.actual || 0)}</td>
                    <td className={`px-6 py-3 text-sm text-right font-medium ${(r.variance || 0) < 0 ? "text-red-600" : "text-green-600"}`}>
                      {formatCurrency(r.variance || 0)}
                    </td>
                    <td className={`px-6 py-3 text-sm text-right ${(r.variancePercent || 0) < 0 ? "text-red-600" : "text-green-600"}`}>
                      {(r.variancePercent || 0).toFixed(1)}%
                    </td>
                  </tr>
                ))}
                {reportRows.length === 0 && <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No report data</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Create Budget Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowCreate(false)}>
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Create Budget</h2>
            <div className="space-y-3">
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Budget Name *</label>
                <input type="text" value={form.budgetName} onChange={(e) => setForm({ ...form, budgetName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" placeholder="e.g. Annual Budget 2026" /></div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Fiscal Year *</label>
                <input type="number" value={form.fiscalYear} onChange={(e) => setForm({ ...form, fiscalYear: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /></div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Start Date *</label>
                <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /></div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">End Date *</label>
                <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /></div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" rows={2} /></div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 border border-border rounded-lg text-sm">Cancel</button>
              <button onClick={() => createBudget({ variables: { ...form, fiscalYear: parseInt(form.fiscalYear) } })}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Budget Line Modal */}
      {showAddLine && selectedBudget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowAddLine(false)}>
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Add Budget Line</h2>
            <div className="space-y-3">
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">GL Account *</label>
                <select value={lineForm.accountId} onChange={(e) => setLineForm({ ...lineForm, accountId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
                  <option value="">Select account...</option>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {accounts.map((a: any) => <option key={a.id} value={a.id}>{a.accountCode} - {a.accountName}</option>)}
                </select></div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Month *</label>
                <select value={lineForm.periodMonth} onChange={(e) => setLineForm({ ...lineForm, periodMonth: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
                  {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select></div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Amount *</label>
                <input type="number" step="0.01" value={lineForm.amount} onChange={(e) => setLineForm({ ...lineForm, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /></div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Notes</label>
                <input type="text" value={lineForm.notes} onChange={(e) => setLineForm({ ...lineForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /></div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowAddLine(false)} className="px-4 py-2 border border-border rounded-lg text-sm">Cancel</button>
              <button onClick={() => addBudgetLine({ variables: { budgetId: selectedBudget.id, accountId: lineForm.accountId, periodMonth: parseInt(lineForm.periodMonth), amount: lineForm.amount, notes: lineForm.notes || undefined } })}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium">Add Line</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
