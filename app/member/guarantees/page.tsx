"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { useSession } from "next-auth/react";
import {
  GET_MY_GUARANTEE_REQUESTS,
  ACCEPT_GUARANTEE,
  DECLINE_GUARANTEE,
} from "@/lib/graphql/queries";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ShieldCheck, ShieldX, ShieldAlert, X, CheckCircle2, XCircle } from "lucide-react";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import EmptyState from "@/components/ui/EmptyState";
import { toast } from "sonner";

// NOTE: The current backend does not have a dedicated query for fetching guarantee requests
// where the logged-in member is the guarantor. essLoanAccounts returns the member's OWN loans.
// A dedicated backend query (e.g., essGuaranteeRequests or myGuaranteeRequests) is needed
// to properly fetch loans where this member appears as a guarantor.
// For now, this page extracts guarantor entries from essLoanAccounts and filters by the
// current member's ID. This will only show guarantees on the member's own loans (limited).
// TODO: Add a backend query like `essGuaranteeRequests: [Guarantor!]!` that returns all
// guarantor records where guarantorMember.id matches the logged-in member.

interface GuaranteeRequest {
  id: string;
  borrowerName: string;
  borrowerMemberNumber: string;
  loanNumber: string;
  loanAmount: number;
  guaranteeAmount: number;
  loanPurpose: string;
  requestDate: string;
  status: string;
  consentDate?: string;
  consentNotes?: string;
}

