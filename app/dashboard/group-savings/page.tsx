"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useLazyQuery, useMutation } from "@apollo/client";
import {
  GET_GROUP_SAVINGS_ACCOUNTS,
  GET_GROUP_SAVINGS_ACCOUNT,
  CREATE_GROUP_SAVINGS_ACCOUNT,
  ADD_MEMBER_TO_GROUP,
  REMOVE_MEMBER_FROM_GROUP,
  DEPOSIT_TO_GROUP_ACCOUNT,
  WITHDRAW_FROM_GROUP_ACCOUNT,
  CALCULATE_GROUP_INSURANCE_FEES,
  GET_SAVINGS_PRODUCTS,
  GET_BRANCHES,
  SEARCH_MEMBERS,
} from "@/lib/graphql/queries";
import { formatCurrency, formatDate } from "@/lib/utils";
import { isNullListError } from "@/lib/error-utils";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import { toast } from "sonner";
import {
  Plus,
  Users,
  ArrowDownToLine,
  ArrowUpFromLine,
  ShieldCheck,
  UserPlus,
  UserMinus,
  X,
  ChevronLeft,
} from "lucide-react";

interface GroupMember {
  id: string;
  member: { id: string; fullName: string; memberNumber: string };
  sharePercentage: number;
  isActive: boolean;
  joinDate: string;
}

interface GroupSavingsAccount {
  id: string;
  accountNumber: string;
  groupName: string;
  accountType: string;
  balance: number;
  insuranceFeeBalance: number;
  status: string;
  description: string;
  members: GroupMember[];
  product: { id: string; productName: string };
  branch: { id: string; branchName: string };
  createdAt: string;
}

