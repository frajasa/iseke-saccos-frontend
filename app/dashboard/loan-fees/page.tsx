"use client";

import { useState } from "react";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
import {
  GET_LOAN_PRODUCTS,
  GET_LOAN_FEE_CONFIGS,
  CREATE_LOAN_FEE_CONFIG,
  UPDATE_LOAN_FEE_CONFIG,
  DELETE_LOAN_FEE_CONFIG,
  CALCULATE_LOAN_FEES,
  GET_MEMBERS,
} from "@/lib/graphql/queries";
import { LoanProduct, LoanFeeConfig } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Calculator } from "lucide-react";

const FEE_TYPES = ["PROCESSING", "INSURANCE", "DISBURSEMENT", "SERVICE", "COMMISSION"];
const CHARGE_ON_OPTIONS = ["DISBURSEMENT", "APPROVAL", "MONTHLY"];

interface FeeForm {
  id?: string;
  feeName: string;
  feeType: string;
  rate: string;
  fixedAmount: string;
  minAmount: string;
  maxAmount: string;
  isRefundable: boolean;
  chargeOn: string;
}

const emptyForm: FeeForm = {
  feeName: "",
  feeType: "",
  rate: "",
  fixedAmount: "",
  minAmount: "",
  maxAmount: "",
  isRefundable: false,
  chargeOn: "DISBURSEMENT",
};

