"use client";

import { useState } from "react";
import { useQuery, useLazyQuery, useMutation } from "@apollo/client";
import {
  GET_LOAN_GROUPS,
  CREATE_LOAN_GROUP,
  UPDATE_LOAN_GROUP,
  ADD_LOAN_GROUP_MEMBER,
  REMOVE_LOAN_GROUP_MEMBER,
  GET_MEMBERS,
} from "@/lib/graphql/queries";
import { formatCurrency, formatDate } from "@/lib/utils";
import { isNullListError } from "@/lib/error-utils";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import { toast } from "sonner";
import {
  Plus,
  Users,
  UserPlus,
  UserMinus,
  ChevronDown,
  ChevronUp,
  Search,
  Shield,
} from "lucide-react";

interface GroupMemberData {
  id: string;
  member: {
    id: string;
    firstName: string;
    lastName: string;
    memberNumber: string;
  };
  liabilityShare?: number;
  roleInGroup?: string;
  joinDate: string;
  isActive: boolean;
}

interface LoanGroupData {
  id: string;
  groupNumber: string;
  groupName: string;
  description?: string;
  groupLoanType: string;
  maxGroupLoanAmount?: number;
  jointLiability: boolean;
  formationDate: string;
  isActive: boolean;
  members?: GroupMemberData[];
}

const GROUP_LOAN_TYPES = [
  { value: "INDIVIDUAL", label: "Individual" },
  { value: "GROUP_SHARED", label: "Group Shared" },
  { value: "SOLIDARITY", label: "Solidarity" },
];

const ROLE_OPTIONS = [
  { value: "CHAIRPERSON", label: "Chairperson" },
  { value: "SECRETARY", label: "Secretary" },
  { value: "TREASURER", label: "Treasurer" },
  { value: "MEMBER", label: "Member" },
];

