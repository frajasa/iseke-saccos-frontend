"use client";

import { useQuery } from "@apollo/client/react";
import { GET_ESS_SERVICE_REQUESTS } from "@/lib/graphql/queries";
import { formatCurrency, formatDateTime, getStatusColor } from "@/lib/utils";
import { FileText } from "lucide-react";
import ErrorDisplay from "@/components/ui/ErrorDisplay";

export default function MemberRequestsPage() {
  const { data, loading, error } = useQuery(GET_ESS_SERVICE_REQUESTS);
  const requests = data?.essServiceRequests || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-[3px] border-muted border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay error={error} variant="full-page" />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">My Requests</h1>
        <p className="text-muted-foreground mt-1">Track your service requests</p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No service requests yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req: any) => (
            <div key={req.id} className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">{req.requestNumber}</h3>
                  <p className="text-sm text-muted-foreground">{req.requestType?.replace(/_/g, " ")}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(req.status)}`}>
                  {req.status}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Amount</span>
                  <p className="font-semibold">{req.amount ? formatCurrency(req.amount) : "N/A"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Submitted</span>
                  <p className="font-medium">{formatDateTime(req.createdAt)}</p>
                </div>
                {req.description && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Description</span>
                    <p className="font-medium">{req.description}</p>
                  </div>
                )}
              </div>
              {req.reviewNotes && (
                <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Review Notes</p>
                  <p className="text-sm">{req.reviewNotes}</p>
                  {req.reviewedAt && (
                    <p className="text-xs text-muted-foreground mt-1">Reviewed: {formatDateTime(req.reviewedAt)}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
