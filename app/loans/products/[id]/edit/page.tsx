"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useRouter, useParams } from "next/navigation";
import { GET_LOAN_PRODUCT, UPDATE_LOAN_PRODUCT } from "@/lib/graphql/queries";
import { UpdateLoanProductInput, ProductStatus, LoanProduct } from "@/lib/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ErrorDisplay from "@/components/ui/ErrorDisplay";

export default function EditLoanProductPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<UpdateLoanProductInput>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, loading: loadingProduct, error: queryError, refetch } = useQuery(GET_LOAN_PRODUCT, {
    onCompleted: (data) => {
      const product: LoanProduct | undefined = (data.loanProducts || []).find(
        (p: LoanProduct) => p.id === id
      );
      if (product) {
        setFormData({
          productName: product.productName,
          description: product.description,
          interestRate: product.interestRate,
          minimumAmount: product.minimumAmount,
          maximumAmount: product.maximumAmount,
          minimumTermMonths: product.minimumTermMonths,
          maximumTermMonths: product.maximumTermMonths,
          processingFeeRate: product.processingFeeRate,
          insuranceFeeRate: product.insuranceFeeRate,
          status: product.status,
        });
      }
    },
  });

  const [updateProduct, { loading }] = useMutation(UPDATE_LOAN_PRODUCT, {
    onCompleted: () => {
      router.push(`/loans/products/${id}`);
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
    if (formData.minimumAmount !== undefined && formData.minimumAmount <= 0) {
      newErrors.minimumAmount = "Minimum amount must be greater than 0";
    }
    if (formData.maximumAmount !== undefined && formData.maximumAmount <= 0) {
      newErrors.maximumAmount = "Maximum amount must be greater than 0";
    }
    if (
      formData.maximumAmount !== undefined &&
      formData.minimumAmount !== undefined &&
      formData.maximumAmount <= formData.minimumAmount
    ) {
      newErrors.maximumAmount = "Maximum amount must be greater than minimum amount";
    }
    if (formData.minimumTermMonths !== undefined && formData.minimumTermMonths <= 0) {
      newErrors.minimumTermMonths = "Minimum term must be greater than 0";
    }
    if (formData.maximumTermMonths !== undefined && formData.maximumTermMonths <= 0) {
      newErrors.maximumTermMonths = "Maximum term must be greater than 0";
    }
    if (
      formData.maximumTermMonths !== undefined &&
      formData.minimumTermMonths !== undefined &&
      formData.maximumTermMonths < formData.minimumTermMonths
    ) {
      newErrors.maximumTermMonths = "Maximum term must be greater than or equal to minimum term";
    }
    if (formData.processingFeeRate !== undefined && formData.processingFeeRate < 0) {
      newErrors.processingFeeRate = "Processing fee rate cannot be negative";
    }
    if (formData.insuranceFeeRate !== undefined && formData.insuranceFeeRate < 0) {
      newErrors.insuranceFeeRate = "Insurance fee rate cannot be negative";
    }
    if (formData.latePaymentPenaltyRate !== undefined && formData.latePaymentPenaltyRate < 0) {
      newErrors.latePaymentPenaltyRate = "Late payment penalty rate cannot be negative";
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
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

  const product: LoanProduct = data?.loanProduct;

  if (queryError) {
    return <ErrorDisplay error={queryError} variant="full-page" onRetry={() => refetch()} />;
  }

  if (!product) {
    return <ErrorDisplay variant="full-page" title="Product Not Found" message="The loan product you're looking for doesn't exist." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/loans/products/${id}`}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Edit Loan Product</h1>
          <p className="text-muted-foreground mt-1">
            {product.productName} ({product.productCode})
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

        {/* Note about non-editable fields */}
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Product code, interest method, repayment frequency, and collateral/guarantor
            requirements cannot be changed after creation.
          </p>
        </div>

        {/* Basic Information */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Basic Information</h2>
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
                  <p className="mt-1 text-sm text-destructive">{errors.productName}</p>
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
                  <p className="mt-1 text-sm text-destructive">{errors.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Interest Configuration */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Interest Configuration</h2>
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
                <p className="mt-1 text-sm text-destructive">{errors.interestRate}</p>
              )}
            </div>
          </div>

          {/* Loan Amount & Term */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Loan Amount & Term</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Minimum Amount (TZS)
                </label>
                <input
                  type="number"
                  name="minimumAmount"
                  value={formData.minimumAmount || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                {errors.minimumAmount && (
                  <p className="mt-1 text-sm text-destructive">{errors.minimumAmount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Maximum Amount (TZS)
                </label>
                <input
                  type="number"
                  name="maximumAmount"
                  value={formData.maximumAmount || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                {errors.maximumAmount && (
                  <p className="mt-1 text-sm text-destructive">{errors.maximumAmount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Minimum Term (Months)
                </label>
                <input
                  type="number"
                  name="minimumTermMonths"
                  value={formData.minimumTermMonths || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                {errors.minimumTermMonths && (
                  <p className="mt-1 text-sm text-destructive">{errors.minimumTermMonths}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Maximum Term (Months)
                </label>
                <input
                  type="number"
                  name="maximumTermMonths"
                  value={formData.maximumTermMonths || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                {errors.maximumTermMonths && (
                  <p className="mt-1 text-sm text-destructive">{errors.maximumTermMonths}</p>
                )}
              </div>
            </div>
          </div>

          {/* Fees */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Fees</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Processing Fee Rate (%)
                </label>
                <input
                  type="number"
                  name="processingFeeRate"
                  value={formData.processingFeeRate || ""}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Optional"
                />
                {errors.processingFeeRate && (
                  <p className="mt-1 text-sm text-destructive">{errors.processingFeeRate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Insurance Fee Rate (%)
                </label>
                <input
                  type="number"
                  name="insuranceFeeRate"
                  value={formData.insuranceFeeRate || ""}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Optional"
                />
                {errors.insuranceFeeRate && (
                  <p className="mt-1 text-sm text-destructive">{errors.insuranceFeeRate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Late Payment Penalty Rate (%)
                </label>
                <input
                  type="number"
                  name="latePaymentPenaltyRate"
                  value={formData.latePaymentPenaltyRate || ""}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Optional"
                />
                {errors.latePaymentPenaltyRate && (
                  <p className="mt-1 text-sm text-destructive">{errors.latePaymentPenaltyRate}</p>
                )}
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Status</h2>
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
                Inactive products cannot be used for new loan applications
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-border">
          <Link
            href={`/loans/products/${id}`}
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
