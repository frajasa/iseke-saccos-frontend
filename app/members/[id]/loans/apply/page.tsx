"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { APPLY_FOR_LOAN, GET_LOAN_PRODUCTS, GET_MEMBER } from "@/lib/graphql/queries";
import { LoanApplicationInput } from "@/lib/types";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default function ApplyForLoanPage() {
  const router = useRouter();
  const { id: memberId } = useParams<{ id: string }>();
  const [formData, setFormData] = useState({
    productId: "",
    requestedAmount: "",
    termMonths: "",
    purpose: "",
    loanOfficer: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: memberData } = useQuery(GET_MEMBER, {
    variables: { id: memberId },
  });

  const { data: productsData } = useQuery(GET_LOAN_PRODUCTS);

  const [applyForLoan, { loading }] = useMutation(APPLY_FOR_LOAN, {
    onCompleted: (data) => {
      router.push(`/loans/accounts/${data.applyForLoan.id}`);
    },
    onError: (error) => {
      setErrors({ submit: error.message });
    },
  });

  const member = memberData?.member;
  const products = productsData?.loanProducts || [];
  const selectedProduct = products.find((p: any) => p.id === formData.productId);

  const calculateMonthlyPayment = () => {
    if (!formData.requestedAmount || !formData.termMonths || !selectedProduct) return 0;

    const principal = parseFloat(formData.requestedAmount);
    const months = parseInt(formData.termMonths);
    const monthlyRate = selectedProduct.interestRate / 100 / 12;

    if (selectedProduct.interestMethod === "FLAT") {
      const totalInterest = principal * (selectedProduct.interestRate / 100) * (months / 12);
      return (principal + totalInterest) / months;
    } else {
      // Reducing balance
      return principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) /
             (Math.pow(1 + monthlyRate, months) - 1);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.productId) {
      newErrors.productId = "Please select a loan product";
    }
    if (!formData.requestedAmount || parseFloat(formData.requestedAmount) <= 0) {
      newErrors.requestedAmount = "Amount must be greater than 0";
    }
    if (selectedProduct) {
      const amount = parseFloat(formData.requestedAmount);
      if (amount < selectedProduct.minimumAmount) {
        newErrors.requestedAmount = `Minimum loan amount is ${formatCurrency(selectedProduct.minimumAmount)}`;
      }
      if (amount > selectedProduct.maximumAmount) {
        newErrors.requestedAmount = `Maximum loan amount is ${formatCurrency(selectedProduct.maximumAmount)}`;
      }
    }
    if (!formData.termMonths || parseInt(formData.termMonths) <= 0) {
      newErrors.termMonths = "Loan term is required";
    }
    if (selectedProduct) {
      const months = parseInt(formData.termMonths);
      if (months < selectedProduct.minimumTermMonths) {
        newErrors.termMonths = `Minimum term is ${selectedProduct.minimumTermMonths} months`;
      }
      if (months > selectedProduct.maximumTermMonths) {
        newErrors.termMonths = `Maximum term is ${selectedProduct.maximumTermMonths} months`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const input: LoanApplicationInput = {
      memberId: memberId,
      productId: formData.productId,
      requestedAmount: parseFloat(formData.requestedAmount),
      termMonths: parseInt(formData.termMonths),
    };

    if (formData.purpose) input.purpose = formData.purpose;
    if (formData.loanOfficer) input.loanOfficer = formData.loanOfficer;

    await applyForLoan({
      variables: { input },
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

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  if (!member) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-[3px] border-muted border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const monthlyPayment = calculateMonthlyPayment();
  const processingFee = selectedProduct && formData.requestedAmount
    ? (selectedProduct.processingFeeRate ? parseFloat(formData.requestedAmount) * (selectedProduct.processingFeeRate / 100) : selectedProduct.processingFeeFixed || 0)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/members/${memberId}`}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Apply for Loan</h1>
          <p className="text-muted-foreground mt-1">
            for {member.firstName} {member.lastName} (#{member.memberNumber})
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Selection */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Select Loan Product
          </h2>
          <div className="space-y-4">
            {products.filter((p: any) => p.status === "ACTIVE").map((product: any) => (
              <label
                key={product.id}
                className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
                  formData.productId === product.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <input
                  type="radio"
                  name="productId"
                  value={product.id}
                  checked={formData.productId === product.id}
                  onChange={handleChange}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-foreground">{product.productName}</h3>
                    <span className="text-sm font-semibold text-primary">
                      {(Number(product.interestRate || 0) * 100).toFixed(2)}% {product.interestMethod}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="ml-1 font-medium">
                        {formatCurrency(product.minimumAmount)} - {formatCurrency(product.maximumAmount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Term:</span>
                      <span className="ml-1 font-medium">
                        {product.minimumTermMonths}-{product.maximumTermMonths} months
                      </span>
                    </div>
                    {product.requiresGuarantors && (
                      <div className="text-amber-600">
                        <AlertCircle className="w-3 h-3 inline mr-1" />
                        <span>Requires {product.minimumGuarantors} guarantors</span>
                      </div>
                    )}
                    {product.requiresCollateral && (
                      <div className="text-amber-600">
                        <AlertCircle className="w-3 h-3 inline mr-1" />
                        <span>Requires collateral</span>
                      </div>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>
          {errors.productId && (
            <p className="text-destructive text-sm mt-2">{errors.productId}</p>
          )}
        </div>

        {/* Loan Details */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Loan Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Requested Amount (TZS) <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                name="requestedAmount"
                value={formData.requestedAmount}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.requestedAmount ? "border-destructive" : "border-input"
                } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder="0"
                min="0"
                step="10000"
              />
              {errors.requestedAmount && (
                <p className="text-destructive text-sm mt-1">{errors.requestedAmount}</p>
              )}
              {selectedProduct && (
                <p className="text-muted-foreground text-sm mt-1">
                  Range: {formatCurrency(selectedProduct.minimumAmount)} - {formatCurrency(selectedProduct.maximumAmount)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Loan Term (Months) <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                name="termMonths"
                value={formData.termMonths}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.termMonths ? "border-destructive" : "border-input"
                } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder="12"
                min="1"
              />
              {errors.termMonths && (
                <p className="text-destructive text-sm mt-1">{errors.termMonths}</p>
              )}
              {selectedProduct && (
                <p className="text-muted-foreground text-sm mt-1">
                  Range: {selectedProduct.minimumTermMonths}-{selectedProduct.maximumTermMonths} months
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Purpose of Loan
              </label>
              <textarea
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Describe the purpose of this loan..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Loan Officer (Optional)
              </label>
              <input
                type="text"
                name="loanOfficer"
                value={formData.loanOfficer}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Officer name"
              />
            </div>
          </div>
        </div>

        {/* Loan Summary */}
        {formData.requestedAmount && formData.termMonths && selectedProduct && monthlyPayment > 0 && (
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">Loan Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm opacity-80 mb-1">Principal Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(parseFloat(formData.requestedAmount))}</p>
              </div>
              <div>
                <p className="text-sm opacity-80 mb-1">Monthly Payment</p>
                <p className="text-2xl font-bold">{formatCurrency(monthlyPayment)}</p>
              </div>
              <div>
                <p className="text-sm opacity-80 mb-1">Loan Term</p>
                <p className="text-2xl font-bold">{formData.termMonths} months</p>
              </div>
            </div>
            {processingFee > 0 && (
              <p className="text-sm opacity-80 mt-4">
                Processing Fee: {formatCurrency(processingFee)}
              </p>
            )}
            {selectedProduct.requiresGuarantors && (
              <p className="text-sm opacity-80 mt-2">
                ⚠️ This loan requires {selectedProduct.minimumGuarantors} guarantor(s)
              </p>
            )}
            {selectedProduct.requiresCollateral && (
              <p className="text-sm opacity-80 mt-2">
                ⚠️ This loan requires collateral worth {selectedProduct.collateralPercentage}% of loan amount
              </p>
            )}
          </div>
        )}

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
            className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting Application...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Submit Loan Application
              </>
            )}
          </button>
          <Link
            href={`/members/${memberId}`}
            className="inline-flex items-center justify-center px-6 py-3 text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
