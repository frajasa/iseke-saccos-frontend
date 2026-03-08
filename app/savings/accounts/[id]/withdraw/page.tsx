"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { WITHDRAW, GET_SAVINGS_ACCOUNT } from "@/lib/graphql/queries";
import { WithdrawInput, PaymentMethod } from "@/lib/types";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import ErrorDisplay from "@/components/ui/ErrorDisplay";

export default function WithdrawPage() {
  const router = useRouter();
  const { id: accountId } = useParams<{ id: string }>();
  const [formData, setFormData] = useState({
    amount: "",
    paymentMethod: PaymentMethod.CASH,
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, loading: queryLoading, error: queryError, refetch } = useQuery(GET_SAVINGS_ACCOUNT, {
    variables: { id: accountId },
  });

  const [withdraw, { loading }] = useMutation(WITHDRAW, {
    onCompleted: (data) => {
      router.push(`/savings/accounts/${accountId}`);
    },
    onError: (error) => {
      setErrors({ submit: error.message });
    },
  });

  const account = data?.savingsAccount;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }
    if (account && parseFloat(formData.amount) > Number(account.availableBalance || 0)) {
      newErrors.amount = `Insufficient funds. Available: ${formatCurrency(account.availableBalance)}`;
    }
    if (account?.product?.withdrawalLimit && parseFloat(formData.amount) > Number(account.product.withdrawalLimit)) {
      newErrors.amount = `Withdrawal limit is ${formatCurrency(account.product.withdrawalLimit)}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const input: WithdrawInput = {
      accountId: accountId,
      amount: parseFloat(formData.amount),
      paymentMethod: formData.paymentMethod as PaymentMethod,
    };

    if (formData.description) input.description = formData.description;

    await withdraw({
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

  if (queryLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-[3px] border-muted border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (queryError) {
    return <ErrorDisplay error={queryError} variant="full-page" onRetry={() => refetch()} />;
  }

  if (!account) {
    return <ErrorDisplay variant="full-page" title="Account Not Found" message="The savings account you're looking for doesn't exist." />;
  }

  const withdrawalFee = Number(account?.product?.withdrawalFee || 0);
  const totalDeduction = formData.amount ? parseFloat(formData.amount) + withdrawalFee : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/savings/accounts/${accountId}`}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Make Withdrawal</h1>
          <p className="text-muted-foreground mt-1">
            Account: {account.accountNumber} - {account.member?.firstName} {account.member?.lastName}
          </p>
        </div>
      </div>

      {/* Account Summary */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl p-6 text-white">
        <h2 className="text-lg font-semibold mb-2">{account.product?.productName}</h2>
        <p className="text-2xl font-bold tabular-nums mb-1">{formatCurrency(account.availableBalance)}</p>
        <p className="text-sm opacity-90">Available Balance</p>
        {account.product?.withdrawalLimit && (
          <p className="text-sm opacity-80 mt-2">
            Withdrawal Limit: {formatCurrency(account.product.withdrawalLimit)}
          </p>
        )}
      </div>

      {/* Warning */}
      {account.product?.minimumBalance && Number(account.balance || 0) < Number(account.product.minimumBalance) && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-700">Low Balance Warning</p>
            <p className="text-sm text-amber-600">
              Your balance is below the minimum required balance of {formatCurrency(account.product?.minimumBalance)}.
              Additional fees may apply.
            </p>
          </div>
        </div>
      )}

      {/* Withdrawal Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Withdrawal Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Amount (TZS) <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.amount ? "border-destructive" : "border-input"
                } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-lg`}
                placeholder="0"
                min="0"
                step="100"
                max={account.availableBalance}
                autoFocus
              />
              {errors.amount && (
                <p className="text-destructive text-sm mt-1">{errors.amount}</p>
              )}
              {withdrawalFee > 0 && (
                <p className="text-muted-foreground text-sm mt-1">
                  Withdrawal fee: {formatCurrency(withdrawalFee)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Payment Method <span className="text-destructive">*</span>
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value={PaymentMethod.CASH}>Cash</option>
                <option value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</option>
                <option value={PaymentMethod.MOBILE_MONEY}>Mobile Money</option>
                <option value={PaymentMethod.CHEQUE}>Cheque</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Add notes about this withdrawal..."
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        {formData.amount && parseFloat(formData.amount) > 0 && (
          <div className="bg-muted/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Transaction Preview</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Balance:</span>
                <span className="font-semibold">{formatCurrency(account.balance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Withdrawal Amount:</span>
                <span className="font-semibold text-orange-600">
                  -{formatCurrency(parseFloat(formData.amount))}
                </span>
              </div>
              {withdrawalFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Withdrawal Fee:</span>
                  <span className="font-semibold text-orange-600">
                    -{formatCurrency(withdrawalFee)}
                  </span>
                </div>
              )}
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="font-semibold">New Balance:</span>
                <span className="text-xl font-bold text-orange-600">
                  {formatCurrency(Number(account.balance || 0) - totalDeduction)}
                </span>
              </div>
            </div>
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
            className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5" />
                Complete Withdrawal
              </>
            )}
          </button>
          <Link
            href={`/savings/accounts/${accountId}`}
            className="inline-flex items-center justify-center px-6 py-3 text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
