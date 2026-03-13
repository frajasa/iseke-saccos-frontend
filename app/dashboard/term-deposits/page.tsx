"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_TERM_DEPOSIT_MATURITY_REPORT,
  PROCESS_TERM_DEPOSIT_MATURITY,
  PREMATURE_WITHDRAW_TERM_DEPOSIT,
  ROLLOVER_TERM_DEPOSIT,
} from "@/lib/graphql/queries";
import { formatCurrency } from "@/lib/utils";
import { isNullListError } from "@/lib/error-utils";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import { toast } from "sonner";
import { Search, Play, X, RotateCcw, BanknoteIcon, CalendarDays } from "lucide-react";

export default function TermDepositsPage() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchTriggered, setSearchTriggered] = useState(false);

  const [withdrawModal, setWithdrawModal] = useState<{ id: string; accountNumber: string } | null>(null);
  const [withdrawReason, setWithdrawReason] = useState("");
  const [rolloverModal, setRolloverModal] = useState<{ id: string; accountNumber: string } | null>(null);
  const [rolloverRate, setRolloverRate] = useState("");

  const { data, loading, error, refetch } = useQuery(GET_TERM_DEPOSIT_MATURITY_REPORT, {
    variables: { fromDate, toDate },
    skip: !searchTriggered || !fromDate || !toDate,
    fetchPolicy: "network-only",
  });

  const [processMaturity, { loading: processing }] = useMutation(PROCESS_TERM_DEPOSIT_MATURITY, {
    onCompleted: (data) => {
      const count = data?.processTermDepositMaturity ?? 0;
      toast.success(`Processed ${count} matured term deposit(s)`);
      if (searchTriggered) refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const [prematureWithdraw, { loading: withdrawing }] = useMutation(PREMATURE_WITHDRAW_TERM_DEPOSIT, {
    onCompleted: () => {
      toast.success("Premature withdrawal processed");
      setWithdrawModal(null);
      setWithdrawReason("");
      if (searchTriggered) refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const [rollover, { loading: rollingOver }] = useMutation(ROLLOVER_TERM_DEPOSIT, {
    onCompleted: () => {
      toast.success("Term deposit rolled over");
      setRolloverModal(null);
      setRolloverRate("");
      if (searchTriggered) refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSearch = () => {
    if (!fromDate || !toDate) {
      toast.error("Please select both from and to dates");
      return;
    }
    setSearchTriggered(true);
  };

  const hasNullListError = error && isNullListError(error);
  const reports = data?.termDepositMaturityReport || [];
  const showError = error && !hasNullListError;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Term Deposits</h1>
        <p className="text-sm text-muted-foreground mt-1">Maturity reports, rollovers, and premature withdrawals</p>
      </div>

      {/* Operations */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold mb-4">Operations</h2>
        <button
          onClick={() => processMaturity()}
          disabled={processing}
          className="flex items-center gap-2 px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 text-sm font-medium disabled:opacity-50"
        >
          <Play className="w-4 h-4" />
          {processing ? "Processing..." : "Process Maturity"}
        </button>
        <p className="text-xs text-muted-foreground mt-2">
          Automatically processes all term deposits that have reached their maturity date.
        </p>
      </div>

      {/* Maturity Report */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" /> Maturity Report
          </h2>
          <div className="flex flex-wrap gap-4 items-end mt-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setSearchTriggered(false); }}
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setSearchTriggered(false); }}
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        {showError && (
          <div className="p-6">
            <ErrorDisplay error={error} />
          </div>
        )}

        {searchTriggered && !loading && !showError && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Account #</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Member</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Product</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Deposit Amt</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Maturity Amt</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Maturity Date</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Action</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Matured</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Rollovers</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Eff. Rate</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-6 py-8 text-center text-muted-foreground">
                      No term deposits found for the selected date range.
                    </td>
                  </tr>
                ) : (
                  reports.map((r: any) => (
                    <tr key={r.accountNumber} className="border-b border-border hover:bg-muted/30">
                      <td className="px-6 py-3 font-mono text-sm">{r.accountNumber}</td>
                      <td className="px-6 py-3 text-sm">{r.memberName}</td>
                      <td className="px-6 py-3 text-sm">{r.product}</td>
                      <td className="px-6 py-3 text-sm text-right">{formatCurrency(r.termDepositAmount)}</td>
                      <td className="px-6 py-3 text-sm text-right font-semibold">{formatCurrency(r.maturityAmount)}</td>
                      <td className="px-6 py-3 text-sm">{r.maturityDate}</td>
                      <td className="px-6 py-3 text-sm">
                        <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">
                          {r.maturityAction}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${r.matured ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {r.matured ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-center">{r.rolloverCount ?? 0}</td>
                      <td className="px-6 py-3 text-sm text-right">{r.effectiveInterestRate != null ? `${r.effectiveInterestRate}%` : "-"}</td>
                      <td className="px-6 py-3 text-sm">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          r.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                          r.status === "MATURED" ? "bg-blue-100 text-blue-700" :
                          r.status === "CLOSED" ? "bg-gray-100 text-gray-600" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setWithdrawModal({ id: r.id || r.accountNumber, accountNumber: r.accountNumber })}
                            className="text-xs px-2 py-1 rounded border border-border hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                          >
                            <BanknoteIcon className="w-3 h-3 inline mr-1" />Withdraw
                          </button>
                          <button
                            onClick={() => setRolloverModal({ id: r.id || r.accountNumber, accountNumber: r.accountNumber })}
                            className="text-xs px-2 py-1 rounded border border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                          >
                            <RotateCcw className="w-3 h-3 inline mr-1" />Rollover
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {loading && (
          <div className="px-6 py-8 text-center">
            <div className="animate-pulse text-muted-foreground">Loading maturity report...</div>
          </div>
        )}
      </div>

      {/* Premature Withdraw Modal */}
      {withdrawModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setWithdrawModal(null)}>
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Premature Withdrawal</h2>
              <button onClick={() => setWithdrawModal(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Account: <span className="font-mono font-semibold text-foreground">{withdrawModal.accountNumber}</span>
            </p>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Reason for early withdrawal</label>
              <textarea
                value={withdrawReason}
                onChange={(e) => setWithdrawReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none"
                placeholder="Enter reason for premature withdrawal..."
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => { setWithdrawModal(null); setWithdrawReason(""); }} className="px-4 py-2 border border-border rounded-lg text-sm">
                Cancel
              </button>
              <button
                onClick={() => prematureWithdraw({ variables: { id: withdrawModal.id, reason: withdrawReason } })}
                disabled={withdrawing || !withdrawReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {withdrawing ? "Processing..." : "Confirm Withdrawal"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rollover Modal */}
      {rolloverModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setRolloverModal(null)}>
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Rollover Term Deposit</h2>
              <button onClick={() => setRolloverModal(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Account: <span className="font-mono font-semibold text-foreground">{rolloverModal.accountNumber}</span>
            </p>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">New Interest Rate (optional)</label>
              <input
                type="number"
                step="0.01"
                value={rolloverRate}
                onChange={(e) => setRolloverRate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                placeholder="Leave blank to keep current rate"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => { setRolloverModal(null); setRolloverRate(""); }} className="px-4 py-2 border border-border rounded-lg text-sm">
                Cancel
              </button>
              <button
                onClick={() => rollover({ variables: { id: rolloverModal.id, newRate: rolloverRate ? parseFloat(rolloverRate) : null } })}
                disabled={rollingOver}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {rollingOver ? "Processing..." : "Confirm Rollover"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
