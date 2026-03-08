"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import { OPEN_SAVINGS_ACCOUNT, GET_SAVINGS_PRODUCTS, SEARCH_MEMBERS } from "@/lib/graphql/queries";
import { CreateSavingsAccountInput } from "@/lib/types";
import { ArrowLeft, Search, User, DollarSign } from "lucide-react";
import Link from "next/link";

export default function NewSavingsAccountPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [formData, setFormData] = useState<CreateSavingsAccountInput>({
    memberId: "",
    productId: "",
    branchId: "",
    openingDeposit: 0,
    beneficiaryName: "",
    beneficiaryRelationship: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get savings products
  const { data: productsData, loading: productsLoading } = useQuery(GET_SAVINGS_PRODUCTS);
  const products = productsData?.activeSavingsProducts || [];

  // Search members
  const { data: membersData, loading: membersLoading } = useQuery(SEARCH_MEMBERS, {
    variables: { searchTerm, page: 0, size: 10 },
    skip: searchTerm.length < 2,
  });
  const members = membersData?.searchMembers?.content || [];

  // Open account mutation
  const [openAccount, { loading: submitting }] = useMutation(OPEN_SAVINGS_ACCOUNT, {
    onCompleted: (data) => {
      router.push(`/savings/accounts/${data.openSavingsAccount.id}`);
    },
    onError: (error) => {
      setErrors({ submit: error.message });
    },
  });

  const selectedProduct = products.find((p: any) => p.id === formData.productId);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.memberId || formData.memberId.trim() === "") {
      newErrors.memberId = "Please select a member";
    }
    if (!formData.productId || formData.productId.trim() === "") {
      newErrors.productId = "Please select a savings product";
    }
    if (!formData.openingDeposit || formData.openingDeposit <= 0) {
      newErrors.openingDeposit = "Opening deposit must be greater than 0";
    }
    if (selectedProduct && formData.openingDeposit < Number(selectedProduct.minimumOpeningBalance)) {
      newErrors.openingDeposit = `Minimum opening deposit is TZS ${Number(selectedProduct.minimumOpeningBalance).toLocaleString()}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Build input object with only valid values
      const input: any = {
        memberId: formData.memberId,
        productId: formData.productId,
        openingDeposit: formData.openingDeposit,
      };

      // Add optional fields only if they have values
      if (formData.branchId && formData.branchId.trim() !== "") {
        input.branchId = formData.branchId;
      }
      if (formData.beneficiaryName && formData.beneficiaryName.trim() !== "") {
        input.beneficiaryName = formData.beneficiaryName;
      }
      if (formData.beneficiaryRelationship && formData.beneficiaryRelationship.trim() !== "") {
        input.beneficiaryRelationship = formData.beneficiaryRelationship;
      }

      openAccount({ variables: { input } });
    }
  };

  const handleMemberSelect = (member: any) => {
    setSelectedMember(member);
    setFormData({ ...formData, memberId: member.id, branchId: member.branch?.id || "" });
    setSearchTerm("");
    if (errors.memberId) {
      setErrors({ ...errors, memberId: "" });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const fieldValue = type === "number" ? parseFloat(value) || 0 : value;

    setFormData({ ...formData, [name]: fieldValue });

    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/savings"
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Open Savings Account</h1>
          <p className="text-muted-foreground mt-1">
            Create a new savings account for a member
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6">
        {errors.submit && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">
            {errors.submit}
          </div>
        )}

        {/* Member Selection */}
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-semibold text-foreground mb-4">Member Information</h2>

            {!selectedMember ? (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Search Member <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, member number, or phone..."
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                {errors.memberId && (
                  <p className="mt-1 text-sm text-destructive">{errors.memberId}</p>
                )}

                {/* Search Results */}
                {searchTerm.length >= 2 && (
                  <div className="mt-2 bg-background border border-border rounded-lg max-h-60 overflow-y-auto">
                    {membersLoading ? (
                      <div className="p-4 text-center text-muted-foreground">
                        Searching...
                      </div>
                    ) : members.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        No members found
                      </div>
                    ) : (
                      members.map((member: any) => (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => handleMemberSelect(member)}
                          className="w-full p-3 text-left hover:bg-muted transition-colors border-b border-border last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {member.firstName} {member.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {member.memberNumber} • {member.phoneNumber}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {selectedMember.firstName} {selectedMember.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedMember.memberNumber} • {selectedMember.phoneNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedMember.branch?.branchName}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMember(null);
                      setFormData({ ...formData, memberId: "", branchId: "" });
                    }}
                    className="text-sm text-destructive hover:underline"
                  >
                    Change
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Product Selection */}
          <div>
            <h2 className="text-base font-semibold text-foreground mb-4">Account Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Savings Product <span className="text-destructive">*</span>
                </label>
                <select
                  name="productId"
                  value={formData.productId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  disabled={productsLoading}
                >
                  <option value="">Select a savings product</option>
                  {products.map((product: any) => (
                    <option key={product.id} value={product.id}>
                      {product.productName} - {(Number(product.interestRate || 0) * 100).toFixed(2)}% p.a. (Min: TZS {Number(product.minimumOpeningBalance || 0).toLocaleString()})
                    </option>
                  ))}
                </select>
                {errors.productId && (
                  <p className="mt-1 text-sm text-destructive">{errors.productId}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Opening Deposit (TZS) <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <input
                    type="number"
                    name="openingDeposit"
                    value={formData.openingDeposit || ""}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-gray-500"
                  />
                </div>
                {errors.openingDeposit && (
                  <p className="mt-1 text-sm text-destructive">{errors.openingDeposit}</p>
                )}
                {selectedProduct && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Minimum: TZS {Number(selectedProduct.minimumOpeningBalance).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Beneficiary Information (Optional) */}
          <div>
            <h2 className="text-base font-semibold text-foreground mb-4">Beneficiary Information (Optional)</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Beneficiary Name
                </label>
                <input
                  type="text"
                  name="beneficiaryName"
                  value={formData.beneficiaryName}
                  onChange={handleChange}
                  placeholder="Full name"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Relationship
                </label>
                <input
                  type="text"
                  name="beneficiaryRelationship"
                  value={formData.beneficiaryRelationship}
                  onChange={handleChange}
                  placeholder="e.g., Spouse, Child"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-border">
          <Link
            href="/savings"
            className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || productsLoading}
            className="px-6 py-3 bg-gradient-to-r from-primary to-primary-hover text-white rounded-lg hover:shadow-lg transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Opening Account..." : "Open Account"}
          </button>
        </div>
      </form>
    </div>
  );
}
