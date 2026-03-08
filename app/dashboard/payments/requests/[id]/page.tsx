"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import { GET_PAYMENT_REQUEST, CHECK_PAYMENT_STATUS, CANCEL_PAYMENT_REQUEST } from "@/lib/graphql/queries";
import { formatCurrency, formatDateTime, getStatusColor } from "@/lib/utils";
import { ArrowLeft, RefreshCw, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ErrorDisplay from "@/components/ui/ErrorDisplay";

export default function PaymentRequestDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data, loading, error, refetch } = useQuery(GET_PAYMENT_REQUEST, {
    variables: { id },
  });

  const [checkStatus, { loading: checkingStatus }] = useMutation(CHECK_PAYMENT_STATUS, {
    variables: { paymentRequestId: id },
    onCompleted: () => refetch(),
  });

  const [cancelRequest, { loading: cancelling }] = useMutation(CANCEL_PAYMENT_REQUEST, {
    variables: { paymentRequestId: id },
    onCompleted: () => refetch(),
  });

  const request = data?.paymentRequest;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-[3px] border-muted border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay error={error} variant="full-page" onRetry={() => refetch()} />;
  }

  if (!request) {
    return <ErrorDisplay variant="full-page" title="Not Found" message="Payment request not found." />;
  }

  const canCheck = request.status === "SENT";
  const canCancel = request.status === "INITIATED" || request.status === "SENT";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/payments/requests" className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Payment Request</h1>
            <p className="text-muted-foreground mt-1">{request.requestNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {canCheck && (
            <button
              onClick={() => checkStatus()}
              disabled={checkingStatus}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {checkingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Check Status
            </button>
          )}
          {canCancel && (
            <button
              onClick={() => cancelRequest()}
              disabled={cancelling}
              className="inline-flex items-center gap-2 bg-destructive hover:bg-destructive/90 text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div>
        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
          {request.status}
        </span>
      </div>

      {/* Amount Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <p className="text-sm opacity-90 mb-1">{request.direction === "INBOUND" ? "Collection" : "Disbursement"}</p>
        <p className="text-2xl font-bold tabular-nums">{formatCurrency(request.amount)}</p>
        <p className="text-sm opacity-80 mt-1">via {request.provider} | {request.currency}</p>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">Request Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Provider</span>
              <span className="text-sm font-medium">{request.provider}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Direction</span>
              <span className="text-sm font-medium">{request.direction}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Purpose</span>
              <span className="text-sm font-medium">{request.purpose || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Phone Number</span>
              <span className="text-sm font-medium">{request.phoneNumber || "N/A"}</span>
            </div>
            {request.bankAccountNumber && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Bank Account</span>
                <span className="text-sm font-medium">{request.bankAccountNumber}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Initiated By</span>
              <span className="text-sm font-medium">{request.initiatedBy || "N/A"}</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">Provider Response</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Provider Reference</span>
              <span className="text-sm font-medium">{request.providerReference || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Response Code</span>
              <span className="text-sm font-medium">{request.providerResponseCode || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Response Message</span>
              <span className="text-sm font-medium">{request.providerResponseMessage || "N/A"}</span>
            </div>
            {request.failureReason && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Failure Reason</span>
                <span className="text-sm font-medium text-destructive">{request.failureReason}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">Timeline</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Initiated</span>
            <span className="text-sm font-medium">{formatDateTime(request.initiatedAt)}</span>
          </div>
          {request.sentAt && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Sent to Provider</span>
              <span className="text-sm font-medium">{formatDateTime(request.sentAt)}</span>
            </div>
          )}
          {request.callbackAt && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Callback Received</span>
              <span className="text-sm font-medium">{formatDateTime(request.callbackAt)}</span>
            </div>
          )}
          {request.completedAt && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Completed</span>
              <span className="text-sm font-medium">{formatDateTime(request.completedAt)}</span>
            </div>
          )}
          {request.expiresAt && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Expires</span>
              <span className="text-sm font-medium">{formatDateTime(request.expiresAt)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Member Info */}
      {request.member && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">Member</h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
              {request.member.firstName?.[0]}{request.member.lastName?.[0]}
            </div>
            <div>
              <p className="font-medium">{request.member.firstName} {request.member.lastName}</p>
              <p className="text-sm text-muted-foreground">{request.member.memberNumber}</p>
            </div>
            <Link
              href={`/members/${request.member.id}`}
              className="ml-auto text-sm text-primary hover:underline"
            >
              View Member
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
