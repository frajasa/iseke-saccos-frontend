"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { DEPOSIT, GET_SAVINGS_ACCOUNT, INITIATE_MOBILE_DEPOSIT } from "@/lib/graphql/queries";
import { DepositInput, PaymentMethod, PaymentProvider } from "@/lib/types";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, DollarSign, Loader2, Smartphone, CheckCircle } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import ErrorDisplay from "@/components/ui/ErrorDisplay";

export default function DepositPage() {
  const router = useRouter();
  const { id: accountId } = useParams<{ id: string }>();
  const [formData, setFormData] = useState({
    amount: "",
    paymentMethod: PaymentMethod.CASH,
    referenceNumber: "",
    description: "",
    phoneNumber: "",
    mobileProvider: "MPESA" as PaymentProvider,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mobileResult, setMobileResult] = useState<any>(null);

  const { data, loading: queryLoading, error: queryError, refetch } = useQuery(GET_SAVINGS_ACCOUNT, {
    variables: { id: accountId },
  });

  const [deposit, { loading }] = useMutation(DEPOSIT, {
    onCompleted: () => {
      router.push(`/savings/accounts/${accountId}`);
    },
    onError: (error) => {
      setErrors({ submit: error.message });
    },
  });

  const [initiateMobileDeposit, { loading: mobileLoading }] = useMutation(INITIATE_MOBILE_DEPOSIT, {
    onCompleted: (data) => {
      setMobileResult(data.initiateMobileDeposit);
    },
    onError: (error) => {
      setErrors({ submit: error.message });
    },
  });

  const isMobilePayment = formData.paymentMethod === PaymentMethod.MPESA ||
    formData.paymentMethod === PaymentMethod.TIGOPESA ||
    formData.paymentMethod === PaymentMethod.NMB_BANK;

  const account = data?.savingsAccount;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }
    if (isMobilePayment && !formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required for mobile payments";
    }
    if (!isMobilePayment && formData.paymentMethod !== PaymentMethod.CASH && !formData.referenceNumber) {
      newErrors.referenceNumber = "Reference number is required for non-cash payments";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (isMobilePayment) {
      const providerMap: Record<string, PaymentProvider> = {
        [PaymentMethod.MPESA]: "MPESA" as PaymentProvider,
        [PaymentMethod.TIGOPESA]: "TIGOPESA" as PaymentProvider,
        [PaymentMethod.NMB_BANK]: "NMB_BANK" as PaymentProvider,
      };
      await initiateMobileDeposit({
        variables: {
          input: {
            accountId,
            amount: parseFloat(formData.amount),
            provider: providerMap[formData.paymentMethod],
            phoneNumber: formData.phoneNumber,
            description: formData.description || undefined,
          },
        },
      });
      return;
    }

    const input: DepositInput = {
      accountId: accountId,
      amount: parseFloat(formData.amount),
      paymentMethod: formData.paymentMethod as PaymentMethod,
    };

    if (formData.referenceNumber) input.referenceNumber = formData.referenceNumber;
    if (formData.description) input.description = formData.description;

    await deposit({
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
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Make Deposit</h1>
          <p className="text-muted-foreground mt-1">
            Account: {account.accountNumber} - {account.member?.firstName} {account.member?.lastName}
          </p>
        </div>
      </div>

      {/* Account Summary */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
        <h2 className="text-lg font-semibold mb-2">{account.product?.productName}</h2>
        <p className="text-2xl font-bold tabular-nums mb-1">{formatCurrency(account.balance)}</p>
        <p className="text-sm opacity-90">Current Balance</p>
      </div>

      {/* Deposit Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Deposit Details
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
                autoFocus
              />
              {errors.amount && (
                <p className="text-destructive text-sm mt-1">{errors.amount}</p>
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
                <option value={PaymentMethod.MOBILE_MONEY}>Mobile Money (Manual)</option>
                <option value={PaymentMethod.CHEQUE}>Cheque</option>
                <option value={PaymentMethod.CARD}>Card</option>
                <option value={PaymentMethod.MPESA}>M-Pesa (STK Push)</option>
                <option value={PaymentMethod.TIGOPESA}>Tigopesa (Push Pay)</option>
                <option value={PaymentMethod.NMB_BANK}>NMB Bank (Direct)</option>
              </select>
            </div>

            {isMobilePayment && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone Number <span className="text-destructive">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.phoneNumber ? "border-destructive" : "border-input"
                  } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="255XXXXXXXXX"
                />
                {errors.phoneNumber && (
                  <p className="text-destructive text-sm mt-1">{errors.phoneNumber}</p>
                )}
                <p className="text-muted-foreground text-xs mt-1">Format: 255XXXXXXXXX (e.g. 255712345678)</p>
              </div>
            )}

            {!isMobilePayment && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Reference Number {formData.paymentMethod !== PaymentMethod.CASH && <span className="text-destructive">*</span>}
                </label>
                <input
                  type="text"
                  name="referenceNumber"
                  value={formData.referenceNumber}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.referenceNumber ? "border-destructive" : "border-input"
                  } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="Transaction reference"
                />
                {errors.referenceNumber && (
                  <p className="text-destructive text-sm mt-1">{errors.referenceNumber}</p>
                )}
              </div>
            )}

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
                placeholder="Add notes about this deposit..."
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
                <span className="text-muted-foreground">Deposit Amount:</span>
                <span className="font-semibold text-green-600">
                  +{formatCurrency(parseFloat(formData.amount))}
                </span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="font-semibold">New Balance:</span>
                <span className="text-xl font-bold text-green-600">
                  {formatCurrency(Number(account.balance || 0) + parseFloat(formData.amount))}
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

        {/* Mobile Payment Result */}
        {mobileResult && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-foreground">Payment Request Sent</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              A payment prompt has been sent to <span className="font-semibold">{mobileResult.phoneNumber}</span>. Please confirm on your phone.
            </p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Request #</span>
                <span className="font-medium">{mobileResult.requestNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">{formatCurrency(mobileResult.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium text-amber-600">{mobileResult.status}</span>
              </div>
            </div>
            <Link
              href={`/dashboard/payments/requests/${mobileResult.id}`}
              className="inline-flex items-center gap-2 mt-4 text-sm text-primary hover:underline"
            >
              Track Payment Status
            </Link>
          </div>
        )}

        {/* Action Buttons */}
        {!mobileResult && (
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={loading || mobileLoading}
              className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(loading || mobileLoading) ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : isMobilePayment ? (
                <>
                  <Smartphone className="w-5 h-5" />
                  Send Payment Request
                </>
              ) : (
                <>
                  <DollarSign className="w-5 h-5" />
                  Complete Deposit
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
        )}
      </form>
    </div>
  );
}
