"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import { CREATE_SAVINGS_PRODUCT, GET_SAVINGS_PRODUCTS } from "@/lib/graphql/queries";
import { CreateSavingsProductInput, SavingsProductType } from "@/lib/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewSavingsProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateSavingsProductInput>({
    productCode: "",
    productName: "",
    productType: SavingsProductType.SAVINGS,
    description: "",
    interestRate: 0,
    interestCalculationMethod: "DAILY_BALANCE",
    interestPaymentFrequency: "MONTHLY",
    minimumBalance: 0,
    minimumOpeningBalance: 0,
    dormancyPeriodDays: 180,
    allowsOverdraft: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [createProduct, { loading }] = useMutation(CREATE_SAVINGS_PRODUCT, {
    refetchQueries: [{ query: GET_SAVINGS_PRODUCTS }],
    onCompleted: () => {
      router.push("/savings");
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
    if (formData.minimumBalance < 0) {
      newErrors.minimumBalance = "Minimum balance must be 0 or greater";
    }
    if (formData.minimumOpeningBalance < 0) {
      newErrors.minimumOpeningBalance = "Minimum opening balance must be 0 or greater";
    }
    if (formData.minimumOpeningBalance < formData.minimumBalance) {
      newErrors.minimumOpeningBalance = "Minimum opening balance must be at least the minimum balance";
    }
    if (formData.maximumBalance && formData.maximumBalance < formData.minimumBalance) {
      newErrors.maximumBalance = "Maximum balance must be greater than minimum balance";
    }
    if (formData.withdrawalFee && formData.withdrawalFee < 0) {
      newErrors.withdrawalFee = "Withdrawal fee cannot be negative";
    }
    if (formData.monthlyFee && formData.monthlyFee < 0) {
      newErrors.monthlyFee = "Monthly fee cannot be negative";
    }
    if (formData.dormancyPeriodDays < 0) {
      newErrors.dormancyPeriodDays = "Dormancy period cannot be negative";
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
          href="/savings"
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Create Savings Product</h1>
          <p className="text-muted-foreground mt-1">
            Define a new savings product for your SACCO
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
                  placeholder="e.g., SAV001"
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
                  placeholder="e.g., Standard Savings Account"
                />
                {errors.productName && (
                  <p className="mt-1 text-sm text-destructive">{errors.productName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Product Type <span className="text-destructive">*</span>
                </label>
                <select
                  name="productType"
                  value={formData.productType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value={SavingsProductType.SAVINGS}>Savings</option>
                  <option value={SavingsProductType.FIXED_DEPOSIT}>Fixed Deposit</option>
                  <option value={SavingsProductType.SHARES}>Shares</option>
                  <option value={SavingsProductType.CHECKING}>Checking</option>
                  <option value={SavingsProductType.CURRENT}>Current</option>
                </select>
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
                  placeholder="Describe the product features and benefits..."
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
                  Calculation Method <span className="text-destructive">*</span>
                </label>
                <select
                  name="interestCalculationMethod"
                  value={formData.interestCalculationMethod}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="DAILY_BALANCE">Daily Balance</option>
                  <option value="AVERAGE_DAILY_BALANCE">Average Daily Balance</option>
                  <option value="MINIMUM_BALANCE">Minimum Balance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Payment Frequency <span className="text-destructive">*</span>
                </label>
                <select
                  name="interestPaymentFrequency"
                  value={formData.interestPaymentFrequency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="ANNUALLY">Annually</option>
                  <option value="AT_MATURITY">At Maturity</option>
                </select>
              </div>
            </div>
          </div>

          {/* Balance Requirements */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Balance Requirements</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Minimum Balance (TZS) <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  name="minimumBalance"
                  value={formData.minimumBalance}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                {errors.minimumBalance && (
                  <p className="mt-1 text-sm text-destructive">{errors.minimumBalance}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Minimum Opening Balance (TZS) <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  name="minimumOpeningBalance"
                  value={formData.minimumOpeningBalance}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                {errors.minimumOpeningBalance && (
                  <p className="mt-1 text-sm text-destructive">{errors.minimumOpeningBalance}</p>
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
                  <p className="mt-1 text-sm text-destructive">{errors.maximumBalance}</p>
                )}
              </div>
            </div>
          </div>

          {/* Fees and Limits */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Fees and Limits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <p className="mt-1 text-sm text-destructive">{errors.withdrawalFee}</p>
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
                  <p className="mt-1 text-sm text-destructive">{errors.monthlyFee}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tax Withholding Rate (%)
                </label>
                <input
                  type="number"
                  name="taxWithholdingRate"
                  value={formData.taxWithholdingRate || ""}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          {/* Additional Settings */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Additional Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Dormancy Period (Days) <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  name="dormancyPeriodDays"
                  value={formData.dormancyPeriodDays}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                {errors.dormancyPeriodDays && (
                  <p className="mt-1 text-sm text-destructive">{errors.dormancyPeriodDays}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  Days of inactivity before account becomes dormant
                </p>
              </div>

              <div className="flex items-center gap-3 pt-8">
                <input
                  type="checkbox"
                  name="allowsOverdraft"
                  checked={formData.allowsOverdraft}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-border"
                />
                <label className="text-sm font-medium text-foreground">
                  Allow Overdraft
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-border">
          <Link
            href="/savings"
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
