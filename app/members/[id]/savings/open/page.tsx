"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { OPEN_SAVINGS_ACCOUNT, GET_SAVINGS_PRODUCTS, GET_MEMBER } from "@/lib/graphql/queries";
import { CreateSavingsAccountInput, PaymentMethod } from "@/lib/types";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default function OpenSavingsAccountPage() {
  const router = useRouter();
  const { id: memberId } = useParams<{ id: string }>();
  const [formData, setFormData] = useState({
    productId: "",
    openingDeposit: "",
    paymentMethod: PaymentMethod.CASH,
    beneficiaryName: "",
    beneficiaryRelationship: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: memberData } = useQuery(GET_MEMBER, {
    variables: { id: memberId },
  });

  const { data: productsData } = useQuery(GET_SAVINGS_PRODUCTS);

  const [openAccount, { loading }] = useMutation(OPEN_SAVINGS_ACCOUNT, {
    onCompleted: (data) => {
      router.push(`/savings/accounts/${data.openSavingsAccount.id}`);
    },
    onError: (error) => {
      setErrors({ submit: error.message });
    },
  });

  const member = memberData?.member;
  const products = productsData?.savingsProducts || [];
  const selectedProduct = products.find((p: any) => p.id === formData.productId);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.productId) {
      newErrors.productId = "Please select a product";
    }
    if (!formData.openingDeposit || parseFloat(formData.openingDeposit) <= 0) {
      newErrors.openingDeposit = "Opening deposit must be greater than 0";
    }
    if (selectedProduct && parseFloat(formData.openingDeposit) < selectedProduct.minimumOpeningBalance) {
      newErrors.openingDeposit = `Minimum opening balance is ${formatCurrency(selectedProduct.minimumOpeningBalance)}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const input: CreateSavingsAccountInput = {
      memberId: memberId,
      productId: formData.productId,
      openingDeposit: parseFloat(formData.openingDeposit),
    };

    if (formData.beneficiaryName) input.beneficiaryName = formData.beneficiaryName;
    if (formData.beneficiaryRelationship) input.beneficiaryRelationship = formData.beneficiaryRelationship;

    await openAccount({
      variables: { input },
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Open Savings Account</h1>
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
            Select Savings Product
          </h2>
          <div className="space-y-4">
            {products.map((product: any) => (
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
                      {(Number(product.interestRate || 0) * 100).toFixed(2)}% p.a.
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Min Balance:</span>
                      <span className="ml-1 font-medium">{formatCurrency(product.minimumBalance)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Opening:</span>
                      <span className="ml-1 font-medium">{formatCurrency(product.minimumOpeningBalance)}</span>
                    </div>
                    {product.withdrawalFee && (
                      <div>
                        <span className="text-muted-foreground">Withdrawal Fee:</span>
                        <span className="ml-1 font-medium">{formatCurrency(product.withdrawalFee)}</span>
                      </div>
                    )}
                    {product.monthlyFee && (
                      <div>
                        <span className="text-muted-foreground">Monthly Fee:</span>
                        <span className="ml-1 font-medium">{formatCurrency(product.monthlyFee)}</span>
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

        {/* Opening Deposit */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Opening Deposit
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Amount (TZS) <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                name="openingDeposit"
                value={formData.openingDeposit}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.openingDeposit ? "border-destructive" : "border-input"
                } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder="0"
                min="0"
                step="1000"
              />
              {errors.openingDeposit && (
                <p className="text-destructive text-sm mt-1">{errors.openingDeposit}</p>
              )}
              {selectedProduct && (
                <p className="text-muted-foreground text-sm mt-1">
                  Minimum: {formatCurrency(selectedProduct.minimumOpeningBalance)}
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
          </div>
        </div>

        {/* Beneficiary Information */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Beneficiary Information (Optional)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Beneficiary Name
              </label>
              <input
                type="text"
                name="beneficiaryName"
                value={formData.beneficiaryName}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Relationship
              </label>
              <input
                type="text"
                name="beneficiaryRelationship"
                value={formData.beneficiaryRelationship}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="e.g., Spouse, Child"
              />
            </div>
          </div>
        </div>

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
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 rounded-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Opening Account...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Open Account & Deposit
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
