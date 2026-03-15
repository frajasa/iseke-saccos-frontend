"use client";

import { useState } from "react";
import { useQuery, useLazyQuery, useMutation } from "@apollo/client";
import {
  GET_PETTY_CASH_ACCOUNTS,
  GET_PETTY_CASH_TRANSACTIONS,
  CREATE_PETTY_CASH_ACCOUNT,
  FUND_PETTY_CASH,
  SPEND_PETTY_CASH,
  REPLENISH_PETTY_CASH,
  GET_BRANCHES,
  GET_CHART_OF_ACCOUNTS,
} from "@/lib/graphql/queries";
import { PettyCashAccount, PettyCashTransaction, Branch, ChartOfAccount } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  Plus,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCw,
  X,
  Building2,
  User,
  ChevronDown,
  ChevronUp,
  Receipt,
  TrendingUp,
  TrendingDown,
  RotateCcw,
} from "lucide-react";

type ModalType = "create" | "fund" | "spend" | "replenish" | null;

const txnTypeConfig: Record<string, { label: string; color: string; bgColor: string; borderColor: string; icon: typeof TrendingUp }> = {
  FUND: { label: "Fund", color: "text-emerald-700 dark:text-emerald-400", bgColor: "bg-emerald-50 dark:bg-emerald-500/10", borderColor: "border-emerald-200 dark:border-emerald-500/20", icon: TrendingUp },
  SPEND: { label: "Spend", color: "text-red-700 dark:text-red-400", bgColor: "bg-red-50 dark:bg-red-500/10", borderColor: "border-red-200 dark:border-red-500/20", icon: TrendingDown },
  REPLENISH: { label: "Replenish", color: "text-blue-700 dark:text-blue-400", bgColor: "bg-blue-50 dark:bg-blue-500/10", borderColor: "border-blue-200 dark:border-blue-500/20", icon: RotateCcw },
};