export default function MemberGuaranteesPage() {
  const { data: session } = useSession();
  const user = session?.user as any;

  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedGuarantee, setSelectedGuarantee] = useState<GuaranteeRequest | null>(null);
  const [acceptNotes, setAcceptNotes] = useState("");
  const [declineReason, setDeclineReason] = useState("");

  const { data, loading, error, refetch } = useQuery(GET_MY_GUARANTEE_REQUESTS);

  const [acceptGuarantee, { loading: accepting }] = useMutation(ACCEPT_GUARANTEE, {
    onCompleted: () => {
      toast.success("Guarantee accepted successfully");
      setShowAcceptModal(false);
      setAcceptNotes("");
      setSelectedGuarantee(null);
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to accept guarantee");
    },
  });

  const [declineGuarantee, { loading: declining }] = useMutation(DECLINE_GUARANTEE, {
    onCompleted: () => {
      toast.success("Guarantee declined");
      setShowDeclineModal(false);
      setDeclineReason("");
      setSelectedGuarantee(null);
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to decline guarantee");
    },
  });

  // Extract guarantee requests from loan accounts where this member is a guarantor
  const guaranteeRequests: GuaranteeRequest[] = [];
  if (data?.essLoanAccounts) {
    for (const loan of data.essLoanAccounts) {
      if (loan.guarantors) {
        for (const g of loan.guarantors) {
          // Include all guarantors from the member's own loans for now
          // When a dedicated backend endpoint is available, this filtering won't be needed
          guaranteeRequests.push({
            id: g.id,
            borrowerName: loan.member
              ? `${loan.member.firstName} ${loan.member.lastName}`
              : "Unknown",
            borrowerMemberNumber: loan.member?.memberNumber || "",
            loanNumber: loan.loanNumber,
            loanAmount: parseFloat(loan.principalAmount) || 0,
            guaranteeAmount: parseFloat(g.guaranteedAmount) || 0,
            loanPurpose: loan.purpose || "Not specified",
            requestDate: g.createdAt || "",
            status: g.status,
            consentDate: g.consentDate,
            consentNotes: g.consentNotes,
          });
        }
      }
    }
  }

  const pendingCount = guaranteeRequests.filter((g) => g.status === "PENDING_CONSENT").length;
  const acceptedCount = guaranteeRequests.filter((g) => g.status === "ACTIVE").length;
  const declinedCount = guaranteeRequests.filter((g) => g.status === "DECLINED").length;

  const handleAcceptClick = (guarantee: GuaranteeRequest) => {
    setSelectedGuarantee(guarantee);
    setAcceptNotes("");
    setShowAcceptModal(true);
  };

  const handleDeclineClick = (guarantee: GuaranteeRequest) => {
    setSelectedGuarantee(guarantee);
    setDeclineReason("");
    setShowDeclineModal(true);
  };

  const handleAcceptSubmit = () => {
    if (!selectedGuarantee) return;
    acceptGuarantee({
      variables: {
        guarantorId: selectedGuarantee.id,
        notes: acceptNotes || null,
      },
    });
  };

  const handleDeclineSubmit = () => {
    if (!selectedGuarantee) return;
    declineGuarantee({
      variables: {
        guarantorId: selectedGuarantee.id,
        reason: declineReason || null,
      },
    });
  };

  const getBorderColor = (status: string) => {
    switch (status) {
      case "PENDING_CONSENT":
        return "border-l-amber-500";
      case "ACTIVE":
        return "border-l-emerald-500";
      case "DECLINED":
        return "border-l-red-500";
      case "RELEASED":
        return "border-l-gray-400";
      default:
        return "border-l-gray-300";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_CONSENT":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "ACTIVE":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "DECLINED":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "RELEASED":
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING_CONSENT":
        return "Pending";
      case "ACTIVE":
        return "Accepted";
      case "DECLINED":
        return "Declined";
      case "RELEASED":
        return "Released";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-[3px] border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay error={error} variant="full-page" onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">My Guarantee Requests</h1>
        <p className="text-muted-foreground mt-1">
          Review and respond to loan guarantee requests from other members
        </p>
      </div>

      {/* Summary Cards */}
      {guaranteeRequests.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">{acceptedCount}</p>
            <p className="text-xs text-muted-foreground">Accepted</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-2">
              <ShieldX className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">{declinedCount}</p>
            <p className="text-xs text-muted-foreground">Declined</p>
          </div>
        </div>
      )}

      {/* Guarantee Cards */}
      {guaranteeRequests.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No Guarantee Requests"
          description="You don't have any loan guarantee requests at the moment."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {guaranteeRequests.map((guarantee) => (
            <div
              key={guarantee.id}
              className={`bg-card border-l-4 ${getBorderColor(guarantee.status)} rounded-xl p-5 shadow-sm`}
            >
              <div className="flex flex-col gap-3">
                {/* Borrower Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary">
                        {guarantee.borrowerName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{guarantee.borrowerName}</p>
                      <p className="text-xs text-muted-foreground">{guarantee.borrowerMemberNumber}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusBadge(guarantee.status)}`}
                  >
                    {getStatusLabel(guarantee.status)}
                  </span>
                </div>

                {/* Loan Details */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Loan Amount</p>
                    <p className="font-semibold text-foreground tabular-nums">
                      {formatCurrency(guarantee.loanAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Guarantee Amount</p>
                    <p className="font-bold text-primary tabular-nums">
                      {formatCurrency(guarantee.guaranteeAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Loan Number</p>
                    <p className="font-medium text-foreground">{guarantee.loanNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Purpose</p>
                    <p className="font-medium text-foreground">{guarantee.loanPurpose}</p>
                  </div>
                </div>

                {/* Date Info */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {guarantee.requestDate && (
                    <span>Requested: {formatDate(guarantee.requestDate)}</span>
                  )}
                  {guarantee.consentDate && (
                    <span>Responded: {formatDate(guarantee.consentDate)}</span>
                  )}
                </div>

                {/* Consent Notes */}
                {guarantee.consentNotes && (
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm text-foreground">{guarantee.consentNotes}</p>
                  </div>
                )}

                {/* Action Buttons - only for PENDING_CONSENT */}
                {guarantee.status === "PENDING_CONSENT" && (
                  <div className="flex gap-3 mt-1">
                    <button
                      onClick={() => handleAcceptClick(guarantee)}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleDeclineClick(guarantee)}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Decline
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Accept Modal */}
      {showAcceptModal && selectedGuarantee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowAcceptModal(false)} />
          <div className="relative bg-card rounded-xl border border-border shadow-xl w-full max-w-md mx-4 p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Accept Guarantee</h2>
              <button
                onClick={() => setShowAcceptModal(false)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <p className="text-sm text-emerald-700 dark:text-emerald-400">
                  You are agreeing to guarantee{" "}
                  <span className="font-bold">{formatCurrency(selectedGuarantee.guaranteeAmount)}</span>{" "}
                  for <span className="font-bold">{selectedGuarantee.borrowerName}</span>&apos;s loan of{" "}
                  <span className="font-bold">{formatCurrency(selectedGuarantee.loanAmount)}</span>.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Notes (optional)
                </label>
                <textarea
                  value={acceptNotes}
                  onChange={(e) => setAcceptNotes(e.target.value)}
                  placeholder="Add any notes about your consent..."
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAcceptModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAcceptSubmit}
                  disabled={accepting}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                >
                  {accepting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Confirm Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Decline Modal */}
      {showDeclineModal && selectedGuarantee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowDeclineModal(false)} />
          <div className="relative bg-card rounded-xl border border-border shadow-xl w-full max-w-md mx-4 p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Decline Guarantee</h2>
              <button
                onClick={() => setShowDeclineModal(false)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-400">
                  You are declining the guarantee request of{" "}
                  <span className="font-bold">{formatCurrency(selectedGuarantee.guaranteeAmount)}</span>{" "}
                  for <span className="font-bold">{selectedGuarantee.borrowerName}</span>&apos;s loan.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Reason (optional)
                </label>
                <textarea
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="Provide a reason for declining..."
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeclineModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeclineSubmit}
                  disabled={declining}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                >
                  {declining ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  Confirm Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
