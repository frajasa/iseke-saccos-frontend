"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { UPDATE_BRANCH, GET_BRANCH } from "@/lib/graphql/queries";
import { UpdateBranchInput, BranchStatus } from "@/lib/types";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import ErrorDisplay from "@/components/ui/ErrorDisplay";

export default function EditBranchPage() {
  const router = useRouter();
  const { id: branchId } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<UpdateBranchInput>({
    branchName: "",
    address: "",
    phoneNumber: "",
    email: "",
    managerName: "",
    status: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, loading: queryLoading, error: queryError, refetch } = useQuery(GET_BRANCH, {
    variables: { id: branchId },
  });

  // Update form data when query completes
  useEffect(() => {
    if (data?.branch) {
      const branch = data.branch;
      setFormData({
        branchName: branch.branchName || "",
        address: branch.address || "",
        phoneNumber: branch.phoneNumber || "",
        email: branch.email || "",
        managerName: branch.managerName || "",
        status: branch.status || undefined,
      });
    }
  }, [data]);

  const [updateBranch, { loading: updateLoading }] = useMutation(UPDATE_BRANCH, {
    onCompleted: () => {
      router.push(`/branches/${branchId}`);
    },
    onError: (error) => {
      setErrors({ submit: error.message });
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.branchName?.trim()) {
      newErrors.branchName = "Branch name is required";
    }
    if (!formData.address?.trim()) {
      newErrors.address = "Address is required";
    }
    if (!formData.phoneNumber?.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    }
    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    }
    if (!formData.managerName?.trim()) {
      newErrors.managerName = "Manager name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Prepare input with only modified fields
    const input: UpdateBranchInput = {};

    if (formData.branchName) input.branchName = formData.branchName;
    if (formData.address) input.address = formData.address;
    if (formData.phoneNumber) input.phoneNumber = formData.phoneNumber;
    if (formData.email) input.email = formData.email;
    if (formData.managerName) input.managerName = formData.managerName;
    if (formData.status) input.status = formData.status;

    await updateBranch({
      variables: { id: branchId, input },
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  if (queryLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-[3px] border-muted border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const branch = data?.branch;

  if (queryError) {
    return <ErrorDisplay error={queryError} variant="full-page" onRetry={() => refetch()} />;
  }

  if (!branch) {
    return <ErrorDisplay variant="full-page" title="Branch Not Found" message="The branch you're looking for doesn't exist." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/branches/${branchId}`}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Edit Branch</h1>
          <p className="text-muted-foreground mt-1">
            Update information for {branch.branchName} ({branch.branchCode})
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Branch Information */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Branch Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Branch Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                name="branchName"
                value={formData.branchName}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.branchName ? "border-destructive" : "border-input"
                } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder="Main Branch"
              />
              {errors.branchName && (
                <p className="text-destructive text-sm mt-1">{errors.branchName}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Address <span className="text-destructive">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.address ? "border-destructive" : "border-input"
                } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder="Enter full address"
              />
              {errors.address && (
                <p className="text-destructive text-sm mt-1">{errors.address}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone Number <span className="text-destructive">*</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.phoneNumber ? "border-destructive" : "border-input"
                } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder="+255 XXX XXX XXX"
              />
              {errors.phoneNumber && (
                <p className="text-destructive text-sm mt-1">{errors.phoneNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email <span className="text-destructive">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.email ? "border-destructive" : "border-input"
                } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder="branch@sacco.com"
              />
              {errors.email && (
                <p className="text-destructive text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Manager Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                name="managerName"
                value={formData.managerName}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.managerName ? "border-destructive" : "border-input"
                } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder="John Doe"
              />
              {errors.managerName && (
                <p className="text-destructive text-sm mt-1">{errors.managerName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value={BranchStatus.ACTIVE}>Active</option>
                <option value={BranchStatus.INACTIVE}>Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Note about non-editable fields */}
        <div className="bg-muted/30 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Branch code and opening date cannot be edited. Please contact an
            administrator if these need to be changed.
          </p>
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-destructive text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={updateLoading}
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 rounded-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Update Branch
              </>
            )}
          </button>
          <Link
            href={`/branches/${branchId}`}
            className="inline-flex items-center justify-center px-6 py-3 text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
