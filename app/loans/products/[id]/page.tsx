"use client";

import { useQuery, useMutation } from "@apollo/client";
import { useRouter, useParams } from "next/navigation";
import { GET_LOAN_PRODUCT, DELETE_LOAN_PRODUCT, GET_LOAN_PRODUCTS } from "@/lib/graphql/queries";
import { LoanProduct } from "@/lib/types";
import { ArrowLeft, Edit, Trash2, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { getStatusColor, formatCurrency } from "@/lib/utils";
import ErrorDisplay from "@/components/ui/ErrorDisplay";

export default function LoanProductDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_LOAN_PRODUCT, {
    variables: { id },
  });

  const [deleteProduct, { loading: deleting }] = useMutation(DELETE_LOAN_PRODUCT, {
    refetchQueries: [{ query: GET_LOAN_PRODUCTS }],
    onCompleted: () => {
      router.push("/loans");
    },
    onError: (error) => {
      toast.error(`Error deleting product: ${error.message}`);
    },
  });

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

  const product: LoanProduct | undefined = data?.loanProduct;

  if (!product) {
    return <ErrorDisplay variant="full-page" title="Product Not Found" message="The loan product you're looking for doesn't exist." />;
  }

  const handleDelete = () => {
    deleteProduct({ variables: { id } });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/loans"
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">{product.productName}</h1>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(product.status)}`}>
                {product.status}
              </span>
            </div>
            <p className="text-muted-foreground mt-1">{product.productCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/loans/products/${id}/edit`}
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
          <p className="text-2xl font-bold text-foreground">{(Number(product.interestRate || 0) * 100).toFixed(2)}%</p>
          <p className="text-xs text-muted-foreground mt-1">{product.interestMethod}</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <p className="text-sm text-muted-foreground mb-1">Amount Range</p>
          <p className="text-lg font-bold text-foreground">
            {formatCurrency(product.minimumAmount)} - {formatCurrency(product.maximumAmount)}
          </p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <p className="text-sm text-muted-foreground mb-1">Term Range</p>
          <p className="text-2xl font-bold text-foreground">
            {product.minimumTermMonths} - {product.maximumTermMonths}
          </p>
          <p className="text-xs text-muted-foreground mt-1">months</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <p className="text-sm text-muted-foreground mb-1">Repayment</p>
          <p className="text-xl font-bold text-foreground">{product.repaymentFrequency}</p>
        </div>
      </div>

      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Basic Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="text-foreground">{product.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Product Code</p>
                <p className="text-foreground font-medium">{product.productCode}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(product.status)}`}>
                  {product.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Interest Configuration */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Interest Configuration</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Interest Rate</p>
                <p className="text-foreground font-medium">{(Number(product.interestRate || 0) * 100).toFixed(2)}% p.a.</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Interest Method</p>
                <p className="text-foreground font-medium">{product.interestMethod}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Repayment Frequency</p>
                <p className="text-foreground font-medium">{product.repaymentFrequency}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Grace Period</p>
                <p className="text-foreground font-medium">{product.gracePeriodDays} days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Loan Amount & Term */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Loan Amount & Term</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Minimum Amount</p>
                <p className="text-foreground font-medium">{formatCurrency(product.minimumAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Maximum Amount</p>
                <p className="text-foreground font-medium">{formatCurrency(product.maximumAmount)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Minimum Term</p>
                <p className="text-foreground font-medium">{product.minimumTermMonths} months</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Maximum Term</p>
                <p className="text-foreground font-medium">{product.maximumTermMonths} months</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fees */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Fees</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              {product.processingFeeRate && (
                <div>
                  <p className="text-sm text-muted-foreground">Processing Fee (Rate)</p>
                  <p className="text-foreground font-medium">{product.processingFeeRate}%</p>
                </div>
              )}
              {product.processingFeeFixed && (
                <div>
                  <p className="text-sm text-muted-foreground">Processing Fee (Fixed)</p>
                  <p className="text-foreground font-medium">{formatCurrency(product.processingFeeFixed)}</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {product.insuranceFeeRate && (
                <div>
                  <p className="text-sm text-muted-foreground">Insurance Fee</p>
                  <p className="text-foreground font-medium">{product.insuranceFeeRate}%</p>
                </div>
              )}
              {product.latePaymentPenaltyRate && (
                <div>
                  <p className="text-sm text-muted-foreground">Late Payment Penalty</p>
                  <p className="text-foreground font-medium">{product.latePaymentPenaltyRate}%</p>
                </div>
              )}
            </div>
            {!product.processingFeeRate && !product.processingFeeFixed && !product.insuranceFeeRate && !product.latePaymentPenaltyRate && (
              <p className="text-sm text-muted-foreground">No fees configured</p>
            )}
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-card rounded-xl border border-border p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-foreground mb-4">Requirements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              {product.requiresGuarantors ? (
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
              )}
              <div>
                <p className="text-sm font-medium text-foreground">Guarantors</p>
                {product.requiresGuarantors ? (
                  <p className="text-sm text-muted-foreground">
                    Minimum {product.minimumGuarantors} required
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Not required</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              {product.requiresCollateral ? (
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
              )}
              <div>
                <p className="text-sm font-medium text-foreground">Collateral</p>
                {product.requiresCollateral ? (
                  <p className="text-sm text-muted-foreground">
                    {product.collateralPercentage}% of loan amount required
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Not required</p>
                )}
              </div>
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
            <p className="text-foreground">{new Date(product.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Last Updated</p>
            <p className="text-foreground">{new Date(product.updatedAt).toLocaleString()}</p>
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
                <h3 className="text-lg font-semibold text-foreground mb-2">Delete Product</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Are you sure you want to delete this product? This action cannot be undone. All
                  loan applications using this product will be affected.
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
