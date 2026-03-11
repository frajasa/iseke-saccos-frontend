"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_TRANSACTION_LIMITS, SET_TRANSACTION_LIMIT, DELETE_TRANSACTION_LIMIT } from "@/lib/graphql/queries";
import { TransactionLimit } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

const ROLES = ["CASHIER", "LOAN_OFFICER", "ACCOUNTANT", "MANAGER"];
const TXN_TYPES = ["DEPOSIT", "WITHDRAWAL", "TRANSFER", "LOAN_DISBURSEMENT", "LOAN_REPAYMENT"];

export default function TransactionLimitsPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ role: "", transactionType: "", dailyLimit: "", singleTransactionLimit: "", monthlyLimit: "", requiresApprovalAbove: "" });

  const { data, loading, refetch } = useQuery(GET_TRANSACTION_LIMITS);
  const [setLimit] = useMutation(SET_TRANSACTION_LIMIT, {
    onCompleted: () => { toast.success("Limit saved"); refetch(); setShowForm(false); resetForm(); },
    onError: (err) => toast.error(err.message),
  });
  const [deleteLimit] = useMutation(DELETE_TRANSACTION_LIMIT, {
    onCompleted: () => { toast.success("Limit removed"); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const resetForm = () => setForm({ role: "", transactionType: "", dailyLimit: "", singleTransactionLimit: "", monthlyLimit: "", requiresApprovalAbove: "" });

  const limits: TransactionLimit[] = data?.transactionLimits || [];

  const editLimit = (l: TransactionLimit) => {
    setForm({
      role: l.role,
      transactionType: l.transactionType,
      dailyLimit: l.dailyLimit?.toString() || "",
      singleTransactionLimit: l.singleTransactionLimit?.toString() || "",
      monthlyLimit: l.monthlyLimit?.toString() || "",
      requiresApprovalAbove: l.requiresApprovalAbove?.toString() || "",
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.role || !form.transactionType) { toast.error("Role and transaction type are required"); return; }
    setLimit({
      variables: {
        role: form.role,
        transactionType: form.transactionType,
        dailyLimit: form.dailyLimit || null,
        singleTransactionLimit: form.singleTransactionLimit || null,
        monthlyLimit: form.monthlyLimit || null,
        requiresApprovalAbove: form.requiresApprovalAbove || null,
      },
    });
  };

  if (loading) return <div className="p-8"><div className="animate-pulse text-muted-foreground">Loading limits...</div></div>;

  // Group by role
  const grouped = ROLES.map((role) => ({
    role,
    limits: limits.filter((l) => l.role === role),
  })).filter((g) => g.limits.length > 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transaction Limits</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure transaction limits per user role</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Limit
        </button>
      </div>

      {grouped.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground">No transaction limits configured</div>
      ) : (
        grouped.map((group) => (
          <div key={group.role} className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-3 border-b border-border bg-muted/50">
              <h3 className="font-semibold text-sm">{group.role.replace(/_/g, " ")}</h3>
            </div>
            <table className="w-full">
              <thead><tr className="border-b border-border">
                <th className="text-left px-6 py-2.5 text-xs font-semibold text-muted-foreground uppercase">Transaction Type</th>
                <th className="text-right px-6 py-2.5 text-xs font-semibold text-muted-foreground uppercase">Single Txn Limit</th>
                <th className="text-right px-6 py-2.5 text-xs font-semibold text-muted-foreground uppercase">Daily Limit</th>
                <th className="text-right px-6 py-2.5 text-xs font-semibold text-muted-foreground uppercase">Monthly Limit</th>
                <th className="text-right px-6 py-2.5 text-xs font-semibold text-muted-foreground uppercase">Approval Above</th>
                <th className="text-right px-6 py-2.5 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
              </tr></thead>
              <tbody>
                {group.limits.map((l) => (
                  <tr key={l.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-6 py-3 font-medium">{l.transactionType.replace(/_/g, " ")}</td>
                    <td className="px-6 py-3 text-right font-mono text-sm">{l.singleTransactionLimit ? formatCurrency(l.singleTransactionLimit) : "-"}</td>
                    <td className="px-6 py-3 text-right font-mono text-sm">{l.dailyLimit ? formatCurrency(l.dailyLimit) : "-"}</td>
                    <td className="px-6 py-3 text-right font-mono text-sm">{l.monthlyLimit ? formatCurrency(l.monthlyLimit) : "-"}</td>
                    <td className="px-6 py-3 text-right font-mono text-sm">{l.requiresApprovalAbove ? formatCurrency(l.requiresApprovalAbove) : "-"}</td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => editLimit(l)} className="text-xs px-2 py-1 rounded border border-border hover:bg-muted">Edit</button>
                        <button onClick={() => { if (confirm("Remove this limit?")) deleteLimit({ variables: { id: l.id } }); }}
                          className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">{form.role && form.transactionType ? "Edit" : "Add"} Transaction Limit</h2>
            <div className="space-y-3">
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
                  <option value="">Select role...</option>
                  {ROLES.map((r) => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
                </select></div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Transaction Type</label>
                <select value={form.transactionType} onChange={(e) => setForm({ ...form, transactionType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
                  <option value="">Select type...</option>
                  {TXN_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                </select></div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Single Transaction Limit (TZS)</label>
                <input type="number" value={form.singleTransactionLimit} onChange={(e) => setForm({ ...form, singleTransactionLimit: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" placeholder="e.g. 10000000" /></div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Daily Limit (TZS)</label>
                <input type="number" value={form.dailyLimit} onChange={(e) => setForm({ ...form, dailyLimit: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" placeholder="e.g. 50000000" /></div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Monthly Limit (TZS)</label>
                <input type="number" value={form.monthlyLimit} onChange={(e) => setForm({ ...form, monthlyLimit: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" placeholder="e.g. 500000000" /></div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Requires Approval Above (TZS)</label>
                <input type="number" value={form.requiresApprovalAbove} onChange={(e) => setForm({ ...form, requiresApprovalAbove: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" placeholder="e.g. 5000000" /></div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-border rounded-lg text-sm">Cancel</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
