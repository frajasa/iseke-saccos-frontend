"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client/react";
import { ESS_APPLY_FOR_LOAN, GET_ESS_LOAN_PRODUCTS, CHECK_ESS_LOAN_ELIGIBILITY } from "@/lib/graphql/queries";
import { formatCurrency } from "@/lib/utils";
import { CreditCard, CheckCircle, Loader2, AlertTriangle, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function ApplyLoanPage() {
  const [formData, setFormData] = useState({
    amount: "",
    termMonths: "12",
    purpose: "",
    productId: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [mutationError, setMutationError] = useState("");

  const { data: productsData } = useQuery(GET_ESS_LOAN_PRODUCTS);
  const products = productsData?.essLoanProducts || [];

  const [checkEligibility, { data: eligibilityData, loading: eligibilityLoading }] =
    useLazyQuery(CHECK_ESS_LOAN_ELIGIBILITY, { fetchPolicy: "network-only" });

  const eligibility = eligibilityData?.essLoanEligibility;

  const [applyForLoan, { loading }] = useMutation(ESS_APPLY_FOR_LOAN, {
    onCompleted: (data) => setResult(data.essApplyForLoan),
    onError: (error) => setMutationError(error.message),
  });

  // Check eligibility when amount, term, and product change
  useEffect(() => {
    const amount = parseFloat(formData.amount);
    const termMonths = parseInt(formData.termMonths);
    if (amount > 0 && termMonths > 0 && formData.productId) {
      const timer = setTimeout(() => {
        checkEligibility({
          variables: { amount, termMonths, productId: formData.productId },
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [formData.amount, formData.termMonths, formData.productId, checkEligibility]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.amount || parseFloat(formData.amount) <= 0) errs.amount = "Enter a valid amount";
    if (!formData.termMonths || parseInt(formData.termMonths) < 1) errs.termMonths = "Enter valid term";
    if (!formData.productId) errs.productId = "Select a loan product";
    if (eligibility && !eligibility.eligible) errs.eligibility = "You are not eligible for this loan";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMutationError("");
    if (!validate()) return;
    applyForLoan({
      variables: {
        amount: parseFloat(formData.amount),
        termMonths: parseInt(formData.termMonths),
        purpose: formData.purpose || undefined,
        productId: formData.productId,
      },
    });
  };

  if (result) {
    return (
      <div className="max-w-lg mx-auto mt-12 animate-fade-in">
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-success" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Application Submitted</h2>
          <p className="text-muted-foreground mb-4">
            Your loan application <span className="font-semibold text-foreground">{result.requestNumber}</span> has been submitted for review.
          </p>
          <div className="bg-muted/30 rounded-lg p-4 mb-6 text-sm">
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-semibold">{formatCurrency(result.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="font-semibold text-amber-600">{result.status}</span>
            </div>
          </div>
          <Link
            href="/member/requests"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            View My Requests
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Apply for a Loan</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Submit a loan application for review</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-6">
        {mutationError && (
          <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm">
            {mutationError}
          </div>
        )}
        <div className="flex items-center gap-3 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <CreditCard className="w-5 h-5 text-blue-600" />
          <p className="text-sm text-blue-600">Your eligibility will be checked automatically based on your shares and salary.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Loan Product *</label>
          <select
            value={formData.productId}
            onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            <option value="">Select a product...</option>
            {products.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.productName} ({(p.interestRate * 100).toFixed(1)}% p.a.)
              </option>
            ))}
          </select>
          {errors.productId && <p className="text-xs text-destructive mt-1">{errors.productId}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Loan Amount (TZS) *</label>
          <input
            type="number"
            min="0"
            step="1000"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-lg"
            placeholder="e.g. 500000"
          />
          {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Term (Months) *</label>
          <select
            value={formData.termMonths}
            onChange={(e) => setFormData({ ...formData, termMonths: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            <option value="3">3 months</option>
            <option value="6">6 months</option>
            <option value="12">12 months</option>
            <option value="18">18 months</option>
            <option value="24">24 months</option>
            <option value="36">36 months</option>
          </select>
          {errors.termMonths && <p className="text-xs text-destructive mt-1">{errors.termMonths}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Purpose</label>
          <textarea
            value={formData.purpose}
            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder="Describe the purpose of this loan..."
          />
        </div>

        {/* Eligibility Check Result */}
        {eligibilityLoading && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm p-3">
            <Loader2 className="w-4 h-4 animate-spin" />
            Checking eligibility...
          </div>
        )}

        {eligibility && !eligibilityLoading && (
          <div className={`rounded-lg border p-4 ${
            eligibility.eligible
              ? "bg-green-500/10 border-green-500/20"
              : "bg-destructive/10 border-destructive/20"
          }`}>
            <div className="flex items-center gap-2 mb-3">
              {eligibility.eligible ? (
                <ShieldCheck className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-destructive" />
              )}
              <h3 className={`text-sm font-semibold ${eligibility.eligible ? "text-green-700" : "text-destructive"}`}>
                {eligibility.eligible ? "Eligible" : "Not Eligible"}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Share Value</span>
                <p className="font-semibold">{formatCurrency(eligibility.shareValue)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Max by Shares (3x)</span>
                <p className="font-semibold">{formatCurrency(eligibility.maxByShares)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Monthly Salary</span>
                <p className="font-semibold">{formatCurrency(eligibility.monthlySalary)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Available Capacity/mo</span>
                <p className="font-semibold">{formatCurrency(eligibility.availableMonthlyCapacity)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Current Deductions/mo</span>
                <p className="font-semibold">{formatCurrency(eligibility.currentMonthlyDeductions)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Proposed Repayment/mo</span>
                <p className="font-semibold">{formatCurrency(eligibility.proposedMonthlyRepayment)}</p>
              </div>
            </div>
            {eligibility.reasons && eligibility.reasons.length > 0 && (
              <ul className="mt-3 text-xs space-y-1">
                {eligibility.reasons.map((r: string, i: number) => (
                  <li key={i} className={eligibility.eligible ? "text-green-700" : "text-destructive"}>
                    {r}
                  </li>
                ))}
              </ul>
            )}
            {eligibility.maxLoanAmount > 0 && (
              <p className="mt-2 text-sm font-semibold">
                Maximum eligible amount: {formatCurrency(eligibility.maxLoanAmount)}
              </p>
            )}
          </div>
        )}

        {errors.eligibility && (
          <p className="text-xs text-destructive">{errors.eligibility}</p>
        )}

        {formData.amount && parseFloat(formData.amount) > 0 && (
          <div className="bg-muted/30 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Summary</h3>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Requested Amount</span>
              <span className="font-semibold">{formatCurrency(parseFloat(formData.amount))}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">Term</span>
              <span className="font-semibold">{formData.termMonths} months</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (eligibility && !eligibility.eligible)}
          className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Submit Application
        </button>
      </form>
    </div>
  );
}
