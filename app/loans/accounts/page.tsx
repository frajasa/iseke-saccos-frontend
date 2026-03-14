"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  GET_LOAN_ACCOUNTS,
  APPROVE_LOAN,
  DISBURSE_LOAN,
  GET_ALL_SERVICE_REQUESTS,
  REVIEW_ESS_REQUEST,
} from "@/lib/graphql/queries";
import { LoanAccount, LoanStatus } from "@/lib/types";
import {
  Filter,
  Eye,
  CheckCircle,
  Banknote,
  Clock,
  AlertCircle,
  FileCheck,
  XCircle,
  ClipboardList,
  ChevronDown,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { getStatusColor, formatCurrency, formatDate } from "@/lib/utils";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import { SkeletonTable } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { isNullListError } from "@/lib/error-utils";
import { toast } from "sonner";

type Tab = "pending_approval" | "pending_disburse" | "member_requests" | "all";

export default function LoanAccountsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("pending_approval");
  const [allPage, setAllPage] = useState(0);
  const [allStatusFilter, setAllStatusFilter] = useState<LoanStatus | undefined>(undefined);
  const [requestStatusFilter, setRequestStatusFilter] = useState<string>("PENDING");
  const [requestPage, setRequestPage] = useState(0);
  const [reviewModal, setReviewModal] = useState<{ id: string; requestNumber: string } | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  // Pending Approval (APPLIED)
  const { data: appliedData, loading: appliedLoading, refetch: refetchApplied } = useQuery(GET_LOAN_ACCOUNTS, {
    variables: { page: 0, size: 100, status: "APPLIED" },
  });

  // Pending Disbursement (APPROVED)
  const { data: approvedData, loading: approvedLoading, refetch: refetchApproved } = useQuery(GET_LOAN_ACCOUNTS, {
    variables: { page: 0, size: 100, status: "APPROVED" },
  });

  // All Loans
  const { data: allData, loading: allLoading, error: allError, refetch: refetchAll } = useQuery(GET_LOAN_ACCOUNTS, {
    variables: { page: allPage, size: 20, status: allStatusFilter },
    skip: activeTab !== "all",
  });

  // Member Service Requests (ESS)
  const { data: requestsData, loading: requestsLoading, refetch: refetchRequests } = useQuery(GET_ALL_SERVICE_REQUESTS, {
    variables: { status: requestStatusFilter || undefined, page: requestPage, size: 20 },
    skip: activeTab !== "member_requests",
  });

  const [approveLoan] = useMutation(APPROVE_LOAN);
  const [disburseLoan] = useMutation(DISBURSE_LOAN);
  const [reviewRequest] = useMutation(REVIEW_ESS_REQUEST);

  const appliedLoans: LoanAccount[] = appliedData?.loanAccounts?.content || [];
  const approvedLoans: LoanAccount[] = approvedData?.loanAccounts?.content || [];
  const allLoans: LoanAccount[] = allData?.loanAccounts?.content || [];
  const allTotalPages = allData?.loanAccounts?.totalPages || 0;
  const requests = requestsData?.allServiceRequests?.content || [];
  const requestsTotalPages = requestsData?.allServiceRequests?.totalPages || 0;

  const handleApprove = async (loanId: string) => {
    if (!confirm("Approve this loan?")) return;
    try {
      await approveLoan({ variables: { id: loanId } });
      toast.success("Loan approved");
      refetchApplied();
      refetchApproved();
    } catch (err: any) {
      toast.error(err.message || "Failed to approve");
    }
  };

  const handleDisburse = async (loanId: string) => {
    if (!confirm("Disburse this loan?")) return;
    try {
      await disburseLoan({ variables: { id: loanId } });
      toast.success("Loan disbursed");
      refetchApproved();
    } catch (err: any) {
      toast.error(err.message || "Failed to disburse");
    }
  };

  const handleReview = async (status: "APPROVED" | "REJECTED") => {
    if (!reviewModal) return;
    try {
      await reviewRequest({ variables: { requestId: reviewModal.id, status, reviewNotes } });
      toast.success(`Request ${status.toLowerCase()}`);
      setReviewModal(null);
      setReviewNotes("");
      refetchRequests();
    } catch (err: any) {
      toast.error(err.message || "Failed to review request");
    }
  };

  const tabs = [
    { key: "pending_approval" as Tab, label: "Pending Approval", icon: Clock, count: appliedLoans.length, color: "text-amber-600" },
    { key: "pending_disburse" as Tab, label: "Pending Disbursement", icon: Banknote, count: approvedLoans.length, color: "text-blue-600" },
    { key: "member_requests" as Tab, label: "Member Requests", icon: ClipboardList, count: null, color: "text-purple-600" },
    { key: "all" as Tab, label: "All Loans", icon: FileCheck, count: null, color: "text-foreground" },
  ];

  const shouldShowError = allError && !isNullListError(allError) && allLoans.length === 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl tracking-tight font-bold text-foreground">Loan Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Review, approve, and disburse loans</p>
        </div>
        <Link href="/loans"
          className="inline-flex items-center justify-center gap-2 text-foreground bg-card border border-border hover:bg-muted font-medium px-5 py-2.5 text-sm rounded-lg transition-colors">
          Loan Products
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 cursor-pointer hover:border-amber-300 transition-colors"
          onClick={() => setActiveTab("pending_approval")}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending Approval</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">{appliedLoading ? "..." : appliedLoans.length}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          {!appliedLoading && appliedLoans.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Total: {formatCurrency(appliedLoans.reduce((sum, l) => sum + Number(l.principalAmount || 0), 0))}
            </p>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border p-5 cursor-pointer hover:border-blue-300 transition-colors"
          onClick={() => setActiveTab("pending_disburse")}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending Disbursement</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{approvedLoading ? "..." : approvedLoans.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Banknote className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          {!approvedLoading && approvedLoans.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Total: {formatCurrency(approvedLoans.reduce((sum, l) => sum + Number(l.principalAmount || 0), 0))}
            </p>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border p-5 cursor-pointer hover:border-purple-300 transition-colors"
          onClick={() => setActiveTab("member_requests")}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Member Requests</p>
              <p className="text-sm text-muted-foreground mt-2">Loan & withdrawal requests from ESS</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 cursor-pointer hover:border-primary/30 transition-colors"
          onClick={() => setActiveTab("all")}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">All Loans</p>
              <p className="text-sm text-muted-foreground mt-2">View all loan accounts</p>
            </div>
            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
              <FileCheck className="w-6 h-6 text-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl border border-border">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center
              ${activeTab === tab.key ? "bg-card shadow-sm text-foreground border border-border" : "text-muted-foreground hover:text-foreground"}`}>
            <tab.icon className={`w-4 h-4 ${activeTab === tab.key ? tab.color : ""}`} />
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.count !== null && tab.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === tab.key ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {(activeTab === "pending_approval" || activeTab === "pending_disburse") && (
        <LoanTable
          loans={activeTab === "pending_approval" ? appliedLoans : approvedLoans}
          loading={activeTab === "pending_approval" ? appliedLoading : approvedLoading}
          emptyTitle={activeTab === "pending_approval" ? "No loans pending approval" : "No loans pending disbursement"}
          emptyDesc={activeTab === "pending_approval" ? "All loan applications have been reviewed" : "All approved loans have been disbursed"}
          onApprove={activeTab === "pending_approval" ? handleApprove : undefined}
          onDisburse={activeTab === "pending_disburse" ? handleDisburse : undefined}
        />
      )}

      {activeTab === "member_requests" && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {/* Filter */}
          <div className="px-6 py-4 border-b border-border flex items-center gap-4">
            <label className="text-sm font-medium text-muted-foreground">Status:</label>
            <select value={requestStatusFilter} onChange={(e) => { setRequestStatusFilter(e.target.value); setRequestPage(0); }}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm">
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="PROCESSING">Processing</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {requestsLoading ? (
            <SkeletonTable rows={6} cols={7} />
          ) : requests.length === 0 ? (
            <EmptyState title="No service requests" description="Member service requests will appear here" />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/30 border-b border-border">
                    <tr>
                      <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">Request #</th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">Member</th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">Type</th>
                      <th className="text-right py-3 px-6 text-xs font-medium text-muted-foreground uppercase">Amount</th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">Description</th>
                      <th className="text-center py-3 px-6 text-xs font-medium text-muted-foreground uppercase">Status</th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">Date</th>
                      <th className="text-center py-3 px-6 text-xs font-medium text-muted-foreground uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req: any) => (
                      <tr key={req.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-6 text-sm font-mono font-medium">{req.requestNumber}</td>
                        <td className="py-3 px-6">
                          <p className="text-sm font-medium">{req.member?.fullName || `${req.member?.firstName} ${req.member?.lastName}`}</p>
                          <p className="text-xs text-muted-foreground">{req.member?.memberNumber}</p>
                        </td>
                        <td className="py-3 px-6">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            req.requestType === "LOAN_APPLICATION" ? "bg-blue-100 text-blue-700" :
                            req.requestType === "WITHDRAWAL" ? "bg-orange-100 text-orange-700" :
                            "bg-gray-100 text-gray-700"
                          }`}>
                            {req.requestType?.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-sm text-right font-medium">{req.amount ? formatCurrency(req.amount) : "-"}</td>
                        <td className="py-3 px-6 text-sm text-muted-foreground max-w-[200px] truncate">{req.description || "-"}</td>
                        <td className="py-3 px-6 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            req.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                            req.status === "APPROVED" ? "bg-green-100 text-green-700" :
                            req.status === "REJECTED" ? "bg-red-100 text-red-700" :
                            req.status === "PROCESSING" ? "bg-blue-100 text-blue-700" :
                            req.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" :
                            "bg-gray-100 text-gray-700"
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-sm text-muted-foreground">{formatDate(req.createdAt)}</td>
                        <td className="py-3 px-6 text-center">
                          {req.status === "PENDING" && (
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => setReviewModal({ id: req.id, requestNumber: req.requestNumber })}
                                className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Review">
                                <MessageSquare className="w-4 h-4" />
                              </button>
                              <button onClick={() => { if (confirm("Approve this request?")) reviewRequest({ variables: { requestId: req.id, status: "APPROVED", reviewNotes: "" } }).then(() => { toast.success("Request approved"); refetchRequests(); }).catch((e: any) => toast.error(e.message)); }}
                                className="p-1.5 text-green-600 hover:bg-green-600/10 rounded-lg transition-colors" title="Quick Approve">
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button onClick={() => { if (confirm("Reject this request?")) reviewRequest({ variables: { requestId: req.id, status: "REJECTED", reviewNotes: "" } }).then(() => { toast.success("Request rejected"); refetchRequests(); }).catch((e: any) => toast.error(e.message)); }}
                                className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Quick Reject">
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                          {req.status !== "PENDING" && req.reviewNotes && (
                            <span className="text-xs text-muted-foreground italic" title={req.reviewNotes}>
                              {req.reviewNotes.substring(0, 30)}{req.reviewNotes.length > 30 ? "..." : ""}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {requestsTotalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                  <button onClick={() => setRequestPage((p) => Math.max(0, p - 1))} disabled={requestPage === 0}
                    className="px-4 py-2 text-sm font-medium bg-background border border-border rounded-lg hover:bg-muted disabled:opacity-50">Previous</button>
                  <span className="text-sm text-muted-foreground">Page {requestPage + 1} of {requestsTotalPages}</span>
                  <button onClick={() => setRequestPage((p) => Math.min(requestsTotalPages - 1, p + 1))} disabled={requestPage >= requestsTotalPages - 1}
                    className="px-4 py-2 text-sm font-medium bg-background border border-border rounded-lg hover:bg-muted disabled:opacity-50">Next</button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === "all" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-4">
              <Filter className="text-muted-foreground w-5 h-5" />
              <select value={allStatusFilter || ""} onChange={(e) => { setAllStatusFilter((e.target.value as LoanStatus) || undefined); setAllPage(0); }}
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm">
                <option value="">All Status</option>
                <option value="APPLIED">Applied</option>
                <option value="APPROVED">Approved</option>
                <option value="DISBURSED">Disbursed</option>
                <option value="ACTIVE">Active</option>
                <option value="CLOSED">Closed</option>
                <option value="WRITTEN_OFF">Written Off</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          <LoanTable
            loans={allLoans}
            loading={allLoading}
            error={shouldShowError ? allError : undefined}
            onRetry={() => refetchAll()}
            emptyTitle="No loan accounts found"
            emptyDesc="Loan accounts will appear here once members apply for loans"
            onApprove={handleApprove}
            onDisburse={handleDisburse}
            pagination={{ page: allPage, totalPages: allTotalPages, setPage: setAllPage }}
          />
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setReviewModal(null)}>
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-1">Review Request</h2>
            <p className="text-sm text-muted-foreground mb-4">{reviewModal.requestNumber}</p>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Review Notes</label>
              <textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                placeholder="Add notes for this review..." />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setReviewModal(null)} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted">Cancel</button>
              <button onClick={() => handleReview("REJECTED")}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600">Reject</button>
              <button onClick={() => handleReview("APPROVED")}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">Approve</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable loan table component
function LoanTable({ loans, loading, error, onRetry, emptyTitle, emptyDesc, onApprove, onDisburse, pagination }: {
  loans: LoanAccount[];
  loading: boolean;
  error?: any;
  onRetry?: () => void;
  emptyTitle: string;
  emptyDesc: string;
  onApprove?: (id: string) => void;
  onDisburse?: (id: string) => void;
  pagination?: { page: number; totalPages: number; setPage: (p: number | ((p: number) => number)) => void };
}) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {loading ? (
        <SkeletonTable rows={6} cols={8} />
      ) : error ? (
        <ErrorDisplay error={error} onRetry={onRetry} />
      ) : loans.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDesc} />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">Loan #</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">Member</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">Product</th>
                  <th className="text-right py-3 px-6 text-xs font-medium text-muted-foreground uppercase">Principal</th>
                  <th className="text-right py-3 px-6 text-xs font-medium text-muted-foreground uppercase">Outstanding</th>
                  <th className="text-center py-3 px-6 text-xs font-medium text-muted-foreground uppercase">Status</th>
                  <th className="text-center py-3 px-6 text-xs font-medium text-muted-foreground uppercase">Arrears</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">Date</th>
                  <th className="text-center py-3 px-6 text-xs font-medium text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-6 text-sm font-medium font-mono">{loan.loanNumber}</td>
                    <td className="py-3 px-6">
                      <p className="text-sm font-medium">{loan.member?.firstName} {loan.member?.lastName}</p>
                      <p className="text-xs text-muted-foreground">{loan.member?.memberNumber}</p>
                    </td>
                    <td className="py-3 px-6 text-sm text-muted-foreground">{loan.product?.productName}</td>
                    <td className="py-3 px-6 text-sm text-right font-medium">{formatCurrency(loan.principalAmount)}</td>
                    <td className="py-3 px-6 text-sm text-right font-medium">
                      {formatCurrency(
                        Number(loan.outstandingPrincipal || 0) +
                        Number(loan.outstandingInterest || 0) +
                        Number(loan.outstandingFees || 0) +
                        Number(loan.outstandingPenalties || 0)
                      )}
                    </td>
                    <td className="py-3 px-6 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border ${getStatusColor(loan.status)}`}>
                        {loan.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-sm text-center">
                      {loan.daysInArrears > 0 ? (
                        <span className="text-destructive font-medium">{loan.daysInArrears}</span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </td>
                    <td className="py-3 px-6 text-sm text-muted-foreground">{formatDate(loan.disbursementDate || loan.applicationDate)}</td>
                    <td className="py-3 px-6 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/loans/accounts/${loan.id}`}
                          className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="View Details">
                          <Eye className="w-4 h-4" />
                        </Link>
                        {loan.status === "APPLIED" && onApprove && (
                          <button onClick={() => onApprove(loan.id)}
                            className="p-1.5 text-green-600 hover:bg-green-600/10 rounded-lg transition-colors" title="Approve">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {loan.status === "APPROVED" && onDisburse && (
                          <button onClick={() => onDisburse(loan.id)}
                            className="p-1.5 text-blue-600 hover:bg-blue-600/10 rounded-lg transition-colors" title="Disburse">
                            <Banknote className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <button onClick={() => pagination.setPage((p: number) => Math.max(0, p - 1))} disabled={pagination.page === 0}
                className="px-4 py-2 text-sm font-medium bg-background border border-border rounded-lg hover:bg-muted disabled:opacity-50">Previous</button>
              <span className="text-sm text-muted-foreground">Page {pagination.page + 1} of {pagination.totalPages}</span>
              <button onClick={() => pagination.setPage((p: number) => Math.min(pagination.totalPages - 1, p + 1))} disabled={pagination.page >= pagination.totalPages - 1}
                className="px-4 py-2 text-sm font-medium bg-background border border-border rounded-lg hover:bg-muted disabled:opacity-50">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
