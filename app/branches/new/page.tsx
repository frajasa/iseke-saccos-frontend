"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { CREATE_BRANCH } from "@/lib/graphql/queries";
import { CreateBranchInput } from "@/lib/types";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewBranchPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateBranchInput>({
    branchCode: "",
    branchName: "",
    address: "",
    phoneNumber: "",
    email: "",
    managerName: "",
    openingDate: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [createBranch, { loading }] = useMutation(CREATE_BRANCH, {
    onCompleted: (data) => {
      router.push(`/branches/${data.createBranch.id}`);
    },
    onError: (error) => {
      setErrors({ submit: error.message });
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.branchCode.trim()) {
      newErrors.branchCode = "Branch code is required";
    }
    if (!formData.branchName.trim()) {
      newErrors.branchName = "Branch name is required";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    }
    if (!formData.managerName.trim()) {
      newErrors.managerName = "Manager name is required";
    }
    if (!formData.openingDate) {
      newErrors.openingDate = "Opening date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await createBranch({
      variables: { input: formData },
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/branches"
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Add New Branch</h1>
          <p className="text-muted-foreground mt-1">
            Register a new SACCOS branch location
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
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Branch Code <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                name="branchCode"
                value={formData.branchCode}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.branchCode ? "border-destructive" : "border-input"
                } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder="BR001"
              />
              {errors.branchCode && (
                <p className="text-destructive text-sm mt-1">{errors.branchCode}</p>
              )}
            </div>

            <div>
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
                Opening Date <span className="text-destructive">*</span>
              </label>
              <input
                type="date"
                name="openingDate"
                value={formData.openingDate}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.openingDate ? "border-destructive" : "border-input"
                } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
              />
              {errors.openingDate && (
                <p className="text-destructive text-sm mt-1">{errors.openingDate}</p>
              )}
            </div>
          </div>
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
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 rounded-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Create Branch
              </>
            )}
          </button>
          <Link
            href="/branches"
            className="inline-flex items-center justify-center px-6 py-3 text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
