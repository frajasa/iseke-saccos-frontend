"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
import {
  GET_BOARD_MEMBERS,
  CREATE_BOARD_MEMBER,
  UPDATE_BOARD_MEMBER,
  SEARCH_MEMBERS,
} from "@/lib/graphql/queries";
import { BoardMember, Member } from "@/lib/types";
import { formatDate, getInitials } from "@/lib/utils";
import { toast } from "sonner";
import {
  Plus,
  Edit2,
  X,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  Users,
  Shield,
  Search,
  Crown,
  UserCheck,
} from "lucide-react";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import EmptyState from "@/components/ui/EmptyState";
import { SkeletonCards } from "@/components/ui/Skeleton";
import { isNullListError } from "@/lib/error-utils";

const COMMITTEES = [
  "All",
  "Board",
  "Credit",
  "Supervisory",
  "Education",
  "Investment",
  "Executive",
];

const POSITIONS = [
  "Chairperson",
  "Vice Chairperson",
  "Secretary",
  "Treasurer",
  "Member",
  "Committee Chair",
  "Committee Secretary",
  "Committee Member",
];

interface BoardMemberForm {
  fullName: string;
  position: string;
  committee: string;
  appointmentDate: string;
  expiryDate: string;
  phoneNumber: string;
  email: string;
  nationalId: string;
  memberId: string;
  notes: string;
  isActive: boolean;
}

const emptyForm: BoardMemberForm = {
  fullName: "",
  position: "",
  committee: "",
  appointmentDate: "",
  expiryDate: "",
  phoneNumber: "",
  email: "",
  nationalId: "",
  memberId: "",
  notes: "",
  isActive: true,
};

function isExpiringWithinMonths(expiryDate: string | null | undefined, months: number): boolean {
  if (!expiryDate) return false;
  const expiry = new Date(expiryDate);
  const now = new Date();
  const threshold = new Date();
  threshold.setMonth(threshold.getMonth() + months);
  return expiry > now && expiry <= threshold;
}

function isExpired(expiryDate: string | null | undefined): boolean {
  if (!expiryDate) return false;
  return new Date(expiryDate) < new Date();
}

function getPositionColor(position: string): string {
  switch (position.toLowerCase()) {
    case "chairperson":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
    case "vice chairperson":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
    case "secretary":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "treasurer":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  }
}

