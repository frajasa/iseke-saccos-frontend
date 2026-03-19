"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useSession } from "next-auth/react";
import {
  GET_PENDING_REVIEW_LOANS,
  LOAN_OFFICER_APPROVAL,
  MANAGER_APPROVAL,
  GET_LOAN_APPROVAL_HISTORY,
} from "@/lib/graphql/queries";
import { LoanAccount, LoanApprovalHistory } from "@/lib/types";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import { isNullListError } from "@/lib/error-utils";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Shield,
  Eye,
} from "lucide-react";

export default function LoanApprovalsPage() {
  const { data: session } = useSession();
  const [page, setPage] = useState(0);
  const size = 20;
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null);
  const [comments, setComments] = useState("");
  const [approvedAmount, setApprovedAmount] = useState("");
  const [showModal, setShowModal] = useState<"approve" | "reject" | null>(null);

  const userRole = (session?.user as Record<string, string>)?.role;
  const isManager = userRole === "ADMIN" || userRole === "MANAGER";

  const { data, loading, error, refetch } = useQuery(GET_PENDING_REVIEW_LOANS, {
    variables: { page, size },
  });

  const { data: historyData } = useQuery(GET_LOAN_APPROVAL_HISTORY, {
    variables: { loanId: selectedLoan },
    skip: !selectedLoan,
  });

  const [officerApproval, { loading: officerLoading }] = useMutation(LOAN_OFFICER_APPROVAL, {
    onCompleted: () => {
      toast.success("Loan decision recorded");
      closeModal();
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const [managerApprovalMut, { loading: managerLoading }] = useMutation(MANAGER_APPROVAL, {
    onCompleted: () => {
      toast.success("Manager decision recorded");
      closeModal();
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const loans: LoanAccount[] = data?.pendingReviewLoans?.content || [];
  const totalElements = data?.pendingReviewLoans?.totalElements || 0;
  const totalPages = data?.pendingReviewLoans?.totalPages || 0;
  const history: LoanApprovalHistory[] = historyData?.loanApprovalHistory || [];

  function closeModal() {
    setShowModal(null);
    setComments("");
    setApprovedAmount("");
  }

  function handleApproval(approved: boolean) {
    if (!selectedLoan) return;
    const vars = {
      loanId: selectedLoan,
      approved,
      approvedAmount: approvedAmount ? parseFloat(approvedAmount) : null,
      comments: comments || null,
    };
    if (isManager) {
      managerApprovalMut({ variables: vars });
    } else {
      officerApproval({ variables: vars });
    }
  }

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
          <h1 className="text-2xl font-bold text-foreground">Loan Approvals</h1>
          <p className="text-muted-foreground">
            {totalElements} loan(s) pending review
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor("PENDING_REVIEW")}`}>
            <Clock className="inline h-4 w-4 mr-1" />
            Pending Review
          </span>
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Loan #</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Member</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Product</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Term</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Applied</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <Shield className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    No loans pending review
                  </td>
                </tr>
              ) : (
                loans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-mono">{loan.loanNumber}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium">
                        {loan.member.firstName} {loan.member.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">{loan.member.memberNumber}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">{loan.product.productName}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      {formatCurrency(loan.principalAmount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">{loan.termMonths}mo</td>
                    <td className="px-4 py-3 text-sm">{formatDate(loan.applicationDate)}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedLoan(loan.id)}
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => { setSelectedLoan(loan.id); setShowModal("approve"); }}
                          className="p-1.5 rounded hover:bg-success/10 text-success"
                          title="Approve"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => { setSelectedLoan(loan.id); setShowModal("reject"); }}
                          className="p-1.5 rounded hover:bg-destructive/10 text-destructive"
                          title="Reject"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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

      {/* Approval History Panel */}
      {selectedLoan && history.length > 0 && !showModal && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Approval History</h3>
          <div className="space-y-3">
            {history.map((h) => (
              <div key={h.id} className="flex items-start gap-3 text-sm">
                <div className={`mt-0.5 w-2 h-2 rounded-full ${
                  h.action === "AUTO_APPROVED" || h.action === "APPROVED"
                    ? "bg-success"
                    : h.action === "REJECTED"
                    ? "bg-destructive"
                    : "bg-amber-500"
                }`} />
                <div>
                  <span className="font-medium">{h.action.replace(/_/g, " ")}</span>
                  {h.approvedBy && (
                    <span className="text-muted-foreground"> by {h.approvedBy.fullName || h.approvedBy.username}</span>
                  )}
                  {h.riskLevel && (
                    <span className="text-xs ml-2 px-1.5 py-0.5 bg-muted rounded">Risk: {h.riskLevel}</span>
                  )}
                  {h.creditScore != null && (
                    <span className="text-xs ml-1 px-1.5 py-0.5 bg-muted rounded">Score: {h.creditScore}</span>
                  )}
                  {h.comments && <p className="text-muted-foreground mt-1">{h.comments}</p>}
                  <p className="text-xs text-muted-foreground">{formatDate(h.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approval/Rejection Modal */}
      {showModal && selectedLoan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">
              {showModal === "approve" ? "Approve Loan" : "Reject Loan"}
            </h3>
            {showModal === "approve" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Approved Amount (optional — leave blank to keep original)
                </label>
                <input
                  type="number"
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(e.target.value)}
                  placeholder="Approved amount"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-muted-foreground mb-1">Comments</label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={showModal === "reject" ? "Reason for rejection..." : "Optional comments..."}
                rows={3}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApproval(showModal === "approve")}
                disabled={officerLoading || managerLoading}
                className={`px-4 py-2 rounded-lg text-sm text-white ${
                  showModal === "approve"
                    ? "bg-success hover:bg-success/90"
                    : "bg-destructive hover:bg-destructive/90"
                } disabled:opacity-50`}
              >
                {(officerLoading || managerLoading) && <Loader2 className="inline h-4 w-4 mr-1 animate-spin" />}
                {showModal === "approve" ? "Approve" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
