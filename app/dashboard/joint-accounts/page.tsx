"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation, useLazyQuery, useQuery } from "@apollo/client";
import {
  GET_JOINT_HOLDERS, ADD_JOINT_HOLDER, REMOVE_JOINT_HOLDER,
  SEARCH_MEMBERS, GET_SAVINGS_ACCOUNT_BY_NUMBER, GET_MEMBER_SAVINGS_ACCOUNTS,
} from "@/lib/graphql/queries";
import { JointAccountHolder } from "@/lib/types";
import { formatDate, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Search, Plus, Trash2, X, UserPlus, CreditCard, User } from "lucide-react";

export default function JointAccountsPage() {
  const [accountId, setAccountId] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [accountInfo, setAccountInfo] = useState<{id: string; accountNumber: string; balance: number; status: string; member: {id: string; firstName: string; lastName: string; memberNumber: string}; product: {id: string; productName: string}} | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ memberId: "", relationship: "", canTransact: true, canClose: false });

  // Member search for add holder modal
  const [memberSearch, setMemberSearch] = useState("");
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [selectedMember, setSelectedMember] = useState<{id: string; memberNumber: string; fullName: string} | null>(null);
  const memberDropdownRef = useRef<HTMLDivElement>(null);

  // Account search - dropdown approach
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [searchMode, setSearchMode] = useState<"account" | "member">("account");
  const [memberSearchForAccount, setMemberSearchForAccount] = useState("");
  const [selectedMemberForAccount, setSelectedMemberForAccount] = useState<{id: string; memberNumber: string; fullName: string} | null>(null);
  const accountDropdownRef = useRef<HTMLDivElement>(null);

  // Queries
  const [fetchAccountByNumber, { loading: accountLoading }] = useLazyQuery(GET_SAVINGS_ACCOUNT_BY_NUMBER, {
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      if (data?.savingsAccountByNumber) {
        const acc = data.savingsAccountByNumber;
        setAccountInfo(acc);
        setAccountId(acc.id);
        fetchHolders({ variables: { accountId: acc.id } });
      } else {
        toast.error("Account not found");
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const [fetchMemberAccounts, { data: memberAccountsData, loading: memberAccountsLoading }] = useLazyQuery(GET_MEMBER_SAVINGS_ACCOUNTS, {
    fetchPolicy: "network-only",
  });

  const [searchMembers, { data: membersData, loading: membersLoading }] = useLazyQuery(SEARCH_MEMBERS, {
    fetchPolicy: "network-only",
  });

  const [searchMembersForHolder, { data: holderMembersData, loading: holderMembersLoading }] = useLazyQuery(SEARCH_MEMBERS, {
    fetchPolicy: "network-only",
  });

  const [fetchHolders, { data: holdersData, loading: holdersLoading, refetch }] = useLazyQuery(GET_JOINT_HOLDERS, {
    fetchPolicy: "network-only",
    onError: (err) => toast.error(err.message),
  });

  const [addHolder] = useMutation(ADD_JOINT_HOLDER, {
    onCompleted: () => { toast.success("Joint holder added"); refetch?.(); setShowAdd(false); setForm({ memberId: "", relationship: "", canTransact: true, canClose: false }); setSelectedMember(null); setMemberSearch(""); },
    onError: (err) => toast.error(err.message),
  });

  const [removeHolder] = useMutation(REMOVE_JOINT_HOLDER, {
    onCompleted: () => { toast.success("Joint holder removed"); refetch?.(); },
    onError: (err) => toast.error(err.message),
  });

  const holders: JointAccountHolder[] = holdersData?.jointAccountHolders || [];
  const memberAccounts = memberAccountsData?.memberSavingsAccounts || [];
  const searchedMembers = membersData?.searchMembers?.content || [];
  const searchedHolderMembers = holderMembersData?.searchMembers?.content || [];

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(e.target as Node)) setShowAccountDropdown(false);
      if (memberDropdownRef.current && !memberDropdownRef.current.contains(e.target as Node)) setShowMemberDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Search account by number
  const handleAccountSearch = () => {
    if (!searchInput.trim()) { toast.error("Enter an account number"); return; }
    fetchAccountByNumber({ variables: { accountNumber: searchInput.trim() } });
  };

  // Search members for account lookup
  const handleMemberSearchForAccount = (term: string) => {
    setMemberSearchForAccount(term);
    if (term.length >= 2) {
      searchMembers({ variables: { searchTerm: term, page: 0, size: 10 } });
      setShowAccountDropdown(true);
    } else {
      setShowAccountDropdown(false);
    }
  };

  // Select member to show their accounts
  const selectMemberForAccount = (member: { id: string; memberNumber: string; fullName: string }) => {
    setSelectedMemberForAccount(member);
    setMemberSearchForAccount(member.fullName + " (" + member.memberNumber + ")");
    setShowAccountDropdown(false);
    fetchMemberAccounts({ variables: { memberId: member.id } });
  };

  // Select an account from the member's accounts list
  const selectAccount = (acc: { id: string; accountNumber: string; balance: number; status: string; product: { id: string; productName: string } }) => {
    setAccountInfo({ ...acc, member: { id: selectedMemberForAccount!.id, firstName: selectedMemberForAccount!.fullName.split(" ")[0], lastName: selectedMemberForAccount!.fullName.split(" ").slice(1).join(" "), memberNumber: selectedMemberForAccount!.memberNumber } } as typeof accountInfo);
    setAccountId(acc.id);
    fetchHolders({ variables: { accountId: acc.id } });
  };

  // Search members for add holder
  const handleMemberSearchForHolder = (term: string) => {
    setMemberSearch(term);
    if (term.length >= 2) {
      searchMembersForHolder({ variables: { searchTerm: term, page: 0, size: 10 } });
      setShowMemberDropdown(true);
    } else {
      setShowMemberDropdown(false);
    }
  };

  const clearSelection = () => {
    setAccountId("");
    setAccountInfo(null);
    setSearchInput("");
    setSelectedMemberForAccount(null);
    setMemberSearchForAccount("");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Joint Account Holders</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage joint holders on savings accounts</p>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold mb-4">Find Savings Account</h2>

        {/* Search Mode Toggle */}
        <div className="flex gap-2 mb-4">
          <button onClick={() => setSearchMode("account")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${searchMode === "account" ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            <CreditCard className="w-4 h-4" /> By Account Number
          </button>
          <button onClick={() => setSearchMode("member")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${searchMode === "member" ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            <User className="w-4 h-4" /> By Member
          </button>
        </div>

        {searchMode === "account" ? (
          /* Search by Account Number */
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Account Number</label>
              <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAccountSearch()}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                placeholder="e.g. SAV-000001" />
            </div>
            <button onClick={handleAccountSearch} disabled={accountLoading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium disabled:opacity-50">
              <Search className="w-4 h-4" /> {accountLoading ? "Searching..." : "Search"}
            </button>
          </div>
        ) : (
          /* Search by Member */
          <div className="space-y-4">
            <div className="relative" ref={accountDropdownRef}>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Search Member (by name, number, or phone)</label>
              <input type="text" value={memberSearchForAccount}
                onChange={(e) => handleMemberSearchForAccount(e.target.value)}
                onFocus={() => { if (searchedMembers.length > 0) setShowAccountDropdown(true); }}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                placeholder="Type member name, number or phone..." />
              {membersLoading && <div className="absolute right-3 top-8 text-xs text-muted-foreground">Searching...</div>}

              {/* Members Dropdown */}
              {showAccountDropdown && searchedMembers.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {searchedMembers.map((m: { id: string; memberNumber: string; fullName: string; phoneNumber?: string; status: string }) => (
                    <button key={m.id} onClick={() => selectMemberForAccount(m)}
                      className="w-full text-left px-4 py-3 hover:bg-muted/50 border-b border-border last:border-0 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{m.fullName}</p>
                        <p className="text-xs text-muted-foreground">{m.memberNumber} {m.phoneNumber ? `• ${m.phoneNumber}` : ""}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${m.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        {m.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Member's Accounts List */}
            {selectedMemberForAccount && (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2">
                  Select Account for {selectedMemberForAccount.fullName}
                </label>
                {memberAccountsLoading ? (
                  <div className="text-sm text-muted-foreground animate-pulse">Loading accounts...</div>
                ) : memberAccounts.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No savings accounts found for this member</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {memberAccounts.map((acc: { id: string; accountNumber: string; balance: number; status: string; product: { id: string; productName: string }; openingDate: string }) => (
                      <button key={acc.id} onClick={() => selectAccount(acc)}
                        className={`text-left p-4 rounded-lg border transition-colors ${accountId === acc.id ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:border-primary/50 hover:bg-muted/30"}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-sm font-semibold">{acc.accountNumber}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${acc.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                            {acc.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{acc.product?.productName}</p>
                        <p className="text-sm font-semibold mt-1">{formatCurrency(acc.balance)}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Account Info & Holders */}
      {accountId && accountInfo && (
        <>
          {/* Account Details Card */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Account Details</h2>
              <button onClick={clearSelection} className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1">
                <X className="w-4 h-4" /> Clear
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Account Number</p>
                <p className="font-mono font-semibold">{accountInfo.accountNumber}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Account Holder</p>
                <p className="font-medium">{accountInfo.member?.firstName} {accountInfo.member?.lastName}</p>
                <p className="text-xs text-muted-foreground">{accountInfo.member?.memberNumber}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Product</p>
                <p className="text-sm">{accountInfo.product?.productName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Balance</p>
                <p className="font-semibold text-success">{formatCurrency(accountInfo.balance)}</p>
              </div>
            </div>
          </div>

          {/* Joint Holders Table */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h2 className="text-lg font-semibold">Joint Holders ({holders.length})</h2>
              <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90">
                <UserPlus className="w-4 h-4" /> Add Joint Holder
              </button>
            </div>
            <table className="w-full">
              <thead><tr className="border-b border-border bg-muted/50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Member #</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Relationship</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Can Transact</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Can Close</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Added</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
              </tr></thead>
              <tbody>
                {holders.map((h) => (
                  <tr key={h.id} className="border-b border-border hover:bg-muted/30">
                    <td className="px-6 py-3 font-mono text-sm">{h.member.memberNumber}</td>
                    <td className="px-6 py-3 font-medium">{h.member.fullName}</td>
                    <td className="px-6 py-3 text-sm">{h.relationship}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${h.canTransact ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {h.canTransact ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${h.canClose ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {h.canClose ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">{formatDate(h.addedDate)}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${h.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {h.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      {h.isActive && (
                        <button onClick={() => { if (confirm("Remove this joint holder?")) removeHolder({ variables: { holderId: h.id } }); }}
                          className="text-xs px-2 py-1 rounded border border-border hover:bg-red-50 text-red-500" title="Remove">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {!holdersLoading && holders.length === 0 && (
                  <tr><td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">No joint holders on this account</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Add Joint Holder Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowAdd(false)}>
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Add Joint Holder</h2>
              <button onClick={() => setShowAdd(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              {/* Member Search */}
              <div className="relative" ref={memberDropdownRef}>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Search Member *</label>
                {selectedMember ? (
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-primary bg-primary/5">
                    <div>
                      <p className="text-sm font-medium">{selectedMember.fullName}</p>
                      <p className="text-xs text-muted-foreground">{selectedMember.memberNumber}</p>
                    </div>
                    <button onClick={() => { setSelectedMember(null); setForm({ ...form, memberId: "" }); setMemberSearch(""); }}
                      className="text-muted-foreground hover:text-foreground">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <input type="text" value={memberSearch}
                      onChange={(e) => handleMemberSearchForHolder(e.target.value)}
                      onFocus={() => { if (searchedHolderMembers.length > 0) setShowMemberDropdown(true); }}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                      placeholder="Type member name, number or phone..." />
                    {holderMembersLoading && <div className="absolute right-3 top-8 text-xs text-muted-foreground">Searching...</div>}

                    {showMemberDropdown && searchedHolderMembers.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {searchedHolderMembers.map((m: { id: string; memberNumber: string; fullName: string; phoneNumber?: string }) => (
                          <button key={m.id} onClick={() => {
                            setSelectedMember(m);
                            setForm({ ...form, memberId: m.id });
                            setMemberSearch("");
                            setShowMemberDropdown(false);
                          }}
                            className="w-full text-left px-4 py-2.5 hover:bg-muted/50 border-b border-border last:border-0">
                            <p className="text-sm font-medium">{m.fullName}</p>
                            <p className="text-xs text-muted-foreground">{m.memberNumber} {m.phoneNumber ? `• ${m.phoneNumber}` : ""}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Relationship *</label>
                <select value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
                  <option value="">Select relationship...</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Child">Child</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Business Partner">Business Partner</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.canTransact} onChange={(e) => setForm({ ...form, canTransact: e.target.checked })}
                    className="rounded border-border w-4 h-4" />
                  Can Transact
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.canClose} onChange={(e) => setForm({ ...form, canClose: e.target.checked })}
                    className="rounded border-border w-4 h-4" />
                  Can Close
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted">Cancel</button>
              <button onClick={() => {
                if (!form.memberId) { toast.error("Select a member"); return; }
                if (!form.relationship) { toast.error("Select a relationship"); return; }
                addHolder({ variables: { accountId, memberId: form.memberId, relationship: form.relationship, canTransact: form.canTransact, canClose: form.canClose } });
              }}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90">Add Holder</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