export default function BoardMembersPage() {
  const [activeCommittee, setActiveCommittee] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState<BoardMember | null>(null);
  const [form, setForm] = useState<BoardMemberForm>(emptyForm);
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<{ id: string; fullName: string; memberNumber: string } | null>(null);

  const { data, loading, error, refetch } = useQuery(GET_BOARD_MEMBERS);

  const [searchMembers, { data: searchData, loading: searchLoading }] = useLazyQuery(SEARCH_MEMBERS);

  const [createBoardMember, { loading: creating }] = useMutation(CREATE_BOARD_MEMBER, {
    onCompleted: () => {
      toast.success("Board member added successfully");
      refetch();
      setShowCreateModal(false);
      setForm(emptyForm);
      setSelectedMember(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const [updateBoardMember, { loading: updating }] = useMutation(UPDATE_BOARD_MEMBER, {
    onCompleted: () => {
      toast.success("Board member updated successfully");
      refetch();
      setShowEditModal(false);
      setEditingMember(null);
      setForm(emptyForm);
    },
    onError: (err) => toast.error(err.message),
  });

  const allBoardMembers: BoardMember[] = data?.boardMembers || [];

  const filteredMembers = useMemo(() => {
    if (activeCommittee === "All") return allBoardMembers;
    return allBoardMembers.filter(
      (m) => m.committee?.toLowerCase() === activeCommittee.toLowerCase()
    );
  }, [allBoardMembers, activeCommittee]);

  const committeeCounts = useMemo(() => {
    const counts: Record<string, number> = { All: allBoardMembers.length };
    COMMITTEES.slice(1).forEach((c) => {
      counts[c] = allBoardMembers.filter(
        (m) => m.committee?.toLowerCase() === c.toLowerCase()
      ).length;
    });
    return counts;
  }, [allBoardMembers]);

  const searchedMembers: Member[] = searchData?.searchMembers?.content || [];

  const handleMemberSearch = (term: string) => {
    setMemberSearch(term);
    if (term.trim().length >= 2) {
      searchMembers({ variables: { searchTerm: term, page: 0, size: 10 } });
    }
  };

  const handleSelectMember = (member: Member) => {
    setSelectedMember({ id: member.id, fullName: member.fullName, memberNumber: member.memberNumber });
    setForm((prev) => ({
      ...prev,
      memberId: member.id,
      fullName: prev.fullName || member.fullName,
      phoneNumber: prev.phoneNumber || member.phoneNumber || "",
      email: prev.email || member.email || "",
    }));
    setMemberSearch("");
  };

  const handleCreate = () => {
    if (!form.fullName || !form.position || !form.committee || !form.appointmentDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    createBoardMember({
      variables: {
        fullName: form.fullName,
        position: form.position,
        committee: form.committee,
        appointmentDate: form.appointmentDate,
        expiryDate: form.expiryDate || undefined,
        phoneNumber: form.phoneNumber || undefined,
        email: form.email || undefined,
        nationalId: form.nationalId || undefined,
        memberId: form.memberId || undefined,
        notes: form.notes || undefined,
      },
    });
  };

  const handleUpdate = () => {
    if (!editingMember) return;
    updateBoardMember({
      variables: {
        id: editingMember.id,
        fullName: form.fullName || undefined,
        position: form.position || undefined,
        committee: form.committee || undefined,
        expiryDate: form.expiryDate || undefined,
        phoneNumber: form.phoneNumber || undefined,
        email: form.email || undefined,
        isActive: form.isActive,
        notes: form.notes || undefined,
      },
    });
  };

  const openEditModal = (member: BoardMember) => {
    setEditingMember(member);
    setForm({
      fullName: member.fullName,
      position: member.position,
      committee: member.committee || "",
      appointmentDate: member.appointmentDate,
      expiryDate: member.expiryDate || "",
      phoneNumber: member.phoneNumber || "",
      email: member.email || "",
      nationalId: member.nationalId || "",
      memberId: member.member?.id || "",
      notes: member.notes || "",
      isActive: member.isActive,
    });
    setSelectedMember(
      member.member
        ? { id: member.member.id, fullName: `${member.member.firstName} ${member.member.lastName}`, memberNumber: member.member.memberNumber }
        : null
    );
    setShowEditModal(true);
  };

  const openCreateModal = () => {
    setForm(emptyForm);
    setSelectedMember(null);
    setMemberSearch("");
    setShowCreateModal(true);
  };

  const shouldShowError = error && !isNullListError(error) && allBoardMembers.length === 0;

  if (shouldShowError) {
    return (
      <div className="space-y-6 animate-fade-in">
        <ErrorDisplay error={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-hover rounded-2xl p-6 lg:p-8 text-white">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute right-20 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-5 h-5 text-white/70" />
              <p className="text-white/70 text-sm font-medium">Governance</p>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-1">Board & Leadership</h1>
            <p className="text-white/80 text-sm max-w-lg">
              Manage board members, committee assignments, and leadership terms for your SACCOS.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm text-sm border border-white/20"
          >
            <Plus className="w-4 h-4" />
            Add Member
          </button>
        </div>
      </div>

      {/* Committee Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {COMMITTEES.map((committee) => (
          <button
            key={committee}
            onClick={() => setActiveCommittee(committee)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCommittee === committee
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {committee}
            {committeeCounts[committee] > 0 && (
              <span
                className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-semibold ${
                  activeCommittee === committee
                    ? "bg-white/20 text-white"
                    : "bg-background text-foreground"
                }`}
              >
                {committeeCounts[committee]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Board Members Grid */}
      {loading ? (
        <SkeletonCards count={6} />
      ) : filteredMembers.length === 0 ? (
        <EmptyState
          title="No board members found"
          description={
            activeCommittee === "All"
              ? "Add your first board member to get started."
              : `No members in the ${activeCommittee} committee.`
          }
          icon={Users}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredMembers.map((member) => {
            const expiring = isExpiringWithinMonths(member.expiryDate, 3);
            const expired = isExpired(member.expiryDate);

            return (
              <div
                key={member.id}
                className="bg-card border border-border rounded-xl p-5 card-interactive group relative"
              >
                {/* Edit Button */}
                <button
                  onClick={() => openEditModal(member)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4 text-muted-foreground" />
                </button>

                {/* Avatar & Name */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0">
                    {getInitials(member.fullName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground truncate">{member.fullName}</h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium mt-1 ${getPositionColor(
                        member.position
                      )}`}
                    >
                      {member.position}
                    </span>
                  </div>
                </div>

                {/* Committee */}
                {member.committee && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Shield className="w-3.5 h-3.5" />
                    <span>{member.committee} Committee</span>
                  </div>
                )}

                {/* Dates */}
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Appointed: {formatDate(member.appointmentDate)}</span>
                  </div>
                  {member.expiryDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className={expired ? "text-red-600" : expiring ? "text-amber-600" : "text-muted-foreground"}>
                        Expires: {formatDate(member.expiryDate)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Warning badges */}
                {(expired || expiring) && (
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium mb-3 ${
                      expired
                        ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {expired ? "Term expired" : "Term expiring soon"}
                  </div>
                )}

                {/* Contact */}
                <div className="border-t border-border pt-3 space-y-1.5">
                  {member.phoneNumber && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{member.phoneNumber}</span>
                    </div>
                  )}
                  {member.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground truncate">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  )}
                </div>

                {/* Footer: Status & Linked Member */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      member.isActive
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {member.isActive ? "Active" : "Inactive"}
                  </span>
                  {member.member && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{member.member.memberNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Add Board Member</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Link to SACCOS Member */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Link to SACCOS Member (optional)
                </label>
                {selectedMember ? (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-primary/30 bg-primary/5 text-sm">
                    <UserCheck className="w-4 h-4 text-primary" />
                    <span className="font-medium">{selectedMember.fullName}</span>
                    <span className="text-muted-foreground">({selectedMember.memberNumber})</span>
                    <button
                      onClick={() => {
                        setSelectedMember(null);
                        setForm((prev) => ({ ...prev, memberId: "" }));
                      }}
                      className="ml-auto p-0.5 rounded hover:bg-muted"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      type="text"
                      value={memberSearch}
                      onChange={(e) => handleMemberSearch(e.target.value)}
                      placeholder="Search by name or member number..."
                      className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground"
                    />
                    {memberSearch.trim().length >= 2 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                        {searchLoading ? (
                          <div className="p-3 text-sm text-muted-foreground">Searching...</div>
                        ) : searchedMembers.length === 0 ? (
                          <div className="p-3 text-sm text-muted-foreground">No members found</div>
                        ) : (
                          searchedMembers.map((m) => (
                            <button
                              key={m.id}
                              onClick={() => handleSelectMember(m)}
                              className="w-full text-left px-3 py-2 hover:bg-muted transition-colors text-sm flex items-center gap-2"
                            >
                              <span className="font-medium">{m.fullName}</span>
                              <span className="text-muted-foreground">({m.memberNumber})</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="e.g. John Mwalimu"
                />
              </div>

              {/* Position & Committee */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Position <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="">Select...</option>
                    {POSITIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Committee <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.committee}
                    onChange={(e) => setForm({ ...form, committee: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="">Select...</option>
                    {COMMITTEES.slice(1).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Appointment Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.appointmentDate}
                    onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="+255..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              {/* National ID */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  National ID
                </label>
                <input
                  type="text"
                  value={form.nationalId}
                  onChange={(e) => setForm({ ...form, nationalId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="National ID number"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  rows={2}
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-6 border-t border-border">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !form.fullName || !form.position || !form.committee || !form.appointmentDate}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
              >
                {creating ? "Adding..." : "Add Member"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingMember && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Edit Board Member</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {/* Position & Committee */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Position
                  </label>
                  <select
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="">Select...</option>
                    {POSITIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Committee
                  </label>
                  <select
                    value={form.committee}
                    onChange={(e) => setForm({ ...form, committee: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="">Select...</option>
                    {COMMITTEES.slice(1).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {/* Contact */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  rows={2}
                />
              </div>

              {/* Active Status */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Active</span>
              </label>

              {/* Linked Member Info */}
              {selectedMember && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                  <UserCheck className="w-4 h-4" />
                  <span>
                    Linked to: <span className="font-medium text-foreground">{selectedMember.fullName}</span>{" "}
                    ({selectedMember.memberNumber})
                  </span>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 p-6 border-t border-border">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={updating}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
