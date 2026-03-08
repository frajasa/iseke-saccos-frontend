"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_BRANCH, DELETE_BRANCH } from "@/lib/graphql/queries";
import { Branch } from "@/lib/types";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Edit, Trash2, Phone, Mail, MapPin, User, Calendar, Building2 } from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Link from "next/link";
import { toast } from "sonner";
import { formatDate, getStatusColor } from "@/lib/utils";
import ErrorDisplay from "@/components/ui/ErrorDisplay";

export default function BranchDetailPage() {
  const router = useRouter();
  const { id: branchId } = useParams<{ id: string }>();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_BRANCH, {
    variables: { id: branchId },
  });

  const [deleteBranch, { loading: deleteLoading }] = useMutation(DELETE_BRANCH, {
    onCompleted: () => {
      router.push("/branches");
    },
    onError: (error) => {
      toast.error(`Error deactivating branch: ${error.message}`);
    },
  });

  const branch: Branch | undefined = data?.branch;

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to deactivate ${branch?.branchName}?`)) {
      await deleteBranch({
        variables: { id: branchId, input: { status: "INACTIVE" } },
      });
    }
    setShowDeleteDialog(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-[3px] border-muted border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay error={error} variant="full-page" onRetry={() => refetch()} />;
  }

  if (!branch) {
    return <ErrorDisplay variant="full-page" title="Branch Not Found" message="The branch you're looking for doesn't exist." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Breadcrumbs items={[{ label: "Branches", href: "/branches" }, { label: branch.branchName }]} />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/branches"
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {branch.branchName}
            </h1>
            <p className="text-muted-foreground mt-1">
              Branch Code: {branch.branchCode}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
          href={`/branches/${branchId}/edit`}
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteDialog(true)}
            disabled={deleteLoading}
            className="inline-flex items-center justify-center gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Status Badge */}
      <div>
        <span
          className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
            branch.status
          )}`}
        >
          {branch.status}
        </span>
      </div>

      {/* Branch Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Branch Code</h3>
            <Building2 className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-2xl font-bold tabular-nums">{branch.branchCode}</p>
          <p className="text-xs opacity-80 mt-1">Unique Identifier</p>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Manager</h3>
            <User className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-2xl font-bold">{branch.managerName}</p>
          <p className="text-xs opacity-80 mt-1">Branch Manager</p>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Opening Date</h3>
            <Calendar className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-2xl font-bold">{formatDate(branch.openingDate)}</p>
          <p className="text-xs opacity-80 mt-1">Established</p>
        </div>
      </div>

      {/* Branch Information */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">
          Branch Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Branch Name</p>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <p className="text-foreground font-medium">{branch.branchName}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Branch Code</p>
            <p className="text-foreground font-medium">{branch.branchCode}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Manager Name</p>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <p className="text-foreground font-medium">{branch.managerName}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Opening Date</p>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <p className="text-foreground font-medium">{formatDate(branch.openingDate)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">
          Contact Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Phone Number</p>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <a
                href={`tel:${branch.phoneNumber}`}
                className="text-foreground font-medium hover:text-primary transition-colors"
              >
                {branch.phoneNumber}
              </a>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Email</p>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <a
                href={`mailto:${branch.email}`}
                className="text-foreground font-medium hover:text-primary transition-colors"
              >
                {branch.email}
              </a>
            </div>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-muted-foreground mb-1">Address</p>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <p className="text-foreground font-medium">{branch.address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics (Placeholder for future implementation) */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">
          Branch Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Total Members</p>
            <p className="text-2xl font-bold text-foreground">-</p>
            <p className="text-xs text-muted-foreground mt-1">Registered at this branch</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Savings Accounts</p>
            <p className="text-2xl font-bold text-foreground">-</p>
            <p className="text-xs text-muted-foreground mt-1">Active accounts</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Loan Accounts</p>
            <p className="text-2xl font-bold text-foreground">-</p>
            <p className="text-xs text-muted-foreground mt-1">Active loans</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
            <p className="text-2xl font-bold text-foreground">-</p>
            <p className="text-xs text-muted-foreground mt-1">All accounts combined</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-4 text-center">
          Statistics will be available once connected to the backend
        </p>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-card rounded-xl border border-border p-6 max-w-md w-full mx-4 shadow-xl animate-modal-in">
            <h3 className="text-lg font-bold text-foreground mb-4">Delete Branch</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete <strong>{branch.branchName}</strong>? This
              action cannot be undone and may affect members assigned to this branch.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleteLoading}
                className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="bg-muted/30 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>Created: {formatDate(branch.createdAt)}</p>
          <p>Last Updated: {formatDate(branch.updatedAt)}</p>
        </div>
      </div>
    </div>
  );
}