export default function GroupSavingsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState<"deposit" | "withdraw" | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const [newGroup, setNewGroup] = useState({
    groupName: "",
    productId: "",
    branchId: "",
    accountType: "ON_BOOK",
    description: "",
  });
  const [newMember, setNewMember] = useState({ memberId: "", sharePercentage: 0 });
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<{ id: string; memberNumber: string; fullName: string } | null>(null);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const memberSearchRef = useRef<HTMLDivElement>(null);
  const [txn, setTxn] = useState({ amount: "", paymentMethod: "CASH" });

  // Queries
  const { data, loading, error, refetch } = useQuery(GET_GROUP_SAVINGS_ACCOUNTS);
  const [fetchDetail, { data: detailData, loading: detailLoading }] = useLazyQuery(GET_GROUP_SAVINGS_ACCOUNT, {
    fetchPolicy: "network-only",
  });
  const { data: productsData } = useQuery(GET_SAVINGS_PRODUCTS);
  const { data: branchesData } = useQuery(GET_BRANCHES);

  // Mutations
  const [createGroup] = useMutation(CREATE_GROUP_SAVINGS_ACCOUNT, {
    onCompleted: () => {
      toast.success("Group savings account created");
      refetch();
      setShowCreateModal(false);
      setNewGroup({ groupName: "", productId: "", branchId: "", accountType: "ON_BOOK", description: "" });
    },
    onError: (err) => toast.error(err.message),
  });

  const [searchMembers, { data: memberResults, loading: memberSearchLoading }] = useLazyQuery(SEARCH_MEMBERS);

  // Debounced member search
  useEffect(() => {
    if (memberSearch.length < 2) return;
    const timer = setTimeout(() => {
      searchMembers({ variables: { searchTerm: memberSearch, page: 0, size: 8 } });
      setShowMemberDropdown(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [memberSearch, searchMembers]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (memberSearchRef.current && !memberSearchRef.current.contains(e.target as Node)) {
        setShowMemberDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const [addMember] = useMutation(ADD_MEMBER_TO_GROUP, {
    onCompleted: () => {
      toast.success("Member added to group");
      if (selectedGroupId) fetchDetail({ variables: { id: selectedGroupId } });
      refetch();
      setShowAddMemberModal(false);
      setNewMember({ memberId: "", sharePercentage: 0 });
      setSelectedMember(null);
      setMemberSearch("");
    },
    onError: (err) => toast.error(err.message),
  });

  const [removeMember] = useMutation(REMOVE_MEMBER_FROM_GROUP, {
    onCompleted: () => {
      toast.success("Member removed from group");
      if (selectedGroupId) fetchDetail({ variables: { id: selectedGroupId } });
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const [depositToGroup] = useMutation(DEPOSIT_TO_GROUP_ACCOUNT, {
    onCompleted: () => {
      toast.success("Deposit successful");
      if (selectedGroupId) fetchDetail({ variables: { id: selectedGroupId } });
      refetch();
      setShowTransactionModal(null);
      setTxn({ amount: "", paymentMethod: "CASH" });
    },
    onError: (err) => toast.error(err.message),
  });

  const [withdrawFromGroup] = useMutation(WITHDRAW_FROM_GROUP_ACCOUNT, {
    onCompleted: () => {
      toast.success("Withdrawal successful");
      if (selectedGroupId) fetchDetail({ variables: { id: selectedGroupId } });
      refetch();
      setShowTransactionModal(null);
      setTxn({ amount: "", paymentMethod: "CASH" });
    },
    onError: (err) => toast.error(err.message),
  });

  const [calculateInsurance, { loading: calcLoading }] = useMutation(CALCULATE_GROUP_INSURANCE_FEES, {
    onCompleted: () => {
      toast.success("Insurance fees calculated");
      if (selectedGroupId) fetchDetail({ variables: { id: selectedGroupId } });
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const accounts: GroupSavingsAccount[] = data?.groupSavingsAccounts || [];
  const detail: GroupSavingsAccount | null = detailData?.groupSavingsAccount || null;
  const products = productsData?.activeSavingsProducts || [];
  const branches = branchesData?.branches || [];

  const openDetail = (id: string) => {
    setSelectedGroupId(id);
    fetchDetail({ variables: { id } });
  };

  const closeDetail = () => {
    setSelectedGroupId(null);
  };

  const handleCreate = () => {
    if (!newGroup.groupName || !newGroup.productId || !newGroup.branchId) {
      toast.error("Please fill all required fields");
      return;
    }
    createGroup({ variables: newGroup });
  };

  const handleAddMember = () => {
    if (!newMember.memberId || !newMember.sharePercentage) {
      toast.error("Please fill all fields");
      return;
    }
    addMember({
      variables: {
        groupId: selectedGroupId,
        memberId: newMember.memberId,
        sharePercentage: newMember.sharePercentage,
      },
    });
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    if (!confirm(`Remove ${memberName} from this group?`)) return;
    removeMember({ variables: { groupId: selectedGroupId, memberId } });
  };

  const handleTransaction = () => {
    if (!txn.amount || Number(txn.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    const variables = {
      groupId: selectedGroupId,
      amount: txn.amount,
      paymentMethod: txn.paymentMethod,
    };
    if (showTransactionModal === "deposit") {
      depositToGroup({ variables });
    } else {
      withdrawFromGroup({ variables });
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse text-muted-foreground">Loading group savings accounts...</div>
      </div>
    );
  }

  if (error && !isNullListError(error)) {
    return <ErrorDisplay error={error} onRetry={() => refetch()} variant="card" />;
  }

  // Detail view
  if (selectedGroupId && detail) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={closeDetail} className="p-2 rounded-lg border border-border hover:bg-muted">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{detail.groupName}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {detail.accountNumber} &middot; {detail.accountType} &middot; {detail.product?.productName}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => calculateInsurance({ variables: { groupId: selectedGroupId } })}
              disabled={calcLoading}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium"
            >
              <ShieldCheck className="w-4 h-4" /> {calcLoading ? "Calculating..." : "Calculate Insurance Fees"}
            </button>
            <button
              onClick={() => setShowTransactionModal("deposit")}
              className="flex items-center gap-2 px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 text-sm font-medium"
            >
              <ArrowDownToLine className="w-4 h-4" /> Deposit
            </button>
            <button
              onClick={() => setShowTransactionModal("withdraw")}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
            >
              <ArrowUpFromLine className="w-4 h-4" /> Withdraw
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground font-medium">Balance</p>
            <p className="text-xl font-bold text-foreground mt-1">{formatCurrency(detail.balance)}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground font-medium">Insurance Fee Balance</p>
            <p className="text-xl font-bold text-foreground mt-1">{formatCurrency(detail.insuranceFeeBalance)}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground font-medium">Members</p>
            <p className="text-xl font-bold text-foreground mt-1">{detail.members?.length || 0}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground font-medium">Status</p>
            <span
              className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
                detail.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {detail.status}
            </span>
          </div>
        </div>

        {detail.description && (
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground font-medium mb-1">Description</p>
            <p className="text-sm text-foreground">{detail.description}</p>
          </div>
        )}

        {/* Members Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold">Group Members</h2>
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium"
            >
              <UserPlus className="w-4 h-4" /> Add Member
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Member No.</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Share %</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Joined</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(detail.members || []).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      No members in this group yet.
                    </td>
                  </tr>
                ) : (
                  detail.members.map((m) => (
                    <tr key={m.id} className="border-b border-border hover:bg-muted/30">
                      <td className="px-6 py-3 font-medium">{m.member?.fullName || "-"}</td>
                      <td className="px-6 py-3 font-mono text-sm">{m.member?.memberNumber || "-"}</td>
                      <td className="px-6 py-3">{m.sharePercentage}%</td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            m.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}
                        >
                          {m.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm">{formatDate(m.joinDate)}</td>
                      <td className="px-6 py-3">
                        <button
                          onClick={() => handleRemoveMember(m.member?.id || m.id, m.member?.fullName || "this member")}
                          className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <UserMinus className="w-3 h-3" /> Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Member Modal */}
        {showAddMemberModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => { setShowAddMemberModal(false); setSelectedMember(null); setMemberSearch(""); }}>
            <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-semibold mb-4">Add Member to Group</h2>
              <div className="space-y-3">
                <div ref={memberSearchRef} className="relative">
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Search Member</label>
                  {selectedMember ? (
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-primary bg-primary/5">
                      <div>
                        <span className="text-sm font-medium">{selectedMember.fullName}</span>
                        <span className="text-xs text-muted-foreground ml-2">#{selectedMember.memberNumber}</span>
                      </div>
                      <button
                        onClick={() => { setSelectedMember(null); setNewMember({ ...newMember, memberId: "" }); setMemberSearch(""); }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                        onFocus={() => memberSearch.length >= 2 && setShowMemberDropdown(true)}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                        placeholder="Type name, member number, or phone..."
                      />
                      {memberSearchLoading && (
                        <div className="absolute right-3 top-8 text-xs text-muted-foreground">Searching...</div>
                      )}
                      {showMemberDropdown && memberResults?.searchMembers?.content?.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {memberResults.searchMembers.content.map((m: { id: string; memberNumber: string; firstName: string; lastName: string; phoneNumber?: string }) => (
                            <button
                              key={m.id}
                              onClick={() => {
                                const fullName = `${m.firstName} ${m.lastName}`;
                                setSelectedMember({ id: m.id, memberNumber: m.memberNumber, fullName });
                                setNewMember({ ...newMember, memberId: m.id });
                                setShowMemberDropdown(false);
                                setMemberSearch("");
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-muted/50 border-b border-border last:border-0"
                            >
                              <div className="text-sm font-medium">{m.firstName} {m.lastName}</div>
                              <div className="text-xs text-muted-foreground">#{m.memberNumber}{m.phoneNumber ? ` · ${m.phoneNumber}` : ""}</div>
                            </button>
                          ))}
                        </div>
                      )}
                      {showMemberDropdown && memberSearch.length >= 2 && !memberSearchLoading && memberResults?.searchMembers?.content?.length === 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-card border border-border rounded-lg shadow-lg p-3 text-sm text-muted-foreground text-center">
                          No members found
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Share Percentage</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    value={newMember.sharePercentage || ""}
                    onChange={(e) => setNewMember({ ...newMember, sharePercentage: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                    placeholder="e.g. 25"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => { setShowAddMemberModal(false); setSelectedMember(null); setMemberSearch(""); }} className="px-4 py-2 border border-border rounded-lg text-sm">
                  Cancel
                </button>
                <button
                  onClick={handleAddMember}
                  disabled={!selectedMember}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  Add Member
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Deposit / Withdraw Modal */}
        {showTransactionModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowTransactionModal(null)}>
            <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-semibold mb-4">
                {showTransactionModal === "deposit" ? "Deposit to Group" : "Withdraw from Group"}
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Amount (TZS)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={txn.amount}
                    onChange={(e) => setTxn({ ...txn, amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Payment Method</label>
                  <select
                    value={txn.paymentMethod}
                    onChange={(e) => setTxn({ ...txn, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                  >
                    <option value="CASH">Cash</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="MOBILE_MONEY">Mobile Money</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setShowTransactionModal(null)} className="px-4 py-2 border border-border rounded-lg text-sm">
                  Cancel
                </button>
                <button
                  onClick={handleTransaction}
                  className={`px-4 py-2 text-white rounded-lg text-sm font-medium ${
                    showTransactionModal === "deposit" ? "bg-success hover:bg-success/90" : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {showTransactionModal === "deposit" ? "Deposit" : "Withdraw"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Detail loading state
  if (selectedGroupId && detailLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse text-muted-foreground">Loading group details...</div>
      </div>
    );
  }

  // List view
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Group Savings Accounts</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage group savings accounts and members</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Create Group
        </button>
      </div>

      {/* Groups Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">All Groups</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Account No.</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Group Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Type</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Balance</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Insurance Fee</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Members</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                    No group savings accounts found.
                  </td>
                </tr>
              ) : (
                accounts.map((a) => (
                  <tr key={a.id} className="border-b border-border hover:bg-muted/30 cursor-pointer" onClick={() => openDetail(a.id)}>
                    <td className="px-6 py-3 font-mono text-sm">{a.accountNumber}</td>
                    <td className="px-6 py-3 font-medium">{a.groupName}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        a.accountType === "ON_BOOK" ? "bg-primary/10 text-primary" : "bg-amber-100 text-amber-700"
                      }`}>
                        {a.accountType}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-semibold">{formatCurrency(a.balance)}</td>
                    <td className="px-6 py-3">{formatCurrency(a.insuranceFeeBalance)}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        a.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="flex items-center gap-1 text-sm">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" /> {a.members?.length || 0}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); openDetail(a.id); }}
                        className="text-xs px-2 py-1 rounded border border-border hover:bg-muted text-primary"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowCreateModal(false)}>
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Create Group Savings Account</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Group Name *</label>
                <input
                  type="text"
                  value={newGroup.groupName}
                  onChange={(e) => setNewGroup({ ...newGroup, groupName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                  placeholder="e.g. Wanawake Savings Group"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Savings Product *</label>
                <select
                  value={newGroup.productId}
                  onChange={(e) => setNewGroup({ ...newGroup, productId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                >
                  <option value="">Select product...</option>
                  {products.map((p: { id: string; productName: string; productCode: string }) => (
                    <option key={p.id} value={p.id}>
                      {p.productCode} - {p.productName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Branch *</label>
                <select
                  value={newGroup.branchId}
                  onChange={(e) => setNewGroup({ ...newGroup, branchId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                >
                  <option value="">Select branch...</option>
                  {branches.map((b: { id: string; branchName: string; branchCode: string }) => (
                    <option key={b.id} value={b.id}>
                      {b.branchCode} - {b.branchName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Account Type *</label>
                <select
                  value={newGroup.accountType}
                  onChange={(e) => setNewGroup({ ...newGroup, accountType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                >
                  <option value="ON_BOOK">ON_BOOK</option>
                  <option value="OFF_BOOK">OFF_BOOK</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                  rows={3}
                  placeholder="Optional description..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 border border-border rounded-lg text-sm">
                Cancel
              </button>
              <button onClick={handleCreate} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium">
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
