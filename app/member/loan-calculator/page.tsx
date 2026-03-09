"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_ESS_LOAN_PRODUCTS } from "@/lib/graphql/queries";
import { formatCurrency } from "@/lib/utils";
import { Calculator, Info } from "lucide-react";
import ErrorDisplay from "@/components/ui/ErrorDisplay";

export default function LoanCalculatorPage() {
  const { data, loading, error } = useQuery(GET_ESS_LOAN_PRODUCTS);
  const products = data?.essLoanProducts || [];

  const [selectedProductId, setSelectedProductId] = useState("");
  const [amount, setAmount] = useState("");
  const [termMonths, setTermMonths] = useState("");
  const [result, setResult] = useState<any>(null);

  const selectedProduct = products.find((p: any) => p.id === selectedProductId);

  const calculate = () => {
    if (!selectedProduct || !amount || !termMonths) return;

    const principal = parseFloat(amount);
    const months = parseInt(termMonths);
    const annualRate = parseFloat(selectedProduct.interestRate);
    const monthlyRate = annualRate / 100 / 12;

    let monthlyPayment: number;
    let totalInterest: number;
    let totalPayment: number;
    const schedule: any[] = [];

    if (selectedProduct.interestMethod === "FLAT") {
      totalInterest = principal * (annualRate / 100) * (months / 12);
      totalPayment = principal + totalInterest;
      monthlyPayment = totalPayment / months;

      let remainingPrincipal = principal;
      const monthlyPrincipal = principal / months;
      const monthlyInterest = totalInterest / months;

      for (let i = 1; i <= months; i++) {
        remainingPrincipal -= monthlyPrincipal;
        schedule.push({
          month: i,
          principal: monthlyPrincipal,
          interest: monthlyInterest,
          payment: monthlyPayment,
          balance: Math.max(0, remainingPrincipal),
        });
      }
    } else {
      // Reducing balance (amortized)
      if (monthlyRate === 0) {
        monthlyPayment = principal / months;
      } else {
        monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
      }
      totalPayment = monthlyPayment * months;
      totalInterest = totalPayment - principal;

      let remainingPrincipal = principal;
      for (let i = 1; i <= months; i++) {
        const interestPart = remainingPrincipal * monthlyRate;
        const principalPart = monthlyPayment - interestPart;
        remainingPrincipal -= principalPart;
        schedule.push({
          month: i,
          principal: principalPart,
          interest: interestPart,
          payment: monthlyPayment,
          balance: Math.max(0, remainingPrincipal),
        });
      }
    }

    const processingFee = (parseFloat(selectedProduct.processingFeeRate) || 0) / 100 * principal
      + (parseFloat(selectedProduct.processingFeeFixed) || 0);

    setResult({
      monthlyPayment,
      totalInterest,
      totalPayment,
      processingFee,
      schedule,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-[3px] border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay error={error} variant="full-page" />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Loan Calculator</h1>
        <p className="text-muted-foreground mt-1">Estimate your monthly repayments before applying</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calculator Form */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl border border-border p-6 space-y-5 sticky top-8">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Loan Product</label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  setResult(null);
                }}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Select a product</option>
                {products.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.productName} ({p.interestRate}% {p.interestMethod})</option>
                ))}
              </select>
            </div>

            {selectedProduct && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 font-medium">
                  <Info className="w-3.5 h-3.5" />
                  Product Details
                </div>
                <p className="text-muted-foreground">Amount: {formatCurrency(selectedProduct.minimumAmount)} - {formatCurrency(selectedProduct.maximumAmount)}</p>
                <p className="text-muted-foreground">Term: {selectedProduct.minimumTermMonths} - {selectedProduct.maximumTermMonths} months</p>
                <p className="text-muted-foreground">Method: {selectedProduct.interestMethod?.replace(/_/g, " ")}</p>
                {selectedProduct.processingFeeRate > 0 && (
                  <p className="text-muted-foreground">Processing fee: {selectedProduct.processingFeeRate}%</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Loan Amount (TZS)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setResult(null); }}
                min={selectedProduct?.minimumAmount || 0}
                max={selectedProduct?.maximumAmount}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="e.g. 5000000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Term (months)</label>
              <input
                type="number"
                value={termMonths}
                onChange={(e) => { setTermMonths(e.target.value); setResult(null); }}
                min={selectedProduct?.minimumTermMonths || 1}
                max={selectedProduct?.maximumTermMonths}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="e.g. 12"
              />
            </div>

            <button
              onClick={calculate}
              disabled={!selectedProduct || !amount || !termMonths}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Calculator className="w-4 h-4" />
              Calculate
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          {!result ? (
            <div className="bg-card rounded-xl border border-border p-12 text-center">
              <Calculator className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground mb-1">Select a Product & Calculate</h3>
              <p className="text-sm text-muted-foreground">Choose a loan product, enter amount and term to see estimated repayments.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card rounded-xl border border-border p-4">
                  <p className="text-xs text-muted-foreground mb-1">Monthly Payment</p>
                  <p className="text-lg font-bold text-primary tabular-nums">{formatCurrency(result.monthlyPayment)}</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-4">
                  <p className="text-xs text-muted-foreground mb-1">Total Interest</p>
                  <p className="text-lg font-bold text-amber-600 tabular-nums">{formatCurrency(result.totalInterest)}</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-4">
                  <p className="text-xs text-muted-foreground mb-1">Total Payment</p>
                  <p className="text-lg font-bold tabular-nums">{formatCurrency(result.totalPayment)}</p>
                </div>
                {result.processingFee > 0 && (
                  <div className="bg-card rounded-xl border border-border p-4">
                    <p className="text-xs text-muted-foreground mb-1">Processing Fee</p>
                    <p className="text-lg font-bold tabular-nums">{formatCurrency(result.processingFee)}</p>
                  </div>
                )}
              </div>

              {/* Amortization Table */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h3 className="text-sm font-semibold text-foreground">Amortization Schedule</h3>
                </div>
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-muted/30 sticky top-0">
                      <tr>
                        <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Month</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Payment</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Principal</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Interest</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.schedule.map((row: any) => (
                        <tr key={row.month} className="border-t border-border hover:bg-muted/20 transition-colors">
                          <td className="py-2.5 px-4 text-sm text-center">{row.month}</td>
                          <td className="py-2.5 px-4 text-sm text-right font-medium tabular-nums">{formatCurrency(row.payment)}</td>
                          <td className="py-2.5 px-4 text-sm text-right tabular-nums">{formatCurrency(row.principal)}</td>
                          <td className="py-2.5 px-4 text-sm text-right tabular-nums text-amber-600">{formatCurrency(row.interest)}</td>
                          <td className="py-2.5 px-4 text-sm text-right font-medium tabular-nums">{formatCurrency(row.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