export default function LoanFeesPage() {
  const [selectedProductId, setSelectedProductId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FeeForm>(emptyForm);
  const [isEditing, setIsEditing] = useState(false);

  // Fee calculator state
  const [calcProductId, setCalcProductId] = useState("");
  const [calcMemberId, setCalcMemberId] = useState("");
  const [calcAmount, setCalcAmount] = useState("");
  const [calcResult, setCalcResult] = useState<number | null>(null);

  // Queries
  const { data: productsData, loading: productsLoading, error: productsError } = useQuery(GET_LOAN_PRODUCTS);
  const { data: feesData, loading: feesLoading, refetch: refetchFees } = useQuery(GET_LOAN_FEE_CONFIGS, {
    variables: { productId: selectedProductId },
    skip: !selectedProductId,
  });
  const { data: membersData } = useQuery(GET_MEMBERS, {
    variables: { page: 0, size: 200 },
  });

  const [calculateFees, { loading: calcLoading }] = useLazyQuery(CALCULATE_LOAN_FEES, {
    onCompleted: (data) => setCalcResult(data.calculateLoanFees),
    onError: (err) => toast.error(err.message),
  });

  // Mutations
  const [createFee] = useMutation(CREATE_LOAN_FEE_CONFIG, {
    onCompleted: () => {
      toast.success("Fee configuration created");
      refetchFees();
      closeModal();
    },
    onError: (err) => toast.error(err.message),
  });

  const [updateFee] = useMutation(UPDATE_LOAN_FEE_CONFIG, {
    onCompleted: () => {
      toast.success("Fee configuration updated");
      refetchFees();
      closeModal();
    },
    onError: (err) => toast.error(err.message),
  });

  const [deleteFee] = useMutation(DELETE_LOAN_FEE_CONFIG, {
    onCompleted: () => {
      toast.success("Fee configuration deleted");
      refetchFees();
    },
    onError: (err) => toast.error(err.message),
  });

  const products: LoanProduct[] = productsData?.loanProducts || [];
  const fees: LoanFeeConfig[] = feesData?.loanFeeConfigs || [];
  const members = membersData?.members?.content || [];

  const closeModal = () => {
    setShowModal(false);
    setForm(emptyForm);
    setIsEditing(false);
  };

  const openAddModal = () => {
    setForm(emptyForm);
    setIsEditing(false);
    setShowModal(true);
  };

  const openEditModal = (fee: LoanFeeConfig) => {
    setForm({
      id: fee.id,
      feeName: fee.feeName,
      feeType: fee.feeType,
      rate: fee.rate?.toString() || "",
      fixedAmount: fee.fixedAmount?.toString() || "",
      minAmount: fee.minAmount?.toString() || "",
      maxAmount: fee.maxAmount?.toString() || "",
      isRefundable: fee.isRefundable,
      chargeOn: fee.chargeOn || "DISBURSEMENT",
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!form.feeName || !form.feeType) {
      toast.error("Fee name and fee type are required");
      return;
    }

    if (isEditing && form.id) {
      updateFee({
        variables: {
          id: form.id,
          feeName: form.feeName,
          rate: form.rate ? parseFloat(form.rate) : null,
          fixedAmount: form.fixedAmount ? parseFloat(form.fixedAmount) : null,
          minAmount: form.minAmount ? parseFloat(form.minAmount) : null,
          maxAmount: form.maxAmount ? parseFloat(form.maxAmount) : null,
          isRefundable: form.isRefundable,
          chargeOn: form.chargeOn,
          isActive: true,
        },
      });
    } else {
      if (!selectedProductId) {
        toast.error("Please select a product first");
        return;
      }
      createFee({
        variables: {
          feeName: form.feeName,
          feeType: form.feeType,
          productId: selectedProductId,
          rate: form.rate ? parseFloat(form.rate) : null,
          fixedAmount: form.fixedAmount ? parseFloat(form.fixedAmount) : null,
          minAmount: form.minAmount ? parseFloat(form.minAmount) : null,
          maxAmount: form.maxAmount ? parseFloat(form.maxAmount) : null,
          isRefundable: form.isRefundable,
          chargeOn: form.chargeOn,
        },
      });
    }
  };

  const handleDelete = (fee: LoanFeeConfig) => {
    if (confirm(`Delete fee "${fee.feeName}"?`)) {
      deleteFee({ variables: { id: fee.id } });
    }
  };

  const handleCalculate = () => {
    if (!calcProductId || !calcAmount) {
      toast.error("Product and loan amount are required");
      return;
    }
    calculateFees({
      variables: {
        productId: calcProductId,
        memberId: calcMemberId || null,
        loanAmount: parseFloat(calcAmount),
      },
    });
  };

  if (productsError) return <ErrorDisplay error={productsError} />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Loan Fees & Commissions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure fee structures for loan products
          </p>
        </div>
        <button
          onClick={openAddModal}
          disabled={!selectedProductId}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" /> Add Fee
        </button>
      </div>

      {/* Product Selector */}
      <div className="bg-card rounded-xl border border-border p-4">
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          Select Loan Product
        </label>
        <select
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
          className="w-full max-w-md px-3 py-2 rounded-lg border border-border bg-background text-sm"
        >
          <option value="">Choose a product...</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.productName} ({p.productCode})
            </option>
          ))}
        </select>
      </div>

      {/* Fee Configs Table */}
      {selectedProductId && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-3 border-b border-border bg-muted/50">
            <h3 className="font-semibold text-sm">
              Fee Configurations for{" "}
              {products.find((p) => p.id === selectedProductId)?.productName}
            </h3>
          </div>
          {feesLoading ? (
            <div className="p-8 text-center text-muted-foreground animate-pulse">
              Loading fees...
            </div>
          ) : fees.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No fee configurations for this product
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-2.5 text-xs font-semibold text-muted-foreground uppercase">
                      Fee Name
                    </th>
                    <th className="text-left px-6 py-2.5 text-xs font-semibold text-muted-foreground uppercase">
                      Type
                    </th>
                    <th className="text-right px-6 py-2.5 text-xs font-semibold text-muted-foreground uppercase">
                      Rate (%)
                    </th>
                    <th className="text-right px-6 py-2.5 text-xs font-semibold text-muted-foreground uppercase">
                      Fixed Amount
                    </th>
                    <th className="text-right px-6 py-2.5 text-xs font-semibold text-muted-foreground uppercase">
                      Min Amount
                    </th>
                    <th className="text-right px-6 py-2.5 text-xs font-semibold text-muted-foreground uppercase">
                      Max Amount
                    </th>
                    <th className="text-left px-6 py-2.5 text-xs font-semibold text-muted-foreground uppercase">
                      Charge On
                    </th>
                    <th className="text-center px-6 py-2.5 text-xs font-semibold text-muted-foreground uppercase">
                      Refundable
                    </th>
                    <th className="text-center px-6 py-2.5 text-xs font-semibold text-muted-foreground uppercase">
                      Active
                    </th>
                    <th className="text-right px-6 py-2.5 text-xs font-semibold text-muted-foreground uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fees.map((fee) => (
                    <tr
                      key={fee.id}
                      className="border-b border-border hover:bg-muted/30"
                    >
                      <td className="px-6 py-3 font-medium">{fee.feeName}</td>
                      <td className="px-6 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          {fee.feeType}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right font-mono text-sm">
                        {fee.rate != null ? `${fee.rate}%` : "-"}
                      </td>
                      <td className="px-6 py-3 text-right font-mono text-sm">
                        {fee.fixedAmount != null
                          ? formatCurrency(fee.fixedAmount)
                          : "-"}
                      </td>
                      <td className="px-6 py-3 text-right font-mono text-sm">
                        {fee.minAmount != null
                          ? formatCurrency(fee.minAmount)
                          : "-"}
                      </td>
                      <td className="px-6 py-3 text-right font-mono text-sm">
                        {fee.maxAmount != null
                          ? formatCurrency(fee.maxAmount)
                          : "-"}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        {fee.chargeOn?.replace(/_/g, " ") || "-"}
                      </td>
                      <td className="px-6 py-3 text-center">
                        {fee.isRefundable ? (
                          <span className="text-green-600">Yes</span>
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-center">
                        {fee.isActive ? (
                          <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                        ) : (
                          <span className="inline-block w-2 h-2 rounded-full bg-gray-400" />
                        )}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => openEditModal(fee)}
                            className="text-xs px-2 py-1 rounded border border-border hover:bg-muted"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(fee)}
                            className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Fee Calculator Section */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-3 border-b border-border bg-muted/50 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Fee Calculator</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Loan Product
              </label>
              <select
                value={calcProductId}
                onChange={(e) => {
                  setCalcProductId(e.target.value);
                  setCalcResult(null);
                }}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              >
                <option value="">Select product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.productName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Member (optional)
              </label>
              <select
                value={calcMemberId}
                onChange={(e) => {
                  setCalcMemberId(e.target.value);
                  setCalcResult(null);
                }}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              >
                <option value="">Any member...</option>
                {members.map((m: { id: string; firstName: string; lastName: string; memberNumber: string }) => (
                  <option key={m.id} value={m.id}>
                    {m.firstName} {m.lastName} ({m.memberNumber})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Loan Amount (TZS)
              </label>
              <input
                type="number"
                value={calcAmount}
                onChange={(e) => {
                  setCalcAmount(e.target.value);
                  setCalcResult(null);
                }}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                placeholder="e.g. 5000000"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleCalculate}
                disabled={calcLoading || !calcProductId || !calcAmount}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {calcLoading ? "Calculating..." : "Calculate Fees"}
              </button>
            </div>
          </div>
          {calcResult !== null && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Fees</span>
                <span className="text-xl font-bold text-foreground">
                  {formatCurrency(calcResult)}
                </span>
              </div>
              {calcAmount && (
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">
                    Net disbursement (after fees)
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {formatCurrency(parseFloat(calcAmount) - calcResult)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={closeModal}
        >
          <div
            className="bg-card rounded-xl border border-border p-6 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">
              {isEditing ? "Edit" : "Add"} Fee Configuration
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Fee Name
                </label>
                <input
                  type="text"
                  value={form.feeName}
                  onChange={(e) => setForm({ ...form, feeName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                  placeholder="e.g. Processing Fee"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Fee Type
                </label>
                <select
                  value={form.feeType}
                  onChange={(e) => setForm({ ...form, feeType: e.target.value })}
                  disabled={isEditing}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm disabled:opacity-60"
                >
                  <option value="">Select type...</option>
                  {FEE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.rate}
                    onChange={(e) => setForm({ ...form, rate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                    placeholder="e.g. 2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Fixed Amount (TZS)
                  </label>
                  <input
                    type="number"
                    value={form.fixedAmount}
                    onChange={(e) =>
                      setForm({ ...form, fixedAmount: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                    placeholder="e.g. 50000"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Min Amount (TZS)
                  </label>
                  <input
                    type="number"
                    value={form.minAmount}
                    onChange={(e) =>
                      setForm({ ...form, minAmount: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                    placeholder="e.g. 10000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Max Amount (TZS)
                  </label>
                  <input
                    type="number"
                    value={form.maxAmount}
                    onChange={(e) =>
                      setForm({ ...form, maxAmount: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                    placeholder="e.g. 500000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Charge On
                </label>
                <select
                  value={form.chargeOn}
                  onChange={(e) =>
                    setForm({ ...form, chargeOn: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                >
                  {CHARGE_ON_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isRefundable"
                  checked={form.isRefundable}
                  onChange={(e) =>
                    setForm({ ...form, isRefundable: e.target.checked })
                  }
                  className="rounded border-border"
                />
                <label
                  htmlFor="isRefundable"
                  className="text-sm text-foreground"
                >
                  Refundable
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-border rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium"
              >
                {isEditing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
