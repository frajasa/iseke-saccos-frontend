"use client";

import { useState, useEffect, useRef } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import {
  GET_CHECK_REGISTER,
  ISSUE_CHECK,
  CLEAR_CHECK,
  STOP_CHECK,
  VOID_CHECK,
  SEARCH_MEMBERS,
  GET_MEMBER_SAVINGS_ACCOUNTS,
} from "@/lib/graphql/queries";
import { formatCurrency } from "@/lib/utils";
import { isNullListError } from "@/lib/error-utils";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import {
  FileCheck,
  Plus,
  Ban,
  CheckCircle2,
  XCircle,
  Search,
  X,
  User,
  Wallet,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

interface Check {
  id: string;
  checkNumber: string;
  issuedDate: string;
  amount?: number;
  payee?: string;
  status: string;
  clearedDate?: string;
  stopDate?: string;
  stopReason?: string;
  createdBy?: string;
  createdAt?: string;
}

interface SavingsAccountOption {
  id: string;
  accountNumber: string;
  product: { id: string; productName: string; productType?: string };
  balance: number;
  status: string;
}

export default function CheckRegisterPage() {
  // Search state
  const [memberSearch, setMemberSearch] = useState("");
  const [showMemberResults, setShowMemberResults] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [selectedAccount, setSelectedAccount] = useState<SavingsAccountOption | null>(null);
  const [directAccountId, setDirectAccountId] = useState("");
  const [searchMode, setSearchMode] = useState<"member" | "direct">("member");
  const memberSearchRef = useRef<HTMLDivElement>(null);

  // Check management state
  const [showIssue, setShowIssue] = useState(false);
  const [showStop, setShowStop] = useState<string | null>(null);
  const [issueForm, setIssueForm] = useState({ checkNumber: "", amount: "", payee: "" });
  const [stopReason, setStopReason] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const debouncedSearch = useDebounce(memberSearch, 300);

  // Queries
  const [searchMembers, { data: membersData, loading: membersLoading }] = useLazyQuery(SEARCH_MEMBERS);
  const [fetchMemberAccounts, { data: accountsData, loading: accountsLoading }] = useLazyQuery(GET_MEMBER_SAVINGS_ACCOUNTS);
  const [fetchChecks, { data: checksData, loading: checksLoading, error: checksError }] = useLazyQuery(GET_CHECK_REGISTER, {
    fetchPolicy: "network-only",
  });

  // Mutations
  const [issueCheck, { loading: issuing }] = useMutation(ISSUE_CHECK, {
    onCompleted: () => {
      setShowIssue(false);
      setIssueForm({ checkNumber: "", amount: "", payee: "" });
      if (selectedAccount) fetchChecks({ variables: { accountId: selectedAccount.id } });
      toast.success("Check issued successfully");
    },
    onError: (err) => toast.error(err.message),
  });
  const [clearCheck] = useMutation(CLEAR_CHECK, {
    onCompleted: () => {
      if (selectedAccount) fetchChecks({ variables: { accountId: selectedAccount.id } });
      toast.success("Check cleared");
    },
    onError: (err) => toast.error(err.message),
  });
  const [stopCheck, { loading: stopping }] = useMutation(STOP_CHECK, {
    onCompleted: () => {
      setShowStop(null);
      setStopReason("");
      if (selectedAccount) fetchChecks({ variables: { accountId: selectedAccount.id } });
      toast.success("Check stopped");
    },
    onError: (err) => toast.error(err.message),
  });
  const [voidCheck] = useMutation(VOID_CHECK, {
    onCompleted: () => {
      if (selectedAccount) fetchChecks({ variables: { accountId: selectedAccount.id } });
      toast.success("Check voided");
    },
    onError: (err) => toast.error(err.message),
  });

  // Search members on debounce
  useEffect(() => {
    if (debouncedSearch.length >= 2) {
      searchMembers({ variables: { searchTerm: debouncedSearch, page: 0, size: 10 } });
      setShowMemberResults(true);
    } else {
      setShowMemberResults(false);
    }
  }, [debouncedSearch, searchMembers]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (memberSearchRef.current && !memberSearchRef.current.contains(e.target as Node)) {
        setShowMemberResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectMember = (member: any) => {
    setSelectedMember(member);
    setSelectedAccount(null);
    setShowMemberResults(false);
    setMemberSearch(`${member.firstName} ${member.lastName} (${member.memberNumber})`);
    fetchMemberAccounts({ variables: { memberId: member.id } });
  };

  const handleSelectAccount = (account: SavingsAccountOption) => {
    setSelectedAccount(account);
    fetchChecks({ variables: { accountId: account.id } });
  };

  const handleDirectSearch = () => {
    if (!directAccountId.trim()) return;
    setSelectedMember(null);
    setSelectedAccount({ id: directAccountId.trim(), accountNumber: directAccountId.trim(), product: { id: "", productName: "Direct Lookup" }, balance: 0, status: "ACTIVE" });
    fetchChecks({ variables: { accountId: directAccountId.trim() } });
  };

  const handleReset = () => {
    setSelectedMember(null);
    setSelectedAccount(null);
    setMemberSearch("");
    setDirectAccountId("");
    setFilterStatus("ALL");
  };

  const members = membersData?.searchMembers?.content || [];
  const accounts: SavingsAccountOption[] = accountsData?.memberSavingsAccounts || [];
  const allChecks: Check[] = checksData?.checkRegister || (checksError && isNullListError(checksError) ? [] : []);
  const checks = filterStatus === "ALL" ? allChecks : allChecks.filter((c) => c.status === filterStatus);

  const statusColor: Record<string, string> = {
    ISSUED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    CLEARED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    STOPPED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    VOIDED: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
    RETURNED: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  };

  // Summary counts
  const issuedCount = allChecks.filter((c) => c.status === "ISSUED").length;
  const clearedCount = allChecks.filter((c) => c.status === "CLEARED").length;
  const stoppedCount = allChecks.filter((c) => c.status === "STOPPED").length;
  const voidedCount = allChecks.filter((c) => c.status === "VOIDED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-primary" />
            Check Register
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage checks for checking/current accounts</p>
        </div>
        {selectedAccount && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted"
          >
            <X className="w-4 h-4" /> Clear Selection
          </button>
        )}
      </div>

      {/* Account Selection */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-3">Select Savings Account</h2>

        {/* Search Mode Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSearchMode("member")}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
              searchMode === "member"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="w-3.5 h-3.5 inline mr-1.5" />
            Search by Member
          </button>
          <button
            onClick={() => setSearchMode("direct")}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
              searchMode === "direct"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Wallet className="w-3.5 h-3.5 inline mr-1.5" />
            Enter Account ID
          </button>
        </div>

        {searchMode === "member" ? (
          <div className="space-y-4">
            {/* Member Search */}
            <div ref={memberSearchRef} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search member by name, number, or phone..."
                  value={memberSearch}
                  onChange={(e) => {
                    setMemberSearch(e.target.value);
                    if (selectedMember) {
                      setSelectedMember(null);
                      setSelectedAccount(null);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                {memberSearch && (
                  <button
                    onClick={() => { setMemberSearch(""); setSelectedMember(null); setSelectedAccount(null); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>

              {/* Member Dropdown */}
              {showMemberResults && (
                <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {membersLoading ? (
                    <div className="px-4 py-3 text-sm text-muted-foreground">Searching...</div>
                  ) : members.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-muted-foreground">No members found</div>
                  ) : (
                    members.map((m: any) => (
                      <button
                        key={m.id}
                        onClick={() => handleSelectMember(m)}
                        className="w-full px-4 py-2.5 text-left hover:bg-muted flex items-center gap-3 border-b border-border last:border-0"
                      >
                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-xs font-semibold shrink-0">
                          {m.firstName?.[0]}{m.lastName?.[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {m.firstName} {m.middleName ? m.middleName + " " : ""}{m.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {m.memberNumber} {m.phoneNumber ? `| ${m.phoneNumber}` : ""}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Selected Member Info */}
            {selectedMember && (
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm font-medium text-foreground">
                  {selectedMember.firstName} {selectedMember.lastName}
                  <span className="text-muted-foreground ml-2">({selectedMember.memberNumber})</span>
                </p>
              </div>
            )}

            {/* Account Selection */}
            {selectedMember && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Select Account</label>
                {accountsLoading ? (
                  <div className="text-sm text-muted-foreground py-2">Loading accounts...</div>
                ) : accounts.length === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                    <AlertCircle className="w-4 h-4" /> No savings accounts found for this member
                  </div>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {accounts.map((acc) => (
                      <button
                        key={acc.id}
                        onClick={() => handleSelectAccount(acc)}
                        className={`text-left p-3 rounded-lg border transition-colors ${
                          selectedAccount?.id === acc.id
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        }`}
                      >
                        <p className="text-sm font-mono font-medium text-foreground">{acc.accountNumber}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{acc.product.productName}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-xs font-medium text-foreground">{formatCurrency(acc.balance)}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            acc.status === "ACTIVE"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400"
                          }`}>
                            {acc.status}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Direct Account ID Search */
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Paste Savings Account ID (UUID)..."
              value={directAccountId}
              onChange={(e) => setDirectAccountId(e.target.value)}
              className="flex-1 px-3 py-2.5 bg-background border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <button
              onClick={handleDirectSearch}
              disabled={!directAccountId.trim()}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 text-sm font-medium"
            >
              <Search className="w-4 h-4" /> Load Checks
            </button>
          </div>
        )}
      </div>

      {/* Check Register Content */}
      {selectedAccount && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{issuedCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Issued</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{clearedCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Cleared</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{stoppedCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Stopped</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-gray-500">{voidedCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Voided</p>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-muted-foreground">Filter:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 bg-background border border-border rounded-lg text-sm"
              >
                <option value="ALL">All ({allChecks.length})</option>
                <option value="ISSUED">Issued ({issuedCount})</option>
                <option value="CLEARED">Cleared ({clearedCount})</option>
                <option value="STOPPED">Stopped ({stoppedCount})</option>
                <option value="VOIDED">Voided ({voidedCount})</option>
                <option value="RETURNED">Returned</option>
              </select>
            </div>
            <button
              onClick={() => setShowIssue(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> Issue Check
            </button>
          </div>

          {/* Error */}
          {checksError && !isNullListError(checksError) && <ErrorDisplay error={checksError} />}

          {/* Checks Table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 font-semibold">Check #</th>
                    <th className="text-left px-4 py-3 font-semibold">Issued Date</th>
                    <th className="text-left px-4 py-3 font-semibold">Payee</th>
                    <th className="text-right px-4 py-3 font-semibold">Amount</th>
                    <th className="text-left px-4 py-3 font-semibold">Status</th>
                    <th className="text-left px-4 py-3 font-semibold">Cleared Date</th>
                    <th className="text-left px-4 py-3 font-semibold">Stop Reason</th>
                    <th className="text-right px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {checksLoading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-muted-foreground">
                        Loading checks...
                      </td>
                    </tr>
                  ) : checks.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-muted-foreground">
                        {allChecks.length > 0 ? "No checks match the selected filter" : "No checks found for this account"}
                      </td>
                    </tr>
                  ) : (
                    checks.map((c) => (
                      <tr key={c.id} className="border-b border-border hover:bg-muted/30">
                        <td className="px-4 py-3 font-mono font-medium">{c.checkNumber}</td>
                        <td className="px-4 py-3">
                          {c.issuedDate ? new Date(c.issuedDate).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-4 py-3">{c.payee || "-"}</td>
                        <td className="px-4 py-3 text-right font-medium">
                          {c.amount ? formatCurrency(c.amount) : "-"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[c.status] || ""}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {c.clearedDate ? new Date(c.clearedDate).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-4 py-3 text-xs max-w-[200px] truncate" title={c.stopReason || ""}>
                          {c.stopReason || "-"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {c.status === "ISSUED" && (
                              <>
                                <button
                                  onClick={() => clearCheck({ variables: { checkId: c.id } })}
                                  title="Clear Check"
                                  className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setShowStop(c.id)}
                                  title="Stop Check"
                                  className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600"
                                >
                                  <Ban className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm("Are you sure you want to void this check?")) {
                                      voidCheck({ variables: { checkId: c.id } });
                                    }
                                  }}
                                  title="Void Check"
                                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900/30 text-gray-600"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {c.status === "STOPPED" && (
                              <button
                                onClick={() => {
                                  if (confirm("Are you sure you want to void this stopped check?")) {
                                    voidCheck({ variables: { checkId: c.id } });
                                  }
                                }}
                                title="Void Check"
                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900/30 text-gray-600"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Issue Check Modal */}
      {showIssue && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Issue New Check</h2>
              <button onClick={() => setShowIssue(false)} className="p-1 hover:bg-muted rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Check Number *</label>
                <input
                  type="text"
                  value={issueForm.checkNumber}
                  onChange={(e) => setIssueForm({ ...issueForm, checkNumber: e.target.value })}
                  placeholder="e.g. 001234"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payee</label>
                <input
                  type="text"
                  value={issueForm.payee}
                  onChange={(e) => setIssueForm({ ...issueForm, payee: e.target.value })}
                  placeholder="Payee name"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount (TZS)</label>
                <input
                  type="number"
                  value={issueForm.amount}
                  onChange={(e) => setIssueForm({ ...issueForm, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowIssue(false)}
                className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  issueCheck({
                    variables: {
                      accountId: selectedAccount!.id,
                      checkNumber: issueForm.checkNumber,
                      amount: issueForm.amount ? parseFloat(issueForm.amount) : undefined,
                      payee: issueForm.payee || undefined,
                    },
                  })
                }
                disabled={!issueForm.checkNumber || issuing}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 font-medium"
              >
                {issuing ? "Issuing..." : "Issue Check"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stop Check Modal */}
      {showStop && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-red-600">Stop Payment</h2>
              <button onClick={() => setShowStop(null)} className="p-1 hover:bg-muted rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Reason for stopping *</label>
              <textarea
                value={stopReason}
                onChange={(e) => setStopReason(e.target.value)}
                rows={3}
                placeholder="Enter reason for stop payment..."
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowStop(null)}
                className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => stopCheck({ variables: { checkId: showStop, reason: stopReason } })}
                disabled={!stopReason || stopping}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
              >
                {stopping ? "Stopping..." : "Stop Check"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
