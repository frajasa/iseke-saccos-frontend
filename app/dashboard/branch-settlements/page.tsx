"use client";

import { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import {
  GET_BRANCH_SETTLEMENTS,
  GET_PENDING_SETTLEMENTS,
  CREATE_BRANCH_SETTLEMENT,
  SETTLE_BRANCH_SETTLEMENT,
} from "@/lib/graphql/queries";
import { formatCurrency, formatDate } from "@/lib/utils";
import { isNullListError } from "@/lib/error-utils";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import { toast } from "sonner";
import {
  Building2,
  ArrowRightLeft,
  CheckCircle,
  Clock,
  Plus,
  RefreshCw,
} from "lucide-react";

const GET_BRANCHES = gql`
  query {
    branches {
      id
      branchName
      branchCode
    }
  }
`;

interface Branch {
  id: string;
  branchName: string;
  branchCode: string;
}

interface BranchSettlement {
  id: string;
  referenceNumber: string;
  fromBranch: { id: string; branchName: string; branchCode: string };
  toBranch: { id: string; branchName: string; branchCode: string };
  settlementDate: string;
  totalAmount: number;
  transactionCount: number;
  status: string;
  notes: string | null;
  settledBy: string | null;
  settledAt: string | null;
  createdAt: string;
}

const emptyForm = {
  fromBranchId: "",
  toBranchId: "",
  settlementDate: new Date().toISOString().split("T")[0],
  amount: "",
  transactionCount: "",
  notes: "",
};

export default function BranchSettlementsPage() {
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const {
    data: branchesData,
    loading: branchesLoading,
  } = useQuery(GET_BRANCHES);

  const {
    data: settlementsData,
    loading: settlementsLoading,
    error: settlementsError,
    refetch: refetchSettlements,
  } = useQuery(GET_BRANCH_SETTLEMENTS);

  const {
    data: pendingData,
    loading: pendingLoading,
    error: pendingError,
    refetch: refetchPending,
  } = useQuery(GET_PENDING_SETTLEMENTS);

  const [createSettlement, { loading: creating }] = useMutation(
    CREATE_BRANCH_SETTLEMENT,
    {
      onCompleted: () => {
        toast.success("Settlement created successfully");
        setForm(emptyForm);
        setShowForm(false);
        refetchSettlements();
        refetchPending();
      },
      onError: (err) => toast.error(err.message),
    }
  );

  const [settleSettlement, { loading: settling }] = useMutation(
    SETTLE_BRANCH_SETTLEMENT,
    {
      onCompleted: () => {
        toast.success("Settlement completed successfully");
        refetchSettlements();
        refetchPending();
      },
      onError: (err) => toast.error(err.message),
    }
  );

  const branches: Branch[] = branchesData?.branches || [];
  const settlements: BranchSettlement[] = settlementsData?.branchSettlements || settlementsData?.getBranchSettlements || [];
  const pendingSettlements: BranchSettlement[] = pendingData?.pendingSettlements || pendingData?.getPendingSettlements || [];

  const handleCreate = () => {
    if (!form.fromBranchId || !form.toBranchId) {
      toast.error("Please select both branches");
      return;
    }
    if (form.fromBranchId === form.toBranchId) {
      toast.error("From and To branches must be different");
      return;
    }
    if (!form.amount || parseFloat(form.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!form.transactionCount || parseInt(form.transactionCount) <= 0) {
      toast.error("Please enter a valid transaction count");
      return;
    }

    createSettlement({
      variables: {
        fromBranchId: form.fromBranchId,
        toBranchId: form.toBranchId,
        settlementDate: form.settlementDate,
        totalAmount: parseFloat(form.amount),
        transactionCount: parseInt(form.transactionCount),
        notes: form.notes || null,
      },
    });
  };

  const handleSettle = (id: string) => {
    if (settling) return;
    settleSettlement({ variables: { settlementId: id } });
  };

  const isLoading = settlementsLoading || branchesLoading;

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse text-muted-foreground">
          Loading branch settlements...
        </div>
      </div>
    );
  }

  const hasSettlementsError = settlementsError && !isNullListError(settlementsError);
  const hasPendingError = pendingError && !isNullListError(pendingError);

  if (hasSettlementsError) {
    return (
      <div className="p-6">
        <ErrorDisplay error={settlementsError} onRetry={() => refetchSettlements()} />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case "SETTLED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3" />
            Settled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="w-7 h-7" />
            Branch Settlements
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage inter-branch fund settlements
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              refetchSettlements();
              refetchPending();
            }}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Create Settlement
          </button>
        </div>
      </div>

      {/* Create Settlement Form */}
      {showForm && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5" />
            Create Settlement
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                From Branch
              </label>
              <select
                value={form.fromBranchId}
                onChange={(e) =>
                  setForm({ ...form, fromBranchId: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              >
                <option value="">Select branch...</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.branchCode} - {b.branchName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                To Branch
              </label>
              <select
                value={form.toBranchId}
                onChange={(e) =>
                  setForm({ ...form, toBranchId: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              >
                <option value="">Select branch...</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.branchCode} - {b.branchName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Settlement Date
              </label>
              <input
                type="date"
                value={form.settlementDate}
                onChange={(e) =>
                  setForm({ ...form, settlementDate: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Amount (TZS)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Transaction Count
              </label>
              <input
                type="number"
                min="1"
                value={form.transactionCount}
                onChange={(e) =>
                  setForm({ ...form, transactionCount: e.target.value })
                }
                placeholder="0"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Notes (optional)
              </label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Settlement notes..."
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => {
                setShowForm(false);
                setForm(emptyForm);
              }}
              className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Settlement"}
            </button>
          </div>
        </div>
      )}

      {/* Pending Settlements */}
      {pendingSettlements.length > 0 && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-semibold">
              Pending Settlements ({pendingSettlements.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    Reference #
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    From Branch
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    To Branch
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    Date
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    Amount
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    Txn Count
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingSettlements.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-border hover:bg-muted/30"
                  >
                    <td className="px-6 py-3 font-mono text-sm font-semibold">
                      {s.referenceNumber}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span className="font-medium">
                        {s.fromBranch?.branchCode}
                      </span>{" "}
                      - {s.fromBranch?.branchName}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span className="font-medium">
                        {s.toBranch?.branchCode}
                      </span>{" "}
                      - {s.toBranch?.branchName}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      {formatDate(s.settlementDate)}
                    </td>
                    <td className="px-6 py-3 text-sm text-right font-semibold">
                      {formatCurrency(s.totalAmount)}
                    </td>
                    <td className="px-6 py-3 text-sm text-center">
                      {s.transactionCount}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <button
                        onClick={() => handleSettle(s.id)}
                        disabled={settling}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Settle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {hasPendingError && (
        <ErrorDisplay
          error={pendingError}
          variant="card"
          onRetry={() => refetchPending()}
        />
      )}

      {/* All Settlements Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">All Settlements</h2>
        </div>
        {settlements.length === 0 ? (
          <div className="px-6 py-12 text-center text-muted-foreground">
            No settlements found. Create your first settlement above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    Reference #
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    From Branch
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    To Branch
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    Date
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    Amount
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    Txn Count
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    Settled By
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {settlements.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-border hover:bg-muted/30"
                  >
                    <td className="px-6 py-3 font-mono text-sm font-semibold">
                      {s.referenceNumber}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span className="font-medium">
                        {s.fromBranch?.branchCode}
                      </span>{" "}
                      - {s.fromBranch?.branchName}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span className="font-medium">
                        {s.toBranch?.branchCode}
                      </span>{" "}
                      - {s.toBranch?.branchName}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      {formatDate(s.settlementDate)}
                    </td>
                    <td className="px-6 py-3 text-sm text-right font-semibold">
                      {formatCurrency(s.totalAmount)}
                    </td>
                    <td className="px-6 py-3 text-sm text-center">
                      {s.transactionCount}
                    </td>
                    <td className="px-6 py-3 text-center">
                      {getStatusBadge(s.status)}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      {s.settledBy || "-"}
                    </td>
                    <td className="px-6 py-3 text-center">
                      {s.status === "PENDING" ? (
                        <button
                          onClick={() => handleSettle(s.id)}
                          disabled={settling}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Settle
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {s.settledAt ? formatDate(s.settledAt) : "-"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
