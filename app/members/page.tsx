"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_MEMBERS, SEARCH_MEMBERS } from "@/lib/graphql/queries";
import { Member, MemberStatus } from "@/lib/types";
import { Search, Plus, Eye } from "lucide-react";
import Link from "next/link";
import { getStatusColor, formatDate, getInitials } from "@/lib/utils";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { isNullListError } from "@/lib/error-utils";

export default function MembersPage() {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<MemberStatus | undefined>(undefined);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const isSearching = debouncedSearch.trim().length > 0;

  const { data: membersData, loading: membersLoading, error: membersError, refetch: refetchMembers } = useQuery(GET_MEMBERS, {
    variables: { page, size: 20, status: statusFilter || undefined },
    skip: isSearching,
  });

  const { data: searchData, loading: searchLoading, error: searchError, refetch: refetchSearch } = useQuery(SEARCH_MEMBERS, {
    variables: { searchTerm: debouncedSearch, page, size: 20 },
    skip: !isSearching,
  });

  const data = isSearching ? searchData?.searchMembers : membersData?.members;
  const loading = isSearching ? searchLoading : membersLoading;
  const error = isSearching ? searchError : membersError;
  const refetch = isSearching ? refetchSearch : refetchMembers;

  const members = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements;

  const shouldShowError = error && !isNullListError(error) && members.length === 0;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Members</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your SACCOS members
            {totalElements != null && !loading && (
              <span className="text-foreground font-medium"> ({totalElements.toLocaleString()})</span>
            )}
          </p>
        </div>
        <Link
          href="/members/new"
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Member
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name, number, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground"
          />
        </div>
        <select
          value={statusFilter || ""}
          onChange={(e) => {
            setStatusFilter(e.target.value ? (e.target.value as MemberStatus) : undefined);
            setPage(0);
          }}
          className="px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-w-[140px]"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="DORMANT">Dormant</option>
        </select>
      </div>

      {/* Members Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <SkeletonTable rows={8} cols={6} />
        ) : shouldShowError ? (
          <div className="p-6">
            <ErrorDisplay error={error} onRetry={() => refetch()} />
          </div>
        ) : members.length === 0 ? (
          <EmptyState
            variant={isSearching ? "search" : "no-members"}
            title={isSearching ? "No members found" : "No members yet"}
            description={isSearching ? "Try adjusting your search terms or filters." : "Start by adding your first member to the system."}
            action={!isSearching ? (
              <Link href="/members/new" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-medium px-4 py-2 rounded-lg text-sm hover:bg-primary-hover transition-colors">
                <Plus className="w-4 h-4" />
                Add Member
              </Link>
            ) : undefined}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Member</th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Branch</th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Joined</th>
                    <th className="text-center py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-right py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member: Member, i: number) => (
                    <tr
                      key={member.id}
                      className="border-t border-border hover:bg-muted/20 transition-colors table-row-animate"
                      style={{ animationDelay: `${i * 20}ms` }}
                    >
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                            {getInitials(`${member.firstName} ${member.lastName}`)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {[member.firstName, member.middleName, member.lastName].filter(Boolean).join(" ")}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">{member.memberNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-sm text-muted-foreground">{member.phoneNumber}</td>
                      <td className="py-3 px-6 text-sm text-muted-foreground">{member.branch?.branchName || "—"}</td>
                      <td className="py-3 px-6 text-sm text-muted-foreground">{formatDate(member.membershipDate)}</td>
                      <td className="py-3 px-6 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getStatusColor(member.status)}`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-right">
                        <Link
                          href={`/members/${member.id}`}
                          className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-hover font-medium transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={totalElements}
              pageSize={20}
            />
          </>
        )}
      </div>
    </div>
  );
}
