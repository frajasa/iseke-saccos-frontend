"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import { CREATE_LOAN_PRODUCT, GET_LOAN_PRODUCTS } from "@/lib/graphql/queries";
import { CreateLoanProductInput, InterestMethod } from "@/lib/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewLoanProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateLoanProductInput>({
    productCode: "",
    productName: "",
    description: "",
    interestRate: 0,
    interestMethod: InterestMethod.DECLINING_BALANCE,
    repaymentFrequency: "MONTHLY",
    minimumAmount: 0,
    maximumAmount: 0,
    minimumTermMonths: 1,
    maximumTermMonths: 12,
    gracePeriodDays: 0,
    requiresGuarantors: false,
    minimumGuarantors: 0,
    requiresCollateral: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [createProduct, { loading }] = useMutation(CREATE_LOAN_PRODUCT, {
    refetchQueries: [{ query: GET_LOAN_PRODUCTS }],
    onCompleted: () => {
      router.push("/loans");
    },
    onError: (error) => {
      setErrors({ submit: error.message });
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.productCode.trim()) {
      newErrors.productCode = "Product code is required";
    }
    if (!formData.productName.trim()) {
      newErrors.productName = "Product name is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (formData.interestRate < 0) {
      newErrors.interestRate = "Interest rate must be 0 or greater";
    }
    if (formData.minimumAmount < 0) {
      newErrors.minimumAmount = "Minimum amount must be 0 or greater";
    }
    if (formData.maximumAmount <= 0) {
      newErrors.maximumAmount = "Maximum amount must be greater than 0";
    }
    if (formData.maximumAmount <= formData.minimumAmount) {
      newErrors.maximumAmount = "Maximum amount must be greater than minimum amount";
    }
    if (formData.minimumTermMonths <= 0) {
      newErrors.minimumTermMonths = "Minimum term must be greater than 0";
    }
    if (formData.maximumTermMonths <= 0) {
      newErrors.maximumTermMonths = "Maximum term must be greater than 0";
    }
    if (formData.maximumTermMonths < formData.minimumTermMonths) {
      newErrors.maximumTermMonths = "Maximum term must be greater than or equal to minimum term";
    }
    if (formData.gracePeriodDays < 0) {
      newErrors.gracePeriodDays = "Grace period cannot be negative";
    }
    if (formData.requiresGuarantors && formData.minimumGuarantors <= 0) {
      newErrors.minimumGuarantors = "Minimum guarantors must be greater than 0 when required";
    }
    if (formData.requiresCollateral && (!formData.collateralPercentage || formData.collateralPercentage <= 0)) {
      newErrors.collateralPercentage = "Collateral percentage must be specified when required";
    }
    if (formData.processingFeeRate && formData.processingFeeRate < 0) {
      newErrors.processingFeeRate = "Processing fee rate cannot be negative";
    }
    if (formData.processingFeeFixed && formData.processingFeeFixed < 0) {
      newErrors.processingFeeFixed = "Processing fee cannot be negative";
    }
    if (formData.insuranceFeeRate && formData.insuranceFeeRate < 0) {
      newErrors.insuranceFeeRate = "Insurance fee rate cannot be negative";
    }
    if (formData.latePaymentPenaltyRate && formData.latePaymentPenaltyRate < 0) {
      newErrors.latePaymentPenaltyRate = "Late payment penalty rate cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      createProduct({ variables: { input: formData } });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/loans"
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Create Loan Product</h1>
          <p className="text-muted-foreground mt-1">
            Define a new loan product for your SACCOS
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

        {/* Basic Information */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Product Code <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  name="productCode"
                  value={formData.productCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="e.g., LOAN001"
                />
                {errors.productCode && (
                  <p className="mt-1 text-sm text-destructive">{errors.productCode}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Product Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="e.g., Personal Loan"
                />
                {errors.productName && (
                  <p className="mt-1 text-sm text-destructive">{errors.productName}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description <span className="text-destructive">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Describe the loan product, its purpose, and target members..."
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Interest Rate (% p.a.) <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  name="interestRate"
                  value={formData.interestRate}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                {errors.interestRate && (
                  <p className="mt-1 text-sm text-destructive">{errors.interestRate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Interest Method <span className="text-destructive">*</span>
                </label>
                <select
                  name="interestMethod"
                  value={formData.interestMethod}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value={InterestMethod.FLAT}>Flat Rate</option>
                  <option value={InterestMethod.DECLINING_BALANCE}>Declining Balance</option>
                  <option value={InterestMethod.REDUCING_BALANCE}>Reducing Balance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Repayment Frequency <span className="text-destructive">*</span>
                </label>
                <select
                  name="repaymentFrequency"
                  value={formData.repaymentFrequency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="BIWEEKLY">Bi-Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loan Amount & Term */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Loan Amount & Term</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Minimum Amount (TZS) <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  name="minimumAmount"
                  value={formData.minimumAmount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                {errors.minimumAmount && (
                  <p className="mt-1 text-sm text-destructive">{errors.minimumAmount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Maximum Amount (TZS) <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  name="maximumAmount"
                  value={formData.maximumAmount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                {errors.maximumAmount && (
                  <p className="mt-1 text-sm text-destructive">{errors.maximumAmount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Minimum Term (Months) <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  name="minimumTermMonths"
                  value={formData.minimumTermMonths}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                {errors.minimumTermMonths && (
                  <p className="mt-1 text-sm text-destructive">{errors.minimumTermMonths}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Maximum Term (Months) <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  name="maximumTermMonths"
                  value={formData.maximumTermMonths}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  Processing Fee Fixed (TZS)
                </label>
                <input
                  type="number"
                  name="processingFeeFixed"
                  value={formData.processingFeeFixed || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Optional"
                />
                {errors.processingFeeFixed && (
                  <p className="mt-1 text-sm text-destructive">{errors.processingFeeFixed}</p>
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

          {/* Requirements */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Requirements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="requiresGuarantors"
                    checked={formData.requiresGuarantors}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-border"
                  />
                  <label className="text-sm font-medium text-foreground">
                    Requires Guarantors
                  </label>
                </div>
                {formData.requiresGuarantors && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Minimum Guarantors <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="number"
                      name="minimumGuarantors"
                      value={formData.minimumGuarantors}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                    {errors.minimumGuarantors && (
                      <p className="mt-1 text-sm text-destructive">{errors.minimumGuarantors}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="requiresCollateral"
                    checked={formData.requiresCollateral}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-border"
                  />
                  <label className="text-sm font-medium text-foreground">
                    Requires Collateral
                  </label>
                </div>
                {formData.requiresCollateral && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Collateral Percentage (%) <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="number"
                      name="collateralPercentage"
                      value={formData.collateralPercentage || ""}
                      onChange={handleChange}
                      step="0.01"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                    {errors.collateralPercentage && (
                      <p className="mt-1 text-sm text-destructive">{errors.collateralPercentage}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      Percentage of loan amount required as collateral value
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Settings */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Additional Settings</h2>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Grace Period (Days) <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                name="gracePeriodDays"
                value={formData.gracePeriodDays}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              {errors.gracePeriodDays && (
                <p className="mt-1 text-sm text-destructive">{errors.gracePeriodDays}</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                Days after due date before late payment penalties apply
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-border">
          <Link
            href="/loans"
            className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
