"use client";

import { useQuery, useMutation } from "@apollo/client";
import { useRouter, useParams } from "next/navigation";
import {
  GET_SAVINGS_PRODUCT,
  DELETE_SAVINGS_PRODUCT,
  GET_SAVINGS_PRODUCTS,
} from "@/lib/graphql/queries";
import { SavingsProduct } from "@/lib/types";
import { ArrowLeft, Edit, Trash2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { getStatusColor, formatCurrency } from "@/lib/utils";
import ErrorDisplay from "@/components/ui/ErrorDisplay";

export default function SavingsProductDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_SAVINGS_PRODUCT, {
    variables: { id },
  });

  const [deleteProduct, { loading: deleting }] = useMutation(
    DELETE_SAVINGS_PRODUCT,
    {
      refetchQueries: [{ query: GET_SAVINGS_PRODUCTS }],
      onCompleted: () => {
        router.push("/savings");
      },
      onError: (error) => {
        toast.error(`Error deleting product: ${error.message}`);
      },
    }
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-[3px] border-muted border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay error={error} variant="full-page" onRetry={() => refetch()} />;
  }

  const product: SavingsProduct = data?.activeSavingsProductById;

  if (!product) {
    return <ErrorDisplay variant="full-page" title="Product Not Found" message="The savings product you're looking for doesn't exist." />;
  }

  const handleDelete = () => {
    deleteProduct({ variables: { id: id } });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/savings"
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                {product.productName}
              </h1>
              <span
                className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                  product.status
                )}`}
              >
                {product.status}
              </span>
            </div>
            <p className="text-muted-foreground mt-1">{product.productCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/savings/products/${id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-6">
          <p className="text-sm text-muted-foreground mb-1">Interest Rate</p>
          <p className="text-2xl font-bold text-foreground">
            {(Number(product.interestRate || 0) * 100).toFixed(2)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">per annum</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <p className="text-sm text-muted-foreground mb-1">Minimum Balance</p>
          <p className="text-2xl font-bold text-foreground">
            {formatCurrency(product.minimumBalance)}
          </p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <p className="text-sm text-muted-foreground mb-1">Opening Balance</p>
          <p className="text-2xl font-bold text-foreground">
            {formatCurrency(product.minimumOpeningBalance)}
          </p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <p className="text-sm text-muted-foreground mb-1">Product Type</p>
          <p className="text-xl font-bold text-foreground">
            {product.productType}
          </p>
        </div>
      </div>

      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Basic Information
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="text-foreground">{product.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Product Code</p>
                <p className="text-foreground font-medium">
                  {product.productCode}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Product Type</p>
                <p className="text-foreground font-medium">
                  {product.productType}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Interest Configuration */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Interest Configuration
          </h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Interest Rate</p>
                <p className="text-foreground font-medium">
                  {(Number(product.interestRate || 0) * 100).toFixed(2)}% p.a.
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Calculation Method
                </p>
                <p className="text-foreground font-medium">
                  {product.interestCalculationMethod}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payment Frequency</p>
              <p className="text-foreground font-medium">
                {product.interestPaymentFrequency}
              </p>
            </div>
            {product.taxWithholdingRate && (
              <div>
                <p className="text-sm text-muted-foreground">
                  Tax Withholding Rate
                </p>
                <p className="text-foreground font-medium">
                  {(Number(product.taxWithholdingRate) * 100).toFixed(2)}%
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Balance Requirements */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Balance Requirements
          </h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Minimum Balance</p>
                <p className="text-foreground font-medium">
                  {formatCurrency(product.minimumBalance)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Opening Balance</p>
                <p className="text-foreground font-medium">
                  {formatCurrency(product.minimumOpeningBalance)}
                </p>
              </div>
            </div>
            {product.maximumBalance && (
              <div>
                <p className="text-sm text-muted-foreground">Maximum Balance</p>
                <p className="text-foreground font-medium">
                  {formatCurrency(product.maximumBalance)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Fees and Limits */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Fees and Limits
          </h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              {product.withdrawalLimit && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Withdrawal Limit
                  </p>
                  <p className="text-foreground font-medium">
                    {formatCurrency(product.withdrawalLimit)}
                  </p>
                </div>
              )}
              {product.withdrawalFee && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Withdrawal Fee
                  </p>
                  <p className="text-foreground font-medium">
                    {formatCurrency(product.withdrawalFee)}
                  </p>
                </div>
              )}
            </div>
            {product.monthlyFee && (
              <div>
                <p className="text-sm text-muted-foreground">Monthly Fee</p>
                <p className="text-foreground font-medium">
                  {formatCurrency(product.monthlyFee)}
                </p>
              </div>
            )}
            {!product.withdrawalLimit &&
              !product.withdrawalFee &&
              !product.monthlyFee && (
                <p className="text-sm text-muted-foreground">
                  No fees configured
                </p>
              )}
          </div>
        </div>

        {/* Additional Settings */}
        <div className="bg-card rounded-xl border border-border p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Additional Settings
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Dormancy Period</p>
              <p className="text-foreground font-medium">
                {product.dormancyPeriodDays} days
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Allows Overdraft</p>
              <p className="text-foreground font-medium">
                {product.allowsOverdraft ? "Yes" : "No"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <span
                className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                  product.status
                )}`}
              >
                {product.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Metadata</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Created</p>
            <p className="text-foreground">
              {new Date(product.createdAt).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Last Updated</p>
            <p className="text-foreground">
              {new Date(product.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-card rounded-xl border border-border p-6 max-w-md w-full mx-4 shadow-xl animate-modal-in">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Delete Product
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Are you sure you want to delete this product? This action
                  cannot be undone. All accounts using this product will be
                  affected.
                </p>
                <div className="flex items-center gap-3 justify-end">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-4 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg transition-colors disabled:opacity-50"
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
