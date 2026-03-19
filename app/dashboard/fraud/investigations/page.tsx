"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_FRAUD_INVESTIGATIONS,
  UPDATE_FRAUD_INVESTIGATION,
  OPEN_FRAUD_INVESTIGATION,
} from "@/lib/graphql/queries";
import { FraudInvestigation } from "@/lib/types";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import { isNullListError } from "@/lib/error-utils";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
} from "lucide-react";

const STATUSES = [
  { value: "", label: "All Statuses" },
  { value: "OPEN", label: "Open" },
  { value: "UNDER_INVESTIGATION", label: "Under Investigation" },
  { value: "ESCALATED", label: "Escalated" },
  { value: "CLOSED_CONFIRMED", label: "Closed (Confirmed)" },
  { value: "CLOSED_FALSE_POSITIVE", label: "Closed (False Positive)" },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "OPEN": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    case "UNDER_INVESTIGATION": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    case "ESCALATED": return "bg-destructive/10 text-destructive border-destructive/20";
    case "CLOSED_CONFIRMED": return "bg-red-500/10 text-red-600 border-red-500/20";
    case "CLOSED_FALSE_POSITIVE": return "bg-success/10 text-success border-success/20";
    default: return "bg-muted text-muted-foreground border-border";
  }
}

export default function FraudInvestigationsPage() {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");
  const size = 20;

  const { data, loading, error, refetch } = useQuery(GET_FRAUD_INVESTIGATIONS, {
    variables: { status: statusFilter || null, page, size },
  });

  const [updateInvestigation, { loading: updating }] = useMutation(UPDATE_FRAUD_INVESTIGATION, {
    onCompleted: () => {
      toast.success("Investigation updated");
      setSelectedId(null);
      setNewStatus("");
      setNotes("");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const investigations: FraudInvestigation[] = data?.fraudInvestigations?.content || [];
  const totalElements = data?.fraudInvestigations?.totalElements || 0;
  const totalPages = data?.fraudInvestigations?.totalPages || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !isNullListError(error)) {
    return <ErrorDisplay message={error.message} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fraud Investigations</h1>
          <p className="text-muted-foreground">{totalElements} investigation(s)</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Alert</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Member</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Assigned To</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Created</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {investigations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    <Search className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    No investigations found
                  </td>
                </tr>
              ) : (
                investigations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm">
                      <div className="font-mono text-xs">
                        {inv.riskAlert.alertType.replace(/_/g, " ")}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 max-w-xs truncate">
                        {inv.riskAlert.message}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {inv.riskAlert.member.firstName} {inv.riskAlert.member.lastName}
                      <div className="text-xs text-muted-foreground">{inv.riskAlert.member.memberNumber}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(inv.status)}`}>
                        {inv.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {inv.assignedTo ? (inv.assignedTo.fullName || inv.assignedTo.username) : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(inv.createdAt)}</td>
                    <td className="px-4 py-3 text-center">
                      {!inv.status.startsWith("CLOSED") && (
                        <button
                          onClick={() => setSelectedId(inv.id)}
                          className="px-2.5 py-1 text-xs rounded-lg bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                        >
                          Update
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
            <span className="text-sm text-muted-foreground">
              Page {page + 1} of {totalPages} ({totalElements} total)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="p-1 rounded hover:bg-muted disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="p-1 rounded hover:bg-muted disabled:opacity-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Update Status Modal */}
      {selectedId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedId(null)}>
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Update Investigation Status</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-muted-foreground mb-1">New Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">Select status...</option>
                <option value="UNDER_INVESTIGATION">Under Investigation</option>
                <option value="ESCALATED">Escalated</option>
                <option value="CLOSED_CONFIRMED">Close - Fraud Confirmed</option>
                <option value="CLOSED_FALSE_POSITIVE">Close - False Positive</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-muted-foreground mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Investigation notes..."
                rows={3}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setSelectedId(null)}
                className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newStatus) { toast.error("Select a status"); return; }
                  updateInvestigation({
                    variables: { investigationId: selectedId, status: newStatus, notes: notes || null },
                  });
                }}
                disabled={updating || !newStatus}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50"
              >
                {updating && <Loader2 className="inline h-4 w-4 mr-1 animate-spin" />}
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
