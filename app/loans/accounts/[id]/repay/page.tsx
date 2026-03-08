"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { REPAY_LOAN, GET_LOAN_ACCOUNT, GET_LOAN_TRANSACTIONS, INITIATE_MOBILE_LOAN_REPAYMENT, GET_LOAN_REPAYMENT_SCHEDULE } from "@/lib/graphql/queries";
import { LoanRepaymentInput, PaymentMethod, PaymentProvider, RepaymentSchedule } from "@/lib/types";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, DollarSign, Loader2, AlertCircle, Smartphone, CheckCircle, CalendarClock } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function LoanRepaymentPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState({
    amount: "",
    paymentMethod: PaymentMethod.CASH,
    referenceNumber: "",
    phoneNumber: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mobileResult, setMobileResult] = useState<any>(null);

  const { data, loading: queryLoading } = useQuery(GET_LOAN_ACCOUNT, {
    variables: { id: id },
  });

  const { data: scheduleData } = useQuery(GET_LOAN_REPAYMENT_SCHEDULE, {
    variables: { loanId: id, page: 0, size: 100 },
  });

  const nextInstallment = useMemo(() => {
    const schedule: RepaymentSchedule[] = scheduleData?.loanRepaymentSchedule?.content || [];
    // Find the next unpaid or partially paid installment
    const pending = schedule
      .filter((s) => s.status === "PENDING" || s.status === "PARTIAL" || s.status === "OVERDUE")
      .sort((a, b) => a.installmentNumber - b.installmentNumber);
    if (pending.length === 0) return null;
    const next = pending[0];
    const remainingDue = next.totalDue - next.totalPaid;
    return { ...next, remainingDue: Math.max(0, remainingDue) };
  }, [scheduleData]);

  // Auto-populate amount with next installment remaining when schedule first loads
  const amountAutoSet = useRef(false);
  useEffect(() => {
    if (!amountAutoSet.current && nextInstallment && nextInstallment.remainingDue > 0) {
      setFormData((prev) => ({ ...prev, amount: nextInstallment.remainingDue.toFixed(2) }));
      amountAutoSet.current = true;
    }
  }, [nextInstallment]);

  const refetchAfterRepayment = [
    { query: GET_LOAN_ACCOUNT, variables: { id } },
    { query: GET_LOAN_REPAYMENT_SCHEDULE, variables: { loanId: id, page: 0, size: 100 } },
    { query: GET_LOAN_TRANSACTIONS, variables: { loanId: id } },
  ];

  const [repayLoan, { loading }] = useMutation(REPAY_LOAN, {
    refetchQueries: refetchAfterRepayment,
    onCompleted: () => {
      router.push(`/loans/accounts/${id}`);
    },
    onError: (error) => {
      setErrors({ submit: error.message });
    },
  });

  const [initiateMobileRepayment, { loading: mobileLoading }] = useMutation(INITIATE_MOBILE_LOAN_REPAYMENT, {
    refetchQueries: refetchAfterRepayment,
    onCompleted: (data) => {
      setMobileResult(data.initiateMobileLoanRepayment);
    },
    onError: (error) => {
      setErrors({ submit: error.message });
    },
  });

  const isMobilePayment = formData.paymentMethod === PaymentMethod.MPESA ||
    formData.paymentMethod === PaymentMethod.TIGOPESA ||
    formData.paymentMethod === PaymentMethod.NMB_BANK;

  const loan = data?.loanAccount;

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
      await initiateMobileRepayment({
        variables: {
          input: {
            loanId: id,
            amount: parseFloat(formData.amount),
            provider: providerMap[formData.paymentMethod],
            phoneNumber: formData.phoneNumber,
          },
        },
      });
      return;
    }

    const input: LoanRepaymentInput = {
      loanId: id,
      amount: parseFloat(formData.amount),
      paymentMethod: formData.paymentMethod as PaymentMethod,
    };

    if (formData.referenceNumber) input.referenceNumber = formData.referenceNumber;

    await repayLoan({
      variables: { input },
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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

  const setQuickAmount = (amount: number) => {
    setFormData((prev) => ({
      ...prev,
      amount: amount.toString(),
    }));
    if (errors.amount) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.amount;
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

  if (!loan) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Loan Not Found</h2>
          <Link
            href="/members"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Members
          </Link>
        </div>
      </div>
    );
  }

  const totalOutstanding = Number(loan.outstandingPrincipal || 0) + Number(loan.outstandingInterest || 0) +
                          Number(loan.outstandingFees || 0) + Number(loan.outstandingPenalties || 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/loans/accounts/${id}`}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Make Loan Repayment</h1>
          <p className="text-muted-foreground mt-1">
            Loan: {loan.loanNumber} - {loan.member?.firstName} {loan.member?.lastName}
          </p>
        </div>
      </div>

      {/* Loan Summary */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
        <h2 className="text-lg font-semibold mb-2">{loan.product?.productName}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm opacity-80">Principal Outstanding</p>
            <p className="text-2xl font-bold">{formatCurrency(loan.outstandingPrincipal)}</p>
          </div>
          <div>
            <p className="text-sm opacity-80">Interest Outstanding</p>
            <p className="text-xl font-bold">{formatCurrency(loan.outstandingInterest)}</p>
          </div>
          <div>
            <p className="text-sm opacity-80">Total Outstanding</p>
            <p className="text-2xl font-bold">{formatCurrency(totalOutstanding)}</p>
          </div>
        </div>
        {loan.nextPaymentDate && (
          <p className="text-sm opacity-90">
            Next Payment Due: {formatDate(loan.nextPaymentDate)}
          </p>
        )}
        {loan.daysInArrears > 0 && (
          <div className="mt-2 bg-red-600/30 rounded-lg p-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm font-semibold">
              {loan.daysInArrears} days overdue! Penalties: {formatCurrency(loan.outstandingPenalties)}
            </p>
          </div>
        )}
      </div>

      {/* Repayment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quick Amount Buttons */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Quick Payment Options
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {nextInstallment && nextInstallment.remainingDue > 0 && (
              <button
                type="button"
                onClick={() => setQuickAmount(nextInstallment.remainingDue)}
                className="p-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors ring-2 ring-amber-400 ring-offset-2 ring-offset-background"
              >
                <div className="flex items-center gap-1 mb-1">
                  <CalendarClock className="w-3 h-3 opacity-80" />
                  <p className="text-xs opacity-80">Next Installment</p>
                </div>
                <p className="font-semibold">{formatCurrency(nextInstallment.remainingDue)}</p>
                <p className="text-[10px] opacity-70">Due {formatDate(nextInstallment.dueDate)}</p>
              </button>
            )}
            <button
              type="button"
              onClick={() => setQuickAmount(totalOutstanding)}
              className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <p className="text-xs opacity-80">Full Payment</p>
              <p className="font-semibold">{formatCurrency(totalOutstanding)}</p>
            </button>
            <button
              type="button"
              onClick={() => setQuickAmount(Number(loan.outstandingPrincipal || 0) + Number(loan.outstandingInterest || 0))}
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <p className="text-xs opacity-80">Principal + Interest</p>
              <p className="font-semibold">{formatCurrency(Number(loan.outstandingPrincipal || 0) + Number(loan.outstandingInterest || 0))}</p>
            </button>
            <button
              type="button"
              onClick={() => setQuickAmount(Number(loan.outstandingPrincipal || 0))}
              className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <p className="text-xs opacity-80">Principal Only</p>
              <p className="font-semibold">{formatCurrency(loan.outstandingPrincipal)}</p>
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, amount: "" }))}
              className="p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <p className="text-xs opacity-80">Custom Amount</p>
              <p className="font-semibold">Enter Manually</p>
            </button>
          </div>

          {/* Next Installment Breakdown */}
          {nextInstallment && nextInstallment.remainingDue > 0 && (
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <h3 className="text-sm font-semibold text-foreground mb-2">
                Installment #{nextInstallment.installmentNumber} Breakdown
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Principal Due</p>
                  <p className="font-medium">{formatCurrency(nextInstallment.principalDue)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Interest Due</p>
                  <p className="font-medium">{formatCurrency(nextInstallment.interestDue)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Due</p>
                  <p className="font-medium">{formatCurrency(nextInstallment.totalDue)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Already Paid</p>
                  <p className="font-medium">{formatCurrency(nextInstallment.totalPaid)}</p>
                </div>
              </div>
              {nextInstallment.status === "OVERDUE" && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400 font-medium">
                  This installment is overdue
                </p>
              )}
            </div>
          )}
        </div>

        {/* Payment Details */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Payment Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Payment Amount (TZS) <span className="text-destructive">*</span>
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
                step="0.01"
                autoFocus
              />
              {errors.amount && (
                <p className="text-destructive text-sm mt-1">{errors.amount}</p>
              )}
              <p className="text-muted-foreground text-sm mt-1">
                Maximum: {formatCurrency(totalOutstanding)}
              </p>
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
          </div>
        </div>

        {/* Payment Allocation Preview */}
        {formData.amount && parseFloat(formData.amount) > 0 && (
          <div className="bg-muted/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Payment Allocation</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Payment will be allocated in the following order: Penalties → Fees → Interest → Principal
            </p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Outstanding:</span>
                <span className="font-semibold">{formatCurrency(totalOutstanding)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Amount:</span>
                <span className="font-semibold text-green-600">
                  -{formatCurrency(parseFloat(formData.amount))}
                </span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="font-semibold">Remaining Balance:</span>
                <span className="text-xl font-bold">
                  {formatCurrency(Math.max(0, totalOutstanding - parseFloat(formData.amount)))}
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
                  Complete Repayment
                </>
              )}
            </button>
            <Link
              href={`/loans/accounts/${id}`}
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
