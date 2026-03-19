"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_OVERDUE_LOANS,
  GET_LOAN_ESCALATION_SUMMARY,
  SEND_MANUAL_REMINDER,
  RUN_OVERDUE_REMINDERS,
} from "@/lib/graphql/queries";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { AlertTriangle, Bell, ShieldAlert, UserX, Clock, Send, Play, Phone } from "lucide-react";

export default function OverdueLoansPage() {
  const [page, setPage] = useState(0);
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null);
  const [reminderMessage, setReminderMessage] = useState("");
  const [showReminderModal, setShowReminderModal] = useState(false);

  const { data: summaryData, refetch: refetchSummary } = useQuery(GET_LOAN_ESCALATION_SUMMARY);
  const { data, loading, error, refetch } = useQuery(GET_OVERDUE_LOANS, {
    variables: { page, size: 20 },
  });

  const [sendReminder, { loading: sendingReminder }] = useMutation(SEND_MANUAL_REMINDER, {
    onCompleted: () => {
      setShowReminderModal(false);
      setReminderMessage("");
      refetch();
      refetchSummary();
    },
  });

  const [runReminders, { loading: runningReminders }] = useMutation(RUN_OVERDUE_REMINDERS, {
    onCompleted: () => {
      refetch();
      refetchSummary();
    },
  });

  const summary = summaryData?.loanEscalationSummary;
  const loans = data?.overdueLoans?.content || [];
  const totalPages = data?.overdueLoans?.totalPages || 0;
  const totalElements = data?.overdueLoans?.totalElements || 0;

  const getArrearsColor = (days: number) => {
    if (days >= 90) return "bg-red-600/10 text-red-700 border-red-600/20";
    if (days >= 31) return "bg-orange-500/10 text-orange-600 border-orange-500/20";
    if (days >= 8) return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    return "bg-yellow-400/10 text-yellow-600 border-yellow-400/20";
  };

  const getEscalationLabel = (days: number) => {
    if (days >= 90) return "DEFAULTED";
    if (days >= 61) return "Pre-Default";
    if (days >= 31) return "Level 3";
    if (days >= 8) return "Level 2";
    return "Level 1";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Overdue Loans Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor overdue loans, escalation status, and reminder history
          </p>
        </div>
        <button
          onClick={() => runReminders()}
          disabled={runningReminders}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          <Play className="w-4 h-4" />
          {runningReminders ? "Running..." : "Run Reminders Now"}
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Overdue</p>
                <p className="text-2xl font-bold text-foreground">{summary.totalOverdue}</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Bell className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reminders Today</p>
                <p className="text-2xl font-bold text-foreground">{summary.remindersToday}</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <ShieldAlert className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Guarantor Notices</p>
                <p className="text-2xl font-bold text-foreground">{summary.guarantorNoticesToday}</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-600/10 rounded-lg">
                <UserX className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Defaulted (Month)</p>
                <p className="text-2xl font-bold text-foreground">{summary.defaultedThisMonth}</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Upcoming (7 days)</p>
                <p className="text-2xl font-bold text-foreground">{summary.upcomingPayments}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overdue Loans Table */}
      <div className="bg-card border border-border rounded-xl">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Overdue Loans ({totalElements})
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading overdue loans...</div>
        ) : error ? (
          <div className="p-8 text-center text-destructive">Error loading data</div>
        ) : loans.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No overdue loans found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Loan #</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Member</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Product</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Outstanding</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Days Overdue</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Escalation</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((loan: Record<string, unknown>) => {
                    const days = (loan.daysInArrears as number) || 0;
                    const outstanding =
                      ((loan.outstandingPrincipal as number) || 0) +
                      ((loan.outstandingInterest as number) || 0) +
                      ((loan.outstandingPenalties as number) || 0) +
                      ((loan.outstandingFees as number) || 0);
                    const member = loan.member as Record<string, string> | undefined;
                    const product = loan.product as Record<string, string> | undefined;

                    return (
                      <tr key={loan.id as string} className="border-b border-border hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <a href={`/loans/accounts/${loan.id}`} className="text-primary hover:underline font-medium text-sm">
                            {loan.loanNumber as string}
                          </a>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-foreground">
                            {member?.firstName} {member?.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">{member?.memberNumber}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {product?.productName}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                          {formatCurrency(outstanding)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getArrearsColor(days)}`}>
                            {days} days
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-xs font-medium text-muted-foreground">
                            {getEscalationLabel(days)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(loan.status as string)}`}>
                            {loan.status as string}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => {
                              setSelectedLoan(loan.id as string);
                              setShowReminderModal(true);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20"
                            title="Send manual reminder"
                          >
                            <Send className="w-3 h-3" />
                            Remind
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Page {page + 1} of {totalPages} ({totalElements} total)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1}
                    className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Send Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Send Payment Reminder
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Custom Message (optional)
                </label>
                <textarea
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  placeholder="Leave blank for default reminder message..."
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm resize-none"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowReminderModal(false);
                    setReminderMessage("");
                  }}
                  className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (selectedLoan) {
                      sendReminder({
                        variables: {
                          loanId: selectedLoan,
                          message: reminderMessage || null,
                        },
                      });
                    }
                  }}
                  disabled={sendingReminder}
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {sendingReminder ? "Sending..." : "Send Reminder"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
