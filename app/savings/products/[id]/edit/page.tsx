"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useRouter, useParams } from "next/navigation";
import {
  GET_SAVINGS_PRODUCT,
  UPDATE_SAVINGS_PRODUCT,
} from "@/lib/graphql/queries";
import {
  UpdateSavingsProductInput,
  ProductStatus,
  SavingsProduct,
} from "@/lib/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ErrorDisplay from "@/components/ui/ErrorDisplay";

export default function EditSavingsProductPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<UpdateSavingsProductInput>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, loading: loadingProduct, error: queryError, refetch } = useQuery(GET_SAVINGS_PRODUCT, {
    variables: { id },
    onCompleted: (data) => {
      const product: SavingsProduct = data.activeSavingsProductById;
      setFormData({
        productName: product.productName,
        description: product.description,
        interestRate: product.interestRate,
        minimumBalance: product.minimumBalance,
        maximumBalance: product.maximumBalance,
        minimumOpeningBalance: product.minimumOpeningBalance,
        withdrawalLimit: product.withdrawalLimit,
        withdrawalFee: product.withdrawalFee,
        monthlyFee: product.monthlyFee,
        status: product.status,
      });
    },
  });

  const [updateProduct, { loading }] = useMutation(UPDATE_SAVINGS_PRODUCT, {
    onCompleted: () => {
      router.push(`/savings/products/${id}`);
    },
    onError: (error) => {
      setErrors({ submit: error.message });
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.productName && !formData.productName.trim()) {
      newErrors.productName = "Product name cannot be empty";
    }
    if (formData.description && !formData.description.trim()) {
      newErrors.description = "Description cannot be empty";
    }
    if (formData.interestRate !== undefined && formData.interestRate < 0) {
      newErrors.interestRate = "Interest rate must be 0 or greater";
    }
    if (formData.minimumBalance !== undefined && formData.minimumBalance < 0) {
      newErrors.minimumBalance = "Minimum balance must be 0 or greater";
    }
    if (
      formData.minimumOpeningBalance !== undefined &&
      formData.minimumOpeningBalance < 0
    ) {
      newErrors.minimumOpeningBalance =
        "Minimum opening balance must be 0 or greater";
    }
    if (
      formData.minimumOpeningBalance !== undefined &&
      formData.minimumBalance !== undefined &&
      formData.minimumOpeningBalance < formData.minimumBalance
    ) {
      newErrors.minimumOpeningBalance =
        "Minimum opening balance must be at least the minimum balance";
    }
    if (
      formData.maximumBalance !== undefined &&
      formData.minimumBalance !== undefined &&
      formData.maximumBalance < formData.minimumBalance
    ) {
      newErrors.maximumBalance =
        "Maximum balance must be greater than minimum balance";
    }
    if (formData.withdrawalFee !== undefined && formData.withdrawalFee < 0) {
      newErrors.withdrawalFee = "Withdrawal fee cannot be negative";
    }
    if (formData.monthlyFee !== undefined && formData.monthlyFee < 0) {
      newErrors.monthlyFee = "Monthly fee cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      updateProduct({ variables: { id, input: formData } });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  if (loadingProduct) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-[3px] border-muted border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const product: SavingsProduct = data?.activeSavingsProductById;

  if (queryError) {
    return <ErrorDisplay error={queryError} variant="full-page" onRetry={() => refetch()} />;
  }

  if (!product) {
    return <ErrorDisplay variant="full-page" title="Product Not Found" message="The savings product you're looking for doesn't exist." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/savings/products/${id}`}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Edit Savings Product
          </h1>
          <p className="text-muted-foreground mt-1">
            {product.productName} ({product.productCode})
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-card rounded-xl border border-border p-6"
      >
        {errors.submit && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">
            {errors.submit}
          </div>
        )}

        {/* Note about non-editable fields */}
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Product code and product type cannot be
            changed after creation.
          </p>
        </div>

        {/* Basic Information */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                {errors.productName && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.productName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Interest Configuration */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Interest Configuration
            </h2>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Interest Rate (% p.a.)
              </label>
              <input
                type="number"
                name="interestRate"
                value={formData.interestRate || ""}
                onChange={handleChange}
                step="0.01"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              {errors.interestRate && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.interestRate}
                </p>
              )}
            </div>
          </div>

          {/* Balance Requirements */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Balance Requirements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Minimum Balance (TZS)
                </label>
                <input
                  type="number"
                  name="minimumBalance"
                  value={formData.minimumBalance || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                {errors.minimumBalance && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.minimumBalance}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Minimum Opening Balance (TZS)
                </label>
                <input
                  type="number"
                  name="minimumOpeningBalance"
                  value={formData.minimumOpeningBalance || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                {errors.minimumOpeningBalance && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.minimumOpeningBalance}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Maximum Balance (TZS)
                </label>
                <input
                  type="number"
                  name="maximumBalance"
                  value={formData.maximumBalance || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Optional"
                />
                {errors.maximumBalance && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.maximumBalance}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Fees and Limits */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Fees and Limits
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Withdrawal Limit (TZS)
                </label>
                <input
                  type="number"
                  name="withdrawalLimit"
                  value={formData.withdrawalLimit || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Withdrawal Fee (TZS)
                </label>
                <input
                  type="number"
                  name="withdrawalFee"
                  value={formData.withdrawalFee || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Optional"
                />
                {errors.withdrawalFee && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.withdrawalFee}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Monthly Fee (TZS)
                </label>
                <input
                  type="number"
                  name="monthlyFee"
                  value={formData.monthlyFee || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Optional"
                />
                {errors.monthlyFee && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.monthlyFee}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Status
            </h2>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Product Status
              </label>
              <select
                name="status"
                value={formData.status || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value={ProductStatus.ACTIVE}>Active</option>
                <option value={ProductStatus.INACTIVE}>Inactive</option>
              </select>
              <p className="mt-1 text-xs text-muted-foreground">
                Inactive products cannot be used for new accounts
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-border">
          <Link
            href={`/savings/products/${id}`}
            className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