export default function PettyCashPage() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [expandedAccountId, setExpandedAccountId] = useState<string | null>(null);

  // Create account form
  const [createForm, setCreateForm] = useState({
    accountName: "",
    custodian: "",
    authorizedAmount: "",
    branchId: "",
    glAccountId: "",
    description: "",
  });

  // Fund form
  const [fundForm, setFundForm] = useState({ amount: "", description: "", referenceNumber: "" });

  // Spend form
  const [spendForm, setSpendForm] = useState({ amount: "", description: "", receiptNumber: "", category: "", vendor: "" });

  // Replenish form
  const [replenishForm, setReplenishForm] = useState({ amount: "", description: "", referenceNumber: "" });

  // Queries
  const { data: accountsData, loading: accountsLoading, refetch: refetchAccounts } = useQuery(GET_PETTY_CASH_ACCOUNTS);
  const { data: branchesData } = useQuery(GET_BRANCHES);
  const { data: glData } = useQuery(GET_CHART_OF_ACCOUNTS);

  const [fetchTransactions, { data: txnData, loading: txnLoading }] = useLazyQuery(GET_PETTY_CASH_TRANSACTIONS, {
    fetchPolicy: "network-only",
  });

  // Mutations
  const [createAccount, { loading: creating }] = useMutation(CREATE_PETTY_CASH_ACCOUNT, {
    onCompleted: () => {
      toast.success("Petty cash account created successfully");
      refetchAccounts();
      closeModal();
    },
    onError: (err) => toast.error(err.message),
  });

  const [fundPettyCash, { loading: funding }] = useMutation(FUND_PETTY_CASH, {
    onCompleted: () => {
      toast.success("Petty cash funded successfully");
      refetchAccounts();
      if (expandedAccountId) fetchTransactions({ variables: { accountId: expandedAccountId } });
      closeModal();
    },
    onError: (err) => toast.error(err.message),
  });

  const [spendPettyCash, { loading: spending }] = useMutation(SPEND_PETTY_CASH, {
    onCompleted: () => {
      toast.success("Expenditure recorded successfully");
      refetchAccounts();
      if (expandedAccountId) fetchTransactions({ variables: { accountId: expandedAccountId } });
      closeModal();
    },
    onError: (err) => toast.error(err.message),
  });

  const [replenishPettyCash, { loading: replenishing }] = useMutation(REPLENISH_PETTY_CASH, {
    onCompleted: () => {
      toast.success("Petty cash replenished successfully");
      refetchAccounts();
      if (expandedAccountId) fetchTransactions({ variables: { accountId: expandedAccountId } });
      closeModal();
    },
    onError: (err) => toast.error(err.message),
  });

  const accounts: PettyCashAccount[] = accountsData?.pettyCashAccounts || [];
  const branches: Branch[] = branchesData?.branches || [];
  const glAccounts: ChartOfAccount[] = glData?.chartOfAccounts || [];
  const transactions: PettyCashTransaction[] = txnData?.pettyCashTransactions || [];

  const closeModal = () => {
    setActiveModal(null);
    setSelectedAccountId(null);
    setCreateForm({ accountName: "", custodian: "", authorizedAmount: "", branchId: "", glAccountId: "", description: "" });
    setFundForm({ amount: "", description: "", referenceNumber: "" });
    setSpendForm({ amount: "", description: "", receiptNumber: "", category: "", vendor: "" });
    setReplenishForm({ amount: "", description: "", referenceNumber: "" });
  };

  const handleExpandAccount = (accountId: string) => {
    if (expandedAccountId === accountId) {
      setExpandedAccountId(null);
    } else {
      setExpandedAccountId(accountId);
      fetchTransactions({ variables: { accountId } });
    }
  };

  const openOperationModal = (type: ModalType, accountId: string) => {
    setSelectedAccountId(accountId);
    setActiveModal(type);
  };

  const handleCreateAccount = () => {
    if (!createForm.accountName || !createForm.custodian || !createForm.authorizedAmount) {
      toast.error("Account name, custodian, and authorized amount are required");
      return;
    }
    createAccount({
      variables: {
        input: {
          accountName: createForm.accountName,
          custodian: createForm.custodian,
          authorizedAmount: createForm.authorizedAmount,
          branchId: createForm.branchId || undefined,
          glAccountId: createForm.glAccountId || undefined,
          description: createForm.description || undefined,
        },
      },
    });
  };

  const handleFund = () => {
    if (!fundForm.amount) { toast.error("Amount is required"); return; }
    fundPettyCash({
      variables: {
        accountId: selectedAccountId,
        amount: fundForm.amount,
        description: fundForm.description || undefined,
        referenceNumber: fundForm.referenceNumber || undefined,
      },
    });
  };

  const handleSpend = () => {
    if (!spendForm.amount || !spendForm.description) { toast.error("Amount and description are required"); return; }
    spendPettyCash({
      variables: {
        accountId: selectedAccountId,
        amount: spendForm.amount,
        description: spendForm.description,
        receiptNumber: spendForm.receiptNumber || undefined,
        category: spendForm.category || undefined,
        vendor: spendForm.vendor || undefined,
      },
    });
  };

  const handleReplenish = () => {
    if (!replenishForm.amount) { toast.error("Amount is required"); return; }
    replenishPettyCash({
      variables: {
        accountId: selectedAccountId,
        amount: replenishForm.amount,
        description: replenishForm.description || undefined,
        referenceNumber: replenishForm.referenceNumber || undefined,
      },
    });
  };

  const getBalancePercentage = (current: number, authorized: number) => {
    if (authorized <= 0) return 0;
    return Math.min(Math.max((current / authorized) * 100, 0), 100);
  };

  const getBalanceBarColor = (percentage: number) => {
    if (percentage > 60) return "bg-emerald-500";
    if (percentage > 30) return "bg-amber-500";
    return "bg-red-500";
  };

  if (accountsLoading) {
    return (
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="rounded-2xl bg-gradient-to-br from-primary via-primary to-primary-hover p-8">
          <div className="h-8 w-64 bg-white/20 rounded-lg animate-pulse" />
          <div className="h-4 w-96 bg-white/10 rounded-lg animate-pulse mt-3" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-6 animate-pulse">
              <div className="h-5 w-32 bg-muted rounded mb-3" />
              <div className="h-4 w-24 bg-muted rounded mb-2" />
              <div className="h-3 w-full bg-muted rounded mb-2" />
              <div className="h-4 w-20 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Page Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-primary via-primary to-primary-hover p-8 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-sm">
                <Wallet className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold">Petty Cash Management</h1>
            </div>
            <p className="text-primary-foreground/80 text-sm mt-1">
              Manage petty cash accounts, track expenditures, and handle replenishments
            </p>
          </div>
          <button
            onClick={() => setActiveModal("create")}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white rounded-xl font-medium text-sm transition-all border border-white/20"
          >
            <Plus className="w-4 h-4" /> Create Account
          </button>
        </div>

        {/* Summary Stats */}
        {accounts.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10">
              <p className="text-xs text-primary-foreground/70 font-medium">Total Accounts</p>
              <p className="text-xl font-bold mt-0.5">{accounts.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10">
              <p className="text-xs text-primary-foreground/70 font-medium">Active</p>
              <p className="text-xl font-bold mt-0.5">{accounts.filter((a) => a.isActive).length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10">
              <p className="text-xs text-primary-foreground/70 font-medium">Total Authorized</p>
              <p className="text-xl font-bold mt-0.5">{formatCurrency(accounts.reduce((sum, a) => sum + (a.authorizedAmount || 0), 0))}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10">
              <p className="text-xs text-primary-foreground/70 font-medium">Total Balance</p>
              <p className="text-xl font-bold mt-0.5">{formatCurrency(accounts.reduce((sum, a) => sum + (a.currentBalance || 0), 0))}</p>
            </div>
          </div>
        )}
      </div>

      {/* Account Cards Grid */}
      {accounts.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-16 text-center">
          <Wallet className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-1">No Petty Cash Accounts</h3>
          <p className="text-sm text-muted-foreground mb-4">Create your first petty cash account to get started</p>
          <button
            onClick={() => setActiveModal("create")}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg font-medium text-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Create Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => {
            const percentage = getBalancePercentage(account.currentBalance || 0, account.authorizedAmount || 0);
            const isExpanded = expandedAccountId === account.id;

            return (
              <div
                key={account.id}
                className={`bg-card rounded-xl border transition-all duration-200 ${
                  isExpanded ? "border-primary ring-2 ring-primary/10" : "border-border hover:border-primary/30 hover:shadow-md"
                }`}
              >
                {/* Card Header */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{account.accountName}</h3>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                        <User className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{account.custodian}</span>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                        account.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                          : "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
                      }`}
                    >
                      {account.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Branch */}
                  {account.branch?.branchName && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                      <Building2 className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{account.branch.branchName}</span>
                    </div>
                  )}

                  {/* Balance Info */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-muted-foreground font-medium">Current Balance</span>
                      <span className="text-lg font-bold text-foreground">
                        {formatCurrency(account.currentBalance || 0)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getBalanceBarColor(percentage)}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>0</span>
                      <span>Authorized: {formatCurrency(account.authorizedAmount || 0)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-5 pb-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => openOperationModal("fund", account.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 rounded-lg text-xs font-medium transition-all"
                  >
                    <ArrowDownToLine className="w-3 h-3" /> Fund
                  </button>
                  <button
                    onClick={() => openOperationModal("spend", account.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 rounded-lg text-xs font-medium transition-all"
                  >
                    <ArrowUpFromLine className="w-3 h-3" /> Spend
                  </button>
                  <button
                    onClick={() => openOperationModal("replenish", account.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 rounded-lg text-xs font-medium transition-all"
                  >
                    <RefreshCw className="w-3 h-3" /> Replenish
                  </button>
                </div>

                {/* Expand Toggle */}
                <button
                  onClick={() => handleExpandAccount(account.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 border-t border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                >
                  <Receipt className="w-3 h-3" />
                  {isExpanded ? "Hide Transactions" : "View Transactions"}
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Transactions Table */}
      {expandedAccountId && (
        <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
          <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Transactions - {accounts.find((a) => a.id === expandedAccountId)?.accountName}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Recent transactions for this account</p>
            </div>
            <button
              onClick={() => setExpandedAccountId(null)}
              className="p-1.5 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {txnLoading ? (
            <div className="p-8">
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <div className="h-4 w-20 bg-muted rounded" />
                    <div className="h-4 w-16 bg-muted rounded" />
                    <div className="h-4 flex-1 bg-muted rounded" />
                    <div className="h-4 w-24 bg-muted rounded" />
                  </div>
                ))}
              </div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Receipt className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm">No transactions recorded yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Reference</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Vendor</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Balance</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">By</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => {
                    const config = txnTypeConfig[txn.transactionType] || txnTypeConfig.FUND;
                    const TypeIcon = config.icon;

                    return (
                      <tr key={txn.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-3 text-sm text-muted-foreground whitespace-nowrap">
                          {txn.transactionDate ? formatDate(txn.transactionDate) : "-"}
                        </td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${config.bgColor} ${config.color} ${config.borderColor}`}>
                            <TypeIcon className="w-3 h-3" />
                            {config.label}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm max-w-xs truncate">{txn.description || "-"}</td>
                        <td className="px-6 py-3 text-sm font-mono text-muted-foreground">{txn.receiptNumber || "-"}</td>
                        <td className="px-6 py-3 text-sm text-muted-foreground">{txn.category || "-"}</td>
                        <td className="px-6 py-3 text-sm text-muted-foreground">{txn.processedBy || "-"}</td>
                        <td className="px-6 py-3 text-right font-mono text-sm font-medium whitespace-nowrap">
                          <span className={txn.transactionType === "SPEND" ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}>
                            {txn.transactionType === "SPEND" ? "-" : "+"}
                            {formatCurrency(txn.amount || 0)}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right font-mono text-sm text-muted-foreground whitespace-nowrap">
                          {txn.balanceAfter != null ? formatCurrency(txn.balanceAfter) : "-"}
                        </td>
                        <td className="px-6 py-3 text-sm text-muted-foreground">{txn.approvedBy || "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create Account Modal */}
      {activeModal === "create" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-card rounded-2xl shadow-2xl border border-border p-6 animate-modal-in max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Create Petty Cash Account</h2>
              </div>
              <button onClick={closeModal} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Account Name *</label>
                <input
                  type="text"
                  value={createForm.accountName}
                  onChange={(e) => setCreateForm({ ...createForm, accountName: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="e.g. Office Petty Cash"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Custodian Name *</label>
                <input
                  type="text"
                  value={createForm.custodian}
                  onChange={(e) => setCreateForm({ ...createForm, custodian: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="e.g. Jane Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Authorized Amount (TZS) *</label>
                <input
                  type="number"
                  value={createForm.authorizedAmount}
                  onChange={(e) => setCreateForm({ ...createForm, authorizedAmount: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="e.g. 500000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Branch</label>
                <select
                  value={createForm.branchId}
                  onChange={(e) => setCreateForm({ ...createForm, branchId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="">Select branch...</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.branchName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">GL Account</label>
                <select
                  value={createForm.glAccountId}
                  onChange={(e) => setCreateForm({ ...createForm, glAccountId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="">Select GL account...</option>
                  {glAccounts.map((gl) => (
                    <option key={gl.id} value={gl.id}>{gl.accountCode} - {gl.accountName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  placeholder="Optional description..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={closeModal} className="border border-border hover:bg-muted rounded-lg px-4 py-2.5 font-medium text-sm transition-all">
                Cancel
              </button>
              <button
                onClick={handleCreateAccount}
                disabled={creating}
                className="bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg px-4 py-2.5 font-medium text-sm transition-all disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fund Modal */}
      {activeModal === "fund" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-card rounded-2xl shadow-2xl border border-border p-6 animate-modal-in max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-500/10 rounded-xl">
                  <ArrowDownToLine className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Fund Petty Cash</h2>
                  <p className="text-xs text-muted-foreground">
                    {accounts.find((a) => a.id === selectedAccountId)?.accountName}
                  </p>
                </div>
              </div>
              <button onClick={closeModal} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Amount (TZS) *</label>
                <input
                  type="number"
                  value={fundForm.amount}
                  onChange={(e) => setFundForm({ ...fundForm, amount: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="e.g. 200000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Reference Number</label>
                <input
                  type="text"
                  value={fundForm.referenceNumber}
                  onChange={(e) => setFundForm({ ...fundForm, referenceNumber: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="e.g. CHQ-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                <textarea
                  value={fundForm.description}
                  onChange={(e) => setFundForm({ ...fundForm, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  placeholder="Optional description..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={closeModal} className="border border-border hover:bg-muted rounded-lg px-4 py-2.5 font-medium text-sm transition-all">
                Cancel
              </button>
              <button
                onClick={handleFund}
                disabled={funding}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2.5 font-medium text-sm transition-all disabled:opacity-50"
              >
                {funding ? "Processing..." : "Fund Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spend Modal */}
      {activeModal === "spend" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-card rounded-2xl shadow-2xl border border-border p-6 animate-modal-in max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-500/10 rounded-xl">
                  <ArrowUpFromLine className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Record Expenditure</h2>
                  <p className="text-xs text-muted-foreground">
                    {accounts.find((a) => a.id === selectedAccountId)?.accountName}
                  </p>
                </div>
              </div>
              <button onClick={closeModal} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Amount (TZS) *</label>
                <input
                  type="number"
                  value={spendForm.amount}
                  onChange={(e) => setSpendForm({ ...spendForm, amount: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="e.g. 15000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Description *</label>
                <textarea
                  value={spendForm.description}
                  onChange={(e) => setSpendForm({ ...spendForm, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  placeholder="e.g. Office supplies purchase"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Receipt Number</label>
                  <input
                    type="text"
                    value={spendForm.receiptNumber}
                    onChange={(e) => setSpendForm({ ...spendForm, receiptNumber: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="e.g. REC-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Category</label>
                  <select
                    value={spendForm.category}
                    onChange={(e) => setSpendForm({ ...spendForm, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="">Select...</option>
                    <option value="OFFICE_SUPPLIES">Office Supplies</option>
                    <option value="TRANSPORT">Transport</option>
                    <option value="REFRESHMENTS">Refreshments</option>
                    <option value="REPAIRS">Repairs</option>
                    <option value="POSTAGE">Postage</option>
                    <option value="CLEANING">Cleaning</option>
                    <option value="MISCELLANEOUS">Miscellaneous</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Vendor</label>
                <input
                  type="text"
                  value={spendForm.vendor}
                  onChange={(e) => setSpendForm({ ...spendForm, vendor: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="e.g. ABC Stationery Shop"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={closeModal} className="border border-border hover:bg-muted rounded-lg px-4 py-2.5 font-medium text-sm transition-all">
                Cancel
              </button>
              <button
                onClick={handleSpend}
                disabled={spending}
                className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2.5 font-medium text-sm transition-all disabled:opacity-50"
              >
                {spending ? "Recording..." : "Record Expenditure"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Replenish Modal */}
      {activeModal === "replenish" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-card rounded-2xl shadow-2xl border border-border p-6 animate-modal-in max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-500/10 rounded-xl">
                  <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Replenish Petty Cash</h2>
                  <p className="text-xs text-muted-foreground">
                    {accounts.find((a) => a.id === selectedAccountId)?.accountName}
                  </p>
                </div>
              </div>
              <button onClick={closeModal} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Current vs Authorized info */}
            {(() => {
              const acct = accounts.find((a) => a.id === selectedAccountId);
              if (!acct) return null;
              const deficit = (acct.authorizedAmount || 0) - (acct.currentBalance || 0);
              return (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-500/5 rounded-lg border border-blue-100 dark:border-blue-500/10">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current Balance:</span>
                    <span className="font-medium">{formatCurrency(acct.currentBalance || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Authorized Amount:</span>
                    <span className="font-medium">{formatCurrency(acct.authorizedAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1 pt-1 border-t border-blue-200 dark:border-blue-500/20">
                    <span className="text-blue-700 dark:text-blue-400 font-medium">Amount to Replenish:</span>
                    <span className="text-blue-700 dark:text-blue-400 font-bold">{formatCurrency(Math.max(deficit, 0))}</span>
                  </div>
                </div>
              );
            })()}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Amount (TZS) *</label>
                <input
                  type="number"
                  value={replenishForm.amount}
                  onChange={(e) => setReplenishForm({ ...replenishForm, amount: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="e.g. 300000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Reference Number</label>
                <input
                  type="text"
                  value={replenishForm.referenceNumber}
                  onChange={(e) => setReplenishForm({ ...replenishForm, referenceNumber: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="e.g. RPL-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                <textarea
                  value={replenishForm.description}
                  onChange={(e) => setReplenishForm({ ...replenishForm, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  placeholder="Optional description..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={closeModal} className="border border-border hover:bg-muted rounded-lg px-4 py-2.5 font-medium text-sm transition-all">
                Cancel
              </button>
              <button
                onClick={handleReplenish}
                disabled={replenishing}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2.5 font-medium text-sm transition-all disabled:opacity-50"
              >
                {replenishing ? "Processing..." : "Replenish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
