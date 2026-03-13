"use client";

import { useState } from "react";
import { useQuery, useLazyQuery } from "@apollo/client";
import { GET_LOAN_PRODUCTS, PREVIEW_LOAN_SCHEDULE } from "@/lib/graphql/queries";
import { formatCurrency } from "@/lib/utils";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import { Calculator, ArrowRightLeft } from "lucide-react";

interface ScheduleEntry {
  installmentNumber: number;
  dueDate: string;
  principalDue: number;
  interestDue: number;
  totalDue: number;
  remainingBalance: number;
  isBalloon: boolean;
}

type ScheduleType = "STANDARD" | "BALLOON";
type Frequency = "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "QUARTERLY";

export default function SchedulePreviewPage() {
  // Form state
  const [productId, setProductId] = useState("");
  const [principal, setPrincipal] = useState("");
  const [termMonths, setTermMonths] = useState("");
  const [interestRateOverride, setInterestRateOverride] = useState("");
  const [frequencyOverride, setFrequencyOverride] = useState<Frequency | "">("");
  const [firstPaymentDate, setFirstPaymentDate] = useState("");
  const [paymentDayOfMonth, setPaymentDayOfMonth] = useState("");
  const [scheduleTypeOverride, setScheduleTypeOverride] = useState<ScheduleType | "">("");
  const [balloonPercentage, setBalloonPercentage] = useState("");

  // Schedule results
  const [schedule, setSchedule] = useState<ScheduleEntry[] | null>(null);

  // Comparison mode
  const [compareMode, setCompareMode] = useState(false);
  const [comparisonSchedule, setComparisonSchedule] = useState<{
    label: string;
    entries: ScheduleEntry[];
  } | null>(null);

  // Queries
  const { data: productsData, loading: productsLoading, error: productsError } = useQuery(GET_LOAN_PRODUCTS);
  const [fetchSchedule, { loading: scheduleLoading, error: scheduleError }] = useLazyQuery(PREVIEW_LOAN_SCHEDULE, {
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      const parsed: ScheduleEntry[] = typeof data.previewLoanSchedule === "string"
        ? JSON.parse(data.previewLoanSchedule)
        : data.previewLoanSchedule;

      if (compareMode && schedule) {
        setComparisonSchedule({
          label: getScheduleLabel(),
          entries: parsed,
        });
        setCompareMode(false);
      } else {
        setSchedule(parsed);
        setComparisonSchedule(null);
      }
    },
  });

  const products = productsData?.loanProducts || [];
  const selectedProduct = products.find((p: any) => p.id === productId);

  function getScheduleLabel(): string {
    const type = scheduleTypeOverride || "STANDARD";
    const freq = frequencyOverride || "MONTHLY";
    return `${type} / ${freq}`;
  }

  function handlePreview() {
    if (!productId || !principal || !termMonths) return;

    const variables: Record<string, any> = {
      productId,
      principal: parseFloat(principal),
      termMonths: parseInt(termMonths),
    };

    if (interestRateOverride) variables.interestRateOverride = parseFloat(interestRateOverride);
    if (frequencyOverride) variables.frequencyOverride = frequencyOverride;
    if (firstPaymentDate) variables.firstPaymentDate = firstPaymentDate;
    if (paymentDayOfMonth) variables.paymentDayOfMonth = parseInt(paymentDayOfMonth);
    if (scheduleTypeOverride) variables.scheduleTypeOverride = scheduleTypeOverride;
    if (scheduleTypeOverride === "BALLOON" && balloonPercentage) {
      variables.balloonPercentageOverride = parseFloat(balloonPercentage);
    }

    fetchSchedule({ variables });
  }

  function handleCompare() {
    setCompareMode(true);
    handlePreview();
  }

  // Summary calculations
  function computeSummary(entries: ScheduleEntry[]) {
    const totalPrincipal = entries.reduce((sum, e) => sum + Number(e.principalDue || 0), 0);
    const totalInterest = entries.reduce((sum, e) => sum + Number(e.interestDue || 0), 0);
    const totalPayments = entries.reduce((sum, e) => sum + Number(e.totalDue || 0), 0);
    const principalNum = parseFloat(principal) || 0;
    const effectiveRate = principalNum > 0 ? ((totalInterest / principalNum) * 100) : 0;
    return { totalPrincipal, totalInterest, totalPayments, effectiveRate };
  }

  const summary = schedule ? computeSummary(schedule) : null;
  const comparisonSummary = comparisonSchedule ? computeSummary(comparisonSchedule.entries) : null;

  if (productsError) return <ErrorDisplay error={productsError} />;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Repayment Schedule Preview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Preview and compare different loan repayment schedules before adoption
        </p>
      </div>

      {/* Form Section */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-5">
        <h2 className="text-sm font-semibold text-foreground">Loan Parameters</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Product Selector */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Loan Product <span className="text-destructive">*</span>
            </label>
            <select
              value={productId}
              onChange={(e) => {
                setProductId(e.target.value);
                const prod = products.find((p: any) => p.id === e.target.value);
                if (prod) {
                  setInterestRateOverride("");
                }
              }}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              disabled={productsLoading}
            >
              <option value="">
                {productsLoading ? "Loading products..." : "Select a product"}
              </option>
              {products.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.productName} ({p.productCode}) - {(Number(p.interestRate) * 100).toFixed(1)}%
                </option>
              ))}
            </select>
            {selectedProduct && (
              <p className="text-[10px] text-muted-foreground mt-1">
                Range: {formatCurrency(selectedProduct.minimumAmount)} - {formatCurrency(selectedProduct.maximumAmount)}
                {" | "}Term: {selectedProduct.minimumTermMonths}-{selectedProduct.maximumTermMonths} months
              </p>
            )}
          </div>

          {/* Principal Amount */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Principal Amount (TZS) <span className="text-destructive">*</span>
            </label>
            <input
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              placeholder="e.g. 5000000"
              min="0"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
          </div>

          {/* Term Months */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Term (Months) <span className="text-destructive">*</span>
            </label>
            <input
              type="number"
              value={termMonths}
              onChange={(e) => setTermMonths(e.target.value)}
              placeholder="e.g. 12"
              min="1"
              max="360"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
          </div>

          {/* Interest Rate Override */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Interest Rate Override (%)
            </label>
            <input
              type="number"
              value={interestRateOverride}
              onChange={(e) => setInterestRateOverride(e.target.value)}
              placeholder={selectedProduct ? `Default: ${(Number(selectedProduct.interestRate) * 100).toFixed(1)}%` : "Optional"}
              min="0"
              max="100"
              step="0.1"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Leave blank to use product default rate
            </p>
          </div>

          {/* Frequency Override */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Repayment Frequency
            </label>
            <select
              value={frequencyOverride}
              onChange={(e) => setFrequencyOverride(e.target.value as Frequency | "")}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            >
              <option value="">Product default</option>
              <option value="WEEKLY">Weekly</option>
              <option value="BIWEEKLY">Bi-weekly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="QUARTERLY">Quarterly</option>
            </select>
          </div>

          {/* First Payment Date */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              First Payment Date
            </label>
            <input
              type="date"
              value={firstPaymentDate}
              onChange={(e) => setFirstPaymentDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
          </div>

          {/* Payment Day of Month */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Payment Day of Month
            </label>
            <input
              type="number"
              value={paymentDayOfMonth}
              onChange={(e) => setPaymentDayOfMonth(e.target.value)}
              placeholder="1-28"
              min="1"
              max="28"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
          </div>

          {/* Schedule Type Override */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Schedule Type
            </label>
            <select
              value={scheduleTypeOverride}
              onChange={(e) => setScheduleTypeOverride(e.target.value as ScheduleType | "")}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            >
              <option value="">Product default</option>
              <option value="STANDARD">Standard (Equal Installments)</option>
              <option value="BALLOON">Balloon Payment</option>
            </select>
          </div>

          {/* Balloon Percentage - shown only when BALLOON selected */}
          {scheduleTypeOverride === "BALLOON" && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Balloon Percentage (%)
              </label>
              <input
                type="number"
                value={balloonPercentage}
                onChange={(e) => setBalloonPercentage(e.target.value)}
                placeholder="e.g. 30"
                min="0"
                max="100"
                step="1"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Percentage of principal due as final balloon payment
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handlePreview}
            disabled={!productId || !principal || !termMonths || scheduleLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Calculator className="w-4 h-4" />
            {scheduleLoading && !compareMode ? "Generating..." : "Preview Schedule"}
          </button>

          {schedule && (
            <button
              onClick={handleCompare}
              disabled={!productId || !principal || !termMonths || scheduleLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-border"
            >
              <ArrowRightLeft className="w-4 h-4" />
              {scheduleLoading && compareMode ? "Generating..." : "Compare with Current"}
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {scheduleError && <ErrorDisplay error={scheduleError} />}

      {/* Summary Section */}
      {summary && (
        <div className={`grid gap-4 ${comparisonSummary ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-2 sm:grid-cols-4"}`}>
          {/* Primary summary */}
          {comparisonSummary ? (
            <>
              {/* Side-by-side summaries */}
              <div className="bg-card rounded-xl border border-border p-5 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Current Preview
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <SummaryCard label="Total Principal" value={formatCurrency(summary.totalPrincipal)} />
                  <SummaryCard label="Total Interest" value={formatCurrency(summary.totalInterest)} />
                  <SummaryCard label="Total Payments" value={formatCurrency(summary.totalPayments)} />
                  <SummaryCard label="Effective Rate" value={`${summary.effectiveRate.toFixed(2)}%`} />
                </div>
              </div>
              <div className="bg-card rounded-xl border border-primary/30 p-5 space-y-3">
                <h3 className="text-sm font-semibold text-primary">
                  Comparison: {comparisonSchedule?.label}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <SummaryCard label="Total Principal" value={formatCurrency(comparisonSummary.totalPrincipal)} />
                  <SummaryCard label="Total Interest" value={formatCurrency(comparisonSummary.totalInterest)} />
                  <SummaryCard label="Total Payments" value={formatCurrency(comparisonSummary.totalPayments)} />
                  <SummaryCard label="Effective Rate" value={`${comparisonSummary.effectiveRate.toFixed(2)}%`} />
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Interest difference:{" "}
                    <span className={comparisonSummary.totalInterest > summary.totalInterest ? "text-destructive font-medium" : "text-green-600 font-medium"}>
                      {comparisonSummary.totalInterest > summary.totalInterest ? "+" : ""}
                      {formatCurrency(comparisonSummary.totalInterest - summary.totalInterest)}
                    </span>
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <SummaryCard label="Total Principal" value={formatCurrency(summary.totalPrincipal)} />
              <SummaryCard label="Total Interest" value={formatCurrency(summary.totalInterest)} />
              <SummaryCard label="Total Payments" value={formatCurrency(summary.totalPayments)} />
              <SummaryCard label="Effective Rate" value={`${summary.effectiveRate.toFixed(2)}%`} />
            </>
          )}
        </div>
      )}

      {/* Schedule Tables */}
      {schedule && (
        <div className={comparisonSchedule ? "grid grid-cols-1 lg:grid-cols-2 gap-4" : ""}>
          {/* Primary schedule table */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {comparisonSchedule && (
              <div className="px-4 py-2.5 bg-muted/30 border-b border-border">
                <h3 className="text-sm font-semibold">Current Preview</h3>
              </div>
            )}
            <ScheduleTable entries={schedule} />
          </div>

          {/* Comparison schedule table */}
          {comparisonSchedule && (
            <div className="bg-card rounded-xl border border-primary/30 overflow-hidden">
              <div className="px-4 py-2.5 bg-primary/5 border-b border-primary/20">
                <h3 className="text-sm font-semibold text-primary">
                  Comparison: {comparisonSchedule?.label}
                </h3>
              </div>
              <ScheduleTable entries={comparisonSchedule.entries} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold text-foreground mt-1">{value}</p>
    </div>
  );
}

function ScheduleTable({ entries }: { entries: ScheduleEntry[] }) {
  return (
    <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 sticky top-0">
          <tr>
            <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground">#</th>
            <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground">Due Date</th>
            <th className="text-right px-3 py-2.5 text-xs font-medium text-muted-foreground">Principal</th>
            <th className="text-right px-3 py-2.5 text-xs font-medium text-muted-foreground">Interest</th>
            <th className="text-right px-3 py-2.5 text-xs font-medium text-muted-foreground">Total Due</th>
            <th className="text-right px-3 py-2.5 text-xs font-medium text-muted-foreground">Remaining</th>
            <th className="text-center px-3 py-2.5 text-xs font-medium text-muted-foreground">Type</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {entries.map((entry) => (
            <tr
              key={entry.installmentNumber}
              className={entry.isBalloon ? "bg-amber-50 dark:bg-amber-950/20" : "hover:bg-muted/30"}
            >
              <td className="px-3 py-2 text-muted-foreground">{entry.installmentNumber}</td>
              <td className="px-3 py-2">{entry.dueDate}</td>
              <td className="px-3 py-2 text-right font-medium">{formatCurrency(entry.principalDue)}</td>
              <td className="px-3 py-2 text-right text-muted-foreground">{formatCurrency(entry.interestDue)}</td>
              <td className="px-3 py-2 text-right font-semibold">{formatCurrency(entry.totalDue)}</td>
              <td className="px-3 py-2 text-right">{formatCurrency(entry.remainingBalance)}</td>
              <td className="px-3 py-2 text-center">
                {entry.isBalloon && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
                    BALLOON
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
