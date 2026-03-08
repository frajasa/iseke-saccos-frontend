"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_BRANCHES } from "@/lib/graphql/queries";
import { Branch, BranchStatus } from "@/lib/types";
import { Plus, Filter, Eye } from "lucide-react";
import Link from "next/link";
import { getStatusColor, formatDate } from "@/lib/utils";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import { SkeletonTable } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { isNullListError } from "@/lib/error-utils";

export default function BranchesPage() {
  const [statusFilter, setStatusFilter] = useState<BranchStatus | undefined>(undefined);

  const { data, loading, error, refetch } = useQuery(GET_BRANCHES, {
    variables: { status: statusFilter },
  });

  const branches: Branch[] = data?.branches || [];

  const shouldShowError = error && !isNullListError(error) && branches.length === 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl tracking-tight font-bold text-foreground">Branches</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage SACCOS branch locations
          </p>
        </div>
        <Link
          href="/branches/new"
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 py-2.5 text-sm rounded-lg transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add Branch
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <select
              value={statusFilter || ""}
              onChange={(e) =>
                setStatusFilter(e.target.value ? (e.target.value as BranchStatus) : undefined)
              }
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Branches Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {loading ? (
          <SkeletonTable rows={6} cols={5} />
        ) : shouldShowError ? (
          <ErrorDisplay error={error} onRetry={() => refetch()} />
        ) : branches.length === 0 ? (
          <EmptyState title="No branches found" description="Add your first branch to get started." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Branch Code
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Branch Name
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Manager
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Opening Date
                  </th>
                  <th className="text-center py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-center py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {branches.map((branch: Branch) => (
                  <tr
                    key={branch.id}
                    className="border-t border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 px-6 text-sm font-medium text-foreground">
                      {branch.branchCode}
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {branch.branchName}
                        </p>
                        <p className="text-xs text-muted-foreground">{branch.address}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">
                      {branch.managerName}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <p className="text-foreground">{branch.phoneNumber}</p>
                        <p className="text-xs text-muted-foreground">{branch.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">
                      {formatDate(branch.openingDate)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium border ${getStatusColor(
                          branch.status
                        )}`}
                      >
                        {branch.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Link
                        href={`/branches/${branch.id}`}
                        className="inline-flex items-center justify-center gap-2 text-primary hover:text-primary/80 font-medium text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
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