export default function LoanGroupsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState<string | null>(null);
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [memberSearch, setMemberSearch] = useState("");

  const [newGroup, setNewGroup] = useState({
    groupName: "",
    description: "",
    groupLoanType: "SOLIDARITY",
    maxGroupLoanAmount: "",
    jointLiability: true,
  });

  const [newMember, setNewMember] = useState({
    memberId: "",
    liabilityShare: "",
    roleInGroup: "MEMBER",
  });

  // Queries
  const { data, loading, error, refetch } = useQuery(GET_LOAN_GROUPS);

  const [searchMembers, { data: membersData, loading: membersLoading }] = useLazyQuery(GET_MEMBERS, {
    fetchPolicy: "network-only",
  });

  // Mutations
  const [createGroup, { loading: creating }] = useMutation(CREATE_LOAN_GROUP, {
    onCompleted: () => {
      toast.success("Loan group created successfully");
      refetch();
      setShowCreateModal(false);
      setNewGroup({
        groupName: "",
        description: "",
        groupLoanType: "SOLIDARITY",
        maxGroupLoanAmount: "",
        jointLiability: true,
      });
    },
    onError: (err) => toast.error(err.message),
  });

  const [updateGroup] = useMutation(UPDATE_LOAN_GROUP, {
    onCompleted: () => {
      toast.success("Loan group updated");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const [addMember, { loading: addingMember }] = useMutation(ADD_LOAN_GROUP_MEMBER, {
    onCompleted: () => {
      toast.success("Member added to group");
      refetch();
      setShowAddMemberModal(null);
      setNewMember({ memberId: "", liabilityShare: "", roleInGroup: "MEMBER" });
      setMemberSearch("");
    },
    onError: (err) => toast.error(err.message),
  });

  const [removeMember] = useMutation(REMOVE_LOAN_GROUP_MEMBER, {
    onCompleted: () => {
      toast.success("Member removed from group");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const groups: LoanGroupData[] = data?.loanGroups || [];
  const searchResults = membersData?.members?.content || [];

  const toggleExpand = (groupId: string) => {
    setExpandedGroupId(expandedGroupId === groupId ? null : groupId);
  };

  const handleCreate = () => {
    if (!newGroup.groupName || !newGroup.groupLoanType) {
      toast.error("Please fill in the group name and loan type");
      return;
    }
    createGroup({
      variables: {
        groupName: newGroup.groupName,
        description: newGroup.description || undefined,
        groupLoanType: newGroup.groupLoanType,
        maxGroupLoanAmount: newGroup.maxGroupLoanAmount
          ? parseFloat(newGroup.maxGroupLoanAmount)
          : undefined,
        jointLiability: newGroup.jointLiability,
      },
    });
  };

  const handleAddMember = () => {
    if (!newMember.memberId) {
      toast.error("Please select a member");
      return;
    }
    addMember({
      variables: {
        groupId: showAddMemberModal,
        memberId: newMember.memberId,
        liabilityShare: newMember.liabilityShare
          ? parseFloat(newMember.liabilityShare)
          : undefined,
        roleInGroup: newMember.roleInGroup,
      },
    });
  };

  const handleRemoveMember = (groupId: string, memberId: string, memberName: string) => {
    if (!confirm(`Remove ${memberName} from this group?`)) return;
    removeMember({ variables: { groupId, memberId } });
  };

  const handleToggleActive = (group: LoanGroupData) => {
    updateGroup({
      variables: {
        id: group.id,
        isActive: !group.isActive,
      },
    });
  };

  const handleMemberSearch = (query: string) => {
    setMemberSearch(query);
    if (query.length >= 2) {
      searchMembers({ variables: { page: 0, size: 10 } });
    }
  };

  const filteredSearchResults = searchResults.filter(
    (m: { firstName: string; lastName: string; memberNumber: string }) => {
      const q = memberSearch.toLowerCase();
      return (
        m.firstName.toLowerCase().includes(q) ||
        m.lastName.toLowerCase().includes(q) ||
        m.memberNumber.toLowerCase().includes(q)
      );
    }
  );

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse text-muted-foreground">Loading loan groups...</div>
      </div>
    );
  }

  if (error && !isNullListError(error)) {
    return <ErrorDisplay error={error} onRetry={() => refetch()} variant="card" />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Loan Groups - Solidarity &amp; Village Banks
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage solidarity loan groups, village banks, and group lending
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Create Group
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground font-medium">Total Groups</p>
          <p className="text-xl font-bold text-foreground mt-1">{groups.length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground font-medium">Active Groups</p>
          <p className="text-xl font-bold text-green-600 mt-1">
            {groups.filter((g) => g.isActive).length}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground font-medium">Total Members</p>
          <p className="text-xl font-bold text-foreground mt-1">
            {groups.reduce((sum, g) => sum + (g.members?.length || 0), 0)}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground font-medium">Joint Liability Groups</p>
          <p className="text-xl font-bold text-foreground mt-1">
            {groups.filter((g) => g.jointLiability).length}
          </p>
        </div>
      </div>

      {/* Groups Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">All Loan Groups</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Group No.
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Group Name
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Loan Type
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Max Loan Amount
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Joint Liability
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Formation Date
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Members
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {groups.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-muted-foreground">
                    No loan groups found. Create one to get started.
                  </td>
                </tr>
              ) : (
                groups.map((group) => (
                  <GroupRow
                    key={group.id}
                    group={group}
                    isExpanded={expandedGroupId === group.id}
                    onToggleExpand={() => toggleExpand(group.id)}
                    onToggleActive={() => handleToggleActive(group)}
                    onAddMember={() => {
                      setShowAddMemberModal(group.id);
                      searchMembers({ variables: { page: 0, size: 50 } });
                    }}
                    onRemoveMember={(memberId, memberName) =>
                      handleRemoveMember(group.id, memberId, memberName)
                    }
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-card rounded-xl border border-border p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">Create Loan Group</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Group Name *
                </label>
                <input
                  type="text"
                  value={newGroup.groupName}
                  onChange={(e) => setNewGroup({ ...newGroup, groupName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                  placeholder="e.g. Wanawake Solidarity Group"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Description
                </label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                  rows={3}
                  placeholder="Optional group description..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Group Loan Type *
                </label>
                <select
                  value={newGroup.groupLoanType}
                  onChange={(e) => setNewGroup({ ...newGroup, groupLoanType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                >
                  {GROUP_LOAN_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Max Group Loan Amount (TZS)
                </label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={newGroup.maxGroupLoanAmount}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, maxGroupLoanAmount: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                  placeholder="e.g. 50000000"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="jointLiability"
                  checked={newGroup.jointLiability}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, jointLiability: e.target.checked })
                  }
                  className="rounded border-border"
                />
                <label htmlFor="jointLiability" className="text-sm text-foreground">
                  Joint Liability (members guarantee each other)
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-border rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Group"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={() => {
            setShowAddMemberModal(null);
            setMemberSearch("");
            setNewMember({ memberId: "", liabilityShare: "", roleInGroup: "MEMBER" });
          }}
        >
          <div
            className="bg-card rounded-xl border border-border p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">Add Member to Group</h2>
            <div className="space-y-3">
              {/* Member Search */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Search Member *
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => handleMemberSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm"
                    placeholder="Search by name or member number..."
                  />
                </div>
                {memberSearch.length >= 2 && (
                  <div className="mt-1 max-h-40 overflow-y-auto border border-border rounded-lg bg-background">
                    {membersLoading ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">Searching...</div>
                    ) : filteredSearchResults.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        No members found
                      </div>
                    ) : (
                      filteredSearchResults.map(
                        (m: {
                          id: string;
                          firstName: string;
                          lastName: string;
                          memberNumber: string;
                        }) => (
                          <button
                            key={m.id}
                            onClick={() => {
                              setNewMember({ ...newMember, memberId: m.id });
                              setMemberSearch(`${m.firstName} ${m.lastName} (${m.memberNumber})`);
                            }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/50 border-b border-border last:border-0 ${
                              newMember.memberId === m.id ? "bg-primary/10 text-primary" : ""
                            }`}
                          >
                            <span className="font-medium">
                              {m.firstName} {m.lastName}
                            </span>
                            <span className="ml-2 text-muted-foreground font-mono text-xs">
                              {m.memberNumber}
                            </span>
                          </button>
                        )
                      )
                    )}
                  </div>
                )}
                {newMember.memberId && (
                  <p className="text-xs text-green-600 mt-1">Member selected</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Liability Share (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  value={newMember.liabilityShare}
                  onChange={(e) =>
                    setNewMember({ ...newMember, liabilityShare: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                  placeholder="e.g. 20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Role in Group
                </label>
                <select
                  value={newMember.roleInGroup}
                  onChange={(e) =>
                    setNewMember({ ...newMember, roleInGroup: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowAddMemberModal(null);
                  setMemberSearch("");
                  setNewMember({ memberId: "", liabilityShare: "", roleInGroup: "MEMBER" });
                }}
                className="px-4 py-2 border border-border rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                disabled={addingMember}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {addingMember ? "Adding..." : "Add Member"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Expandable group row component
function GroupRow({
  group,
  isExpanded,
  onToggleExpand,
  onToggleActive,
  onAddMember,
  onRemoveMember,
}: {
  group: LoanGroupData;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleActive: () => void;
  onAddMember: () => void;
  onRemoveMember: (memberId: string, memberName: string) => void;
}) {
  const memberCount = group.members?.length || 0;

  const loanTypeLabel =
    GROUP_LOAN_TYPES.find((t) => t.value === group.groupLoanType)?.label || group.groupLoanType;

  const loanTypeColor =
    group.groupLoanType === "SOLIDARITY"
      ? "bg-purple-100 text-purple-700"
      : group.groupLoanType === "GROUP_SHARED"
      ? "bg-blue-100 text-blue-700"
      : "bg-gray-100 text-gray-700";

  return (
    <>
      <tr
        className="border-b border-border hover:bg-muted/30 cursor-pointer"
        onClick={onToggleExpand}
      >
        <td className="px-6 py-3 font-mono text-sm">{group.groupNumber}</td>
        <td className="px-6 py-3 font-medium">{group.groupName}</td>
        <td className="px-6 py-3">
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${loanTypeColor}`}>
            {loanTypeLabel}
          </span>
        </td>
        <td className="px-6 py-3 font-semibold">
          {group.maxGroupLoanAmount ? formatCurrency(group.maxGroupLoanAmount) : "-"}
        </td>
        <td className="px-6 py-3">
          {group.jointLiability ? (
            <span className="flex items-center gap-1 text-green-600 text-sm">
              <Shield className="w-3.5 h-3.5" /> Yes
            </span>
          ) : (
            <span className="text-muted-foreground text-sm">No</span>
          )}
        </td>
        <td className="px-6 py-3 text-sm">{formatDate(group.formationDate)}</td>
        <td className="px-6 py-3">
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${
              group.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {group.isActive ? "Active" : "Inactive"}
          </span>
        </td>
        <td className="px-6 py-3">
          <span className="flex items-center gap-1 text-sm">
            <Users className="w-3.5 h-3.5 text-muted-foreground" /> {memberCount}
          </span>
        </td>
        <td className="px-6 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleActive();
              }}
              className={`text-xs px-2 py-1 rounded border ${
                group.isActive
                  ? "border-red-200 text-red-600 hover:bg-red-50"
                  : "border-green-200 text-green-600 hover:bg-green-50"
              }`}
            >
              {group.isActive ? "Deactivate" : "Activate"}
            </button>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </td>
      </tr>

      {/* Expanded Members Section */}
      {isExpanded && (
        <tr>
          <td colSpan={9} className="bg-muted/20 px-6 py-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  Group Members ({memberCount})
                </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddMember();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 text-xs font-medium"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Add Member
                </button>
              </div>

              {group.description && (
                <p className="text-xs text-muted-foreground">{group.description}</p>
              )}

              {memberCount === 0 ? (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  No members in this group yet. Add members to get started.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                          Name
                        </th>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                          Member No.
                        </th>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                          Role
                        </th>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                          Liability Share
                        </th>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                          Joined
                        </th>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                          Status
                        </th>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.members!.map((m) => {
                        const memberName = `${m.member.firstName} ${m.member.lastName}`;
                        const roleLabel =
                          ROLE_OPTIONS.find((r) => r.value === m.roleInGroup)?.label ||
                          m.roleInGroup ||
                          "-";
                        const roleColor =
                          m.roleInGroup === "CHAIRPERSON"
                            ? "bg-amber-100 text-amber-700"
                            : m.roleInGroup === "SECRETARY"
                            ? "bg-blue-100 text-blue-700"
                            : m.roleInGroup === "TREASURER"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-700";

                        return (
                          <tr
                            key={m.id}
                            className="border-b border-border last:border-0 hover:bg-muted/30"
                          >
                            <td className="px-4 py-2 text-sm font-medium">{memberName}</td>
                            <td className="px-4 py-2 font-mono text-xs">
                              {m.member.memberNumber}
                            </td>
                            <td className="px-4 py-2">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-medium ${roleColor}`}
                              >
                                {roleLabel}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {m.liabilityShare != null ? `${m.liabilityShare}%` : "-"}
                            </td>
                            <td className="px-4 py-2 text-xs">{formatDate(m.joinDate)}</td>
                            <td className="px-4 py-2">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  m.isActive
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {m.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRemoveMember(m.member.id, memberName);
                                }}
                                className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50"
                              >
                                <UserMinus className="w-3 h-3" /> Remove
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
