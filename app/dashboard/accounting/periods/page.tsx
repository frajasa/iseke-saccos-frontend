"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_ACCOUNTING_PERIODS, CREATE_ACCOUNTING_PERIOD, CLOSE_ACCOUNTING_PERIOD, REOPEN_ACCOUNTING_PERIOD } from "@/lib/graphql/queries";
import { ArrowLeft, Lock, Unlock, Plus, Calendar } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import { isNullListError } from "@/lib/error-utils";
import { toast } from "sonner";

export default function AccountingPeriodsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [periodName, setPeriodName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data, loading, error } = useQuery(GET_ACCOUNTING_PERIODS);
  const [createPeriod, { loading: creating }] = useMutation(CREATE_ACCOUNTING_PERIOD, { refetchQueries: [{ query: GET_ACCOUNTING_PERIODS }] });
  const [closePeriod] = useMutation(CLOSE_ACCOUNTING_PERIOD, { refetchQueries: [{ query: GET_ACCOUNTING_PERIODS }] });
  const [reopenPeriod] = useMutation(REOPEN_ACCOUNTING_PERIOD, { refetchQueries: [{ query: GET_ACCOUNTING_PERIODS }] });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPeriod({ variables: { periodName, startDate, endDate } });
      toast.success("Accounting period created");
      setShowCreateModal(false);
      setPeriodName("");
      setStartDate("");
      setEndDate("");
    } catch (err: any) {
      toast.error(err.message || "Failed to create period");
    }
  };

  const handleClose = async (id: string, name: string) => {
    if (!confirm(`Close accounting period "${name}"? No transactions can be posted to this period after closing.`)) return;
    try {
      await closePeriod({ variables: { id } });
      toast.success("Period closed");
    } catch (err: any) {
      toast.error(err.message || "Failed to close period");
    }
  };

  const handleReopen = async (id: string, name: string) => {
    if (!confirm(`Reopen accounting period "${name}"?`)) return;
    try {
      await reopenPeriod({ variables: { id } });
      toast.success("Period reopened");
    } catch (err: any) {
      toast.error(err.message || "Failed to reopen period");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-[3px] border-muted border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !isNullListError(error)) return <ErrorDisplay error={error} />;

  const periods = data?.accountingPeriods || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/accounting" className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div className="p-3 bg-gray-500/10 rounded-lg">
            <Calendar className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Accounting Periods</h1>
            <p className="text-muted-foreground">Manage fiscal periods and period locking</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-semibold transition-all"
        >
          <Plus className="w-4 h-4" />
          New Period
        </button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Period</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">End Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Closed By</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {periods.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No accounting periods defined. Create one to start managing period locking.</td></tr>
            )}
            {periods.map((p: any) => (
              <tr key={p.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 font-medium text-foreground">{p.periodName}</td>
                <td className="px-6 py-4 text-sm text-foreground">{formatDate(p.startDate)}</td>
                <td className="px-6 py-4 text-sm text-foreground">{formatDate(p.endDate)}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    p.isClosed
                      ? "bg-red-500/10 text-red-600 border border-red-500/20"
                      : "bg-green-500/10 text-green-600 border border-green-500/20"
                  }`}>
                    {p.isClosed ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                    {p.isClosed ? "Closed" : "Open"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{p.closedBy || "-"}</td>
                <td className="px-6 py-4 text-right">
                  {p.isClosed ? (
                    <button onClick={() => handleReopen(p.id, p.periodName)} className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                      Reopen
                    </button>
                  ) : (
                    <button onClick={() => handleClose(p.id, p.periodName)} className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors">
                      Close Period
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Create Accounting Period
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Period Name *</label>
                <input
                  type="text"
                  value={periodName}
                  onChange={(e) => setPeriodName(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary"
                  placeholder="e.g., January 2026"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Start Date *</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">End Date *</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary" required />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2.5 border border-border rounded-lg hover:bg-muted transition-all font-medium">Cancel</button>
                <button type="submit" disabled={creating} className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-semibold disabled:opacity-50">
                  {creating ? "Creating..." : "Create Period"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
