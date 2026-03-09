"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_ESS_SAVINGS_ACCOUNTS, ESS_REQUEST_WITHDRAWAL } from "@/lib/graphql/queries";
import { formatCurrency } from "@/lib/utils";
import { Wallet, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function RequestWithdrawalPage() {
  const { data: accountsData, loading: accountsLoading } = useQuery(GET_ESS_SAVINGS_ACCOUNTS);
  const accounts = (accountsData?.essSavingsAccounts || []).filter((a: any) => a.status === "ACTIVE");

  const [formData, setFormData] = useState({
    accountId: "",
    amount: "",
    reason: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [mutationError, setMutationError] = useState("");

  const selectedAccount = accounts.find((a: any) => a.id === formData.accountId);

  const [requestWithdrawal, { loading }] = useMutation(ESS_REQUEST_WITHDRAWAL, {
    onCompleted: (data) => setResult(data.essRequestWithdrawal),
    onError: (error) => setMutationError(error.message),
  });

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.accountId) errs.accountId = "Select a savings account";
    if (!formData.amount || parseFloat(formData.amount) <= 0) errs.amount = "Enter a valid amount";
    if (selectedAccount && parseFloat(formData.amount) > parseFloat(selectedAccount.availableBalance)) {
      errs.amount = "Amount exceeds available balance";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMutationError("");
    if (!validate()) return;
    requestWithdrawal({
      variables: {
        accountId: formData.accountId,
        amount: parseFloat(formData.amount),
        reason: formData.reason || undefined,
      },
    });
  };

  if (result) {
    return (
      <div className="max-w-lg mx-auto mt-12 animate-fade-in">
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-success" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Request Submitted</h2>
          <p className="text-muted-foreground mb-4">
            Your withdrawal request <span className="font-semibold text-foreground">{result.requestNumber}</span> has been submitted for approval.
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
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Request Withdrawal</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Submit a withdrawal request from your savings account</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-6">
        {mutationError && (
          <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm">
            {mutationError}
          </div>
        )}
        <div className="flex items-center gap-3 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
          <Wallet className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-600">Withdrawal requests require approval and may take 1-2 business days to process.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Savings Account *</label>
          {accountsLoading ? (
            <div className="w-full px-4 py-3 rounded-lg border border-input bg-muted animate-pulse h-12" />
          ) : (
            <select
              value={formData.accountId}
              onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="">Select an account</option>
              {accounts.map((account: any) => (
                <option key={account.id} value={account.id}>
                  {account.accountNumber} - {account.product?.productName} (Balance: {formatCurrency(account.availableBalance)})
                </option>
              ))}
            </select>
          )}
          {errors.accountId && <p className="text-xs text-destructive mt-1">{errors.accountId}</p>}
        </div>

        {selectedAccount && (
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Available Balance</p>
                <p className="font-semibold text-green-600 text-lg">{formatCurrency(selectedAccount.availableBalance)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Balance</p>
                <p className="font-semibold">{formatCurrency(selectedAccount.balance)}</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Withdrawal Amount (TZS) *</label>
          <input
            type="number"
            min="0"
            step="1000"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-lg"
            placeholder="e.g. 100000"
          />
          {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Reason</label>
          <textarea
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            placeholder="Reason for withdrawal (optional)..."
          />
        </div>

        {formData.amount && parseFloat(formData.amount) > 0 && (
          <div className="bg-muted/30 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Summary</h3>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Withdrawal Amount</span>
              <span className="font-semibold">{formatCurrency(parseFloat(formData.amount))}</span>
            </div>
            {selectedAccount && (
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Remaining Balance</span>
                <span className="font-semibold">
                  {formatCurrency(Math.max(0, parseFloat(selectedAccount.availableBalance) - parseFloat(formData.amount)))}
                </span>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Submit Request
        </button>
      </form>
    </div>
  );
}
