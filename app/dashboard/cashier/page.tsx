"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useSession } from "next-auth/react";
import {
  GET_ACTIVE_SESSION,
  GET_DRAWER_TRANSACTIONS,
  GET_SESSION_HISTORY,
  GET_OPEN_SESSIONS_BY_BRANCH,
  OPEN_CASHIER_SESSION,
  CLOSE_CASHIER_SESSION,
  RECONCILE_CASHIER_SESSION,
  GET_BRANCHES,
} from "@/lib/graphql/queries";
import { GET_ALL_USERS } from "@/lib/graphql/users";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { isNullListError } from "@/lib/error-utils";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import { toast } from "sonner";
import {
  Wallet,
  Play,
  Square,
  CheckCircle2,
  History,
  ArrowDownCircle,
  ArrowUpCircle,
  Users,
  Building2,
  RefreshCw,
} from "lucide-react";

const statusColors: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  CLOSED: "bg-yellow-100 text-yellow-700",
  RECONCILED: "bg-green-100 text-green-700",
};

export default function CashierSessionsPage() {
  const { data: sessionData } = useSession();
  const currentUser = sessionData?.user as any;

  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [openingBalance, setOpeningBalance] = useState<string>("0");
  const [showOpenForm, setShowOpenForm] = useState(false);
  const [showReconcileForm, setShowReconcileForm] = useState<string | null>(null);
  const [actualCash, setActualCash] = useState<string>("");
  const [reconcileNotes, setReconcileNotes] = useState<string>("");
  const [historyUserId, setHistoryUserId] = useState<string>("");
  const [historyPage, setHistoryPage] = useState(0);

  // Use current user's ID for active session query
  const activeUserId = currentUser?.id || "";

  const {
    data: activeData,
    loading: activeLoading,
    error: activeError,
    refetch: refetchActive,
  } = useQuery(GET_ACTIVE_SESSION, {
    variables: { userId: activeUserId },
    skip: !activeUserId,
    fetchPolicy: "network-only",
  });

  const activeSession = activeData?.activeSession || null;

  const {
    data: txData,
    loading: txLoading,
    error: txError,
  } = useQuery(GET_DRAWER_TRANSACTIONS, {
    variables: { sessionId: activeSession?.id },
    skip: !activeSession?.id,
    fetchPolicy: "network-only",
  });

  const drawerTransactions = txData?.drawerTransactions || [];

  const effectiveHistoryUserId = historyUserId || activeUserId;

  const {
    data: historyData,
    loading: historyLoading,
    error: historyError,
    refetch: refetchHistory,
  } = useQuery(GET_SESSION_HISTORY, {
    variables: { userId: effectiveHistoryUserId, page: historyPage, size: 10 },
    skip: !effectiveHistoryUserId,
    fetchPolicy: "network-only",
  });

  const historyPage_ = historyData?.sessionHistory;
  const historySessions = historyPage_?.content || [];
  const historyTotalPages = historyPage_?.totalPages || 0;

  const { data: usersData } = useQuery(GET_ALL_USERS);
  const { data: branchesData } = useQuery(GET_BRANCHES);

  const users = usersData?.findAllUsers || [];
  const branches = branchesData?.branches || [];

  // Open Sessions by Branch
  const [viewBranchId, setViewBranchId] = useState<string>("");
  const {
    data: branchSessionsData,
    loading: branchSessionsLoading,
    error: branchSessionsError,
  } = useQuery(GET_OPEN_SESSIONS_BY_BRANCH, {
    variables: { branchId: viewBranchId },
    skip: !viewBranchId,
    fetchPolicy: "network-only",
  });
  const branchSessions = branchSessionsData?.openSessionsByBranch || [];

  // Mutations
  const [openSession, { loading: opening }] = useMutation(OPEN_CASHIER_SESSION, {
    onCompleted: () => {
      toast.success("Cashier session opened successfully");
      setShowOpenForm(false);
      setOpeningBalance("0");
      setSelectedUserId("");
      setSelectedBranchId("");
      refetchActive();
      refetchHistory();
    },
    onError: (err) => toast.error(err.message),
  });

  const [closeSession, { loading: closing }] = useMutation(CLOSE_CASHIER_SESSION, {
    onCompleted: () => {
      toast.success("Cashier session closed");
      refetchActive();
      refetchHistory();
    },
    onError: (err) => toast.error(err.message),
  });

  const [reconcileSession, { loading: reconciling }] = useMutation(RECONCILE_CASHIER_SESSION, {
    onCompleted: (data) => {
      const result = data.reconcileCashierSession;
      const discrepancy = Number(result.discrepancy || 0);
      if (discrepancy === 0) {
        toast.success("Session reconciled - cash balanced perfectly!");
      } else {
        toast.success(`Session reconciled. Discrepancy: ${formatCurrency(discrepancy)}`);
      }
      setShowReconcileForm(null);
      setActualCash("");
      setReconcileNotes("");
      refetchActive();
      refetchHistory();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleOpenSession = () => {
    const userId = selectedUserId || activeUserId;
    if (!userId) {
      toast.error("Please select a user");
      return;
    }
    if (!selectedBranchId) {
      toast.error("Please select a branch");
      return;
    }
    openSession({
      variables: {
        userId,
        branchId: selectedBranchId,
        openingBalance: openingBalance || "0",
      },
    });
  };

  const handleCloseSession = (sessionId: string) => {
    if (!confirm("Are you sure you want to close this session?")) return;
    closeSession({ variables: { sessionId } });
  };

  const handleReconcile = (sessionId: string) => {
    if (!actualCash) {
      toast.error("Please enter the actual cash count");
      return;
    }
    reconcileSession({
      variables: {
        sessionId,
        actualCash,
        notes: reconcileNotes || null,
      },
    });
  };

  // Handle errors that aren't null list errors
  if (activeError && !isNullListError(activeError)) {
    return <ErrorDisplay error={activeError} onRetry={() => refetchActive()} />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cashier Sessions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage teller cash drawer sessions
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { refetchActive(); refetchHistory(); }}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          {!activeSession && (
            <button
              onClick={() => setShowOpenForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium"
            >
              <Play className="w-4 h-4" /> Open Session
            </button>
          )}
        </div>
      </div>

      {/* Active Session Card */}
      {activeLoading ? (
        <div className="animate-pulse bg-card border border-border rounded-xl p-6">
          <div className="h-6 bg-muted rounded w-48 mb-4" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </div>
      ) : activeSession ? (
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Wallet className="w-6 h-6 text-primary" />
              <div>
                <h2 className="text-lg font-semibold text-foreground">Active Session</h2>
                <p className="text-sm text-muted-foreground">
                  {activeSession.user?.fullName} - {activeSession.branch?.branchName} | Opened{" "}
                  {activeSession.openedAt ? formatDateTime(activeSession.openedAt) : "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[activeSession.status] || "bg-gray-100 text-gray-700"}`}>
                {activeSession.status}
              </span>
              {activeSession.status === "OPEN" && (
                <button
                  onClick={() => handleCloseSession(activeSession.id)}
                  disabled={closing}
                  className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm font-medium disabled:opacity-50"
                >
                  <Square className="w-3.5 h-3.5" /> {closing ? "Closing..." : "Close Session"}
                </button>
              )}
              {activeSession.status === "CLOSED" && (
                <button
                  onClick={() => {
                    setShowReconcileForm(activeSession.id);
                    setActualCash("");
                    setReconcileNotes("");
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Reconcile
                </button>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Opening Balance</p>
              <p className="text-lg font-semibold text-foreground">
                {formatCurrency(activeSession.openingBalance)}
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <ArrowDownCircle className="w-3.5 h-3.5 text-green-500" /> Cash In
              </p>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(activeSession.cashInTotal)}
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <ArrowUpCircle className="w-3.5 h-3.5 text-red-500" /> Cash Out
              </p>
              <p className="text-lg font-semibold text-red-600">
                {formatCurrency(activeSession.cashOutTotal)}
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Expected Balance</p>
              <p className="text-lg font-semibold text-foreground">
                {formatCurrency(activeSession.expectedBalance)}
              </p>
            </div>
          </div>

          {/* Reconcile info if reconciled */}
          {activeSession.status === "RECONCILED" && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Actual Balance: </span>
                  <span className="font-medium">{formatCurrency(activeSession.actualBalance)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Discrepancy: </span>
                  <span className={`font-medium ${Number(activeSession.discrepancy) === 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(activeSession.discrepancy)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Reconciled: </span>
                  <span className="font-medium">
                    {activeSession.reconciledAt ? formatDateTime(activeSession.reconciledAt) : "N/A"}
                  </span>
                </div>
              </div>
              {activeSession.notes && (
                <p className="mt-2 text-sm text-muted-foreground">Notes: {activeSession.notes}</p>
              )}
            </div>
          )}

          {/* Reconcile Form */}
          {showReconcileForm === activeSession.id && (
            <div className="mt-4 p-4 bg-muted/30 border border-border rounded-lg space-y-3">
              <h3 className="font-medium text-foreground">Reconcile Session</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">
                    Actual Cash Count *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={actualCash}
                    onChange={(e) => setActualCash(e.target.value)}
                    placeholder="Enter actual cash amount"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Notes</label>
                  <input
                    type="text"
                    value={reconcileNotes}
                    onChange={(e) => setReconcileNotes(e.target.value)}
                    placeholder="Optional notes"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleReconcile(activeSession.id)}
                  disabled={reconciling}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50"
                >
                  {reconciling ? "Reconciling..." : "Submit Reconciliation"}
                </button>
                <button
                  onClick={() => setShowReconcileForm(null)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-medium text-foreground mb-1">No Active Session</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Open a new cashier session to start processing transactions.
          </p>
          <button
            onClick={() => setShowOpenForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium"
          >
            <Play className="w-4 h-4" /> Open New Session
          </button>
        </div>
      )}

      {/* Open Session Modal */}
      {showOpenForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold text-foreground mb-4">Open Cashier Session</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  <Users className="w-4 h-4 inline mr-1" /> User
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                >
                  <option value="">Current User ({currentUser?.username || "me"})</option>
                  {users.map((u: any) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName || u.username} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  <Building2 className="w-4 h-4 inline mr-1" /> Branch *
                </label>
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                >
                  <option value="">Select branch...</option>
                  {branches.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      {b.branchName} ({b.branchCode})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Opening Balance
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleOpenSession}
                disabled={opening}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium disabled:opacity-50"
              >
                {opening ? "Opening..." : "Open Session"}
              </button>
              <button
                onClick={() => setShowOpenForm(false)}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer Transactions */}
      {activeSession && activeSession.status === "OPEN" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Cash Drawer Transactions
            </h2>
            <span className="text-sm text-muted-foreground ml-1">
              ({drawerTransactions.length} transactions)
            </span>
          </div>
          {txLoading ? (
            <div className="p-6 text-center text-muted-foreground animate-pulse">
              Loading transactions...
            </div>
          ) : txError && !isNullListError(txError) ? (
            <div className="p-6">
              <ErrorDisplay error={txError} variant="inline" />
            </div>
          ) : drawerTransactions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No transactions in this session yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Direction
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Running Balance
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Transaction #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {drawerTransactions.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 text-sm font-medium ${
                            tx.cashDirection === "IN" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {tx.cashDirection === "IN" ? (
                            <ArrowDownCircle className="w-4 h-4" />
                          ) : (
                            <ArrowUpCircle className="w-4 h-4" />
                          )}
                          {tx.cashDirection}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {formatCurrency(tx.runningBalance)}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {tx.transaction?.transactionNumber || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {tx.description || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {tx.createdAt ? formatDateTime(tx.createdAt) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Open Sessions by Branch */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
          <Building2 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Open Sessions by Branch</h2>
          <select
            value={viewBranchId}
            onChange={(e) => setViewBranchId(e.target.value)}
            className="ml-auto px-3 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm"
          >
            <option value="">Select branch...</option>
            {branches.map((b: any) => (
              <option key={b.id} value={b.id}>
                {b.branchName}
              </option>
            ))}
          </select>
        </div>
        {viewBranchId ? (
          branchSessionsLoading ? (
            <div className="p-6 text-center text-muted-foreground animate-pulse">
              Loading branch sessions...
            </div>
          ) : branchSessionsError && !isNullListError(branchSessionsError) ? (
            <div className="p-6">
              <ErrorDisplay error={branchSessionsError} variant="inline" />
            </div>
          ) : branchSessions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No open sessions for this branch.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Opening Balance
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Cash In
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Cash Out
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Opened At
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {branchSessions.map((s: any) => (
                    <tr key={s.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {s.user?.fullName || s.user?.username}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {formatCurrency(s.openingBalance)}
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600">
                        {formatCurrency(s.cashInTotal)}
                      </td>
                      <td className="px-4 py-3 text-sm text-red-600">
                        {formatCurrency(s.cashOutTotal)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[s.status] || "bg-gray-100 text-gray-700"}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {s.openedAt ? formatDateTime(s.openedAt) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            Select a branch to view open sessions.
          </div>
        )}
      </div>

      {/* Session History */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
          <History className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Session History</h2>
          <select
            value={historyUserId}
            onChange={(e) => {
              setHistoryUserId(e.target.value);
              setHistoryPage(0);
            }}
            className="ml-auto px-3 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm"
          >
            <option value="">My Sessions</option>
            {users.map((u: any) => (
              <option key={u.id} value={u.id}>
                {u.fullName || u.username}
              </option>
            ))}
          </select>
        </div>
        {historyLoading ? (
          <div className="p-6 text-center text-muted-foreground animate-pulse">
            Loading session history...
          </div>
        ) : historyError && !isNullListError(historyError) ? (
          <div className="p-6">
            <ErrorDisplay error={historyError} variant="inline" />
          </div>
        ) : historySessions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No session history found.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Branch
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Opening
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Cash In
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Cash Out
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Expected
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Actual
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Discrepancy
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Opened
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Closed
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {historySessions.map((s: any) => (
                    <tr key={s.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {s.user?.fullName || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {s.branch?.branchName || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {formatCurrency(s.openingBalance)}
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600">
                        {formatCurrency(s.cashInTotal)}
                      </td>
                      <td className="px-4 py-3 text-sm text-red-600">
                        {formatCurrency(s.cashOutTotal)}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {s.expectedBalance != null ? formatCurrency(s.expectedBalance) : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {s.actualBalance != null ? formatCurrency(s.actualBalance) : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {s.discrepancy != null ? (
                          <span className={Number(s.discrepancy) === 0 ? "text-green-600" : "text-red-600"}>
                            {formatCurrency(s.discrepancy)}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[s.status] || "bg-gray-100 text-gray-700"}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {s.openedAt ? formatDateTime(s.openedAt) : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {s.closedAt ? formatDateTime(s.closedAt) : "-"}
                      </td>
                      <td className="px-4 py-3">
                        {s.status === "CLOSED" && (
                          <button
                            onClick={() => {
                              setShowReconcileForm(s.id);
                              setActualCash("");
                              setReconcileNotes("");
                            }}
                            className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Reconcile
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Reconcile form for history items */}
            {showReconcileForm && showReconcileForm !== activeSession?.id && (
              <div className="px-6 py-4 border-t border-border bg-muted/30 space-y-3">
                <h3 className="font-medium text-foreground">Reconcile Session</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">
                      Actual Cash Count *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={actualCash}
                      onChange={(e) => setActualCash(e.target.value)}
                      placeholder="Enter actual cash amount"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Notes</label>
                    <input
                      type="text"
                      value={reconcileNotes}
                      onChange={(e) => setReconcileNotes(e.target.value)}
                      placeholder="Optional notes"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReconcile(showReconcileForm)}
                    disabled={reconciling}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50"
                  >
                    {reconciling ? "Reconciling..." : "Submit Reconciliation"}
                  </button>
                  <button
                    onClick={() => setShowReconcileForm(null)}
                    className="px-4 py-2 border border-border rounded-lg hover:bg-muted text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Pagination */}
            {historyTotalPages > 1 && (
              <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {historyPage + 1} of {historyTotalPages} ({historyPage_?.totalElements || 0} total)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setHistoryPage((p) => Math.max(0, p - 1))}
                    disabled={historyPage === 0}
                    className="px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-muted disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setHistoryPage((p) => Math.min(historyTotalPages - 1, p + 1))}
                    disabled={historyPage >= historyTotalPages - 1}
                    className="px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-muted disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
