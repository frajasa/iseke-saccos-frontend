"use client";

import { useQuery } from "@apollo/client/react";
import { GET_LOAN_PRODUCTS } from "@/lib/graphql/queries";
import { LoanProduct } from "@/lib/types";
import { Plus, Eye } from "lucide-react";
import Link from "next/link";
import { getStatusColor, formatCurrency } from "@/lib/utils";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import { SkeletonTable } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { isNullListError } from "@/lib/error-utils";

export default function LoanProductsPage() {
  const { data, loading, error, refetch } = useQuery(GET_LOAN_PRODUCTS);

  const products: LoanProduct[] = data?.loanProducts || [];

  // Only show error if it's NOT a null list error AND we don't have data
  const shouldShowError = error && !isNullListError(error) && products.length === 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl tracking-tight font-bold text-foreground">Loan Products</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage loan products and terms
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/loans/accounts"
            className="inline-flex items-center justify-center gap-2 text-foreground bg-card border border-border hover:bg-muted font-medium px-5 py-2.5 text-sm rounded-lg transition-colors"
          >
            <Eye className="w-5 h-5" />
            Loan Accounts
          </Link>
          <Link
            href="/loans/products/new"
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 py-2.5 text-sm rounded-lg transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full">
            <SkeletonTable rows={8} cols={6} />
          </div>
        ) : shouldShowError ? (
          <div className="col-span-full"><ErrorDisplay error={error} onRetry={() => refetch()} /></div>
        ) : products.length === 0 ? (
          <div className="col-span-full">
            <EmptyState title="No loan products found" description="Loan products will appear here once they are created." />
          </div>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="card-interactive"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {product.productName}
                  </h3>
                  <p className="text-sm text-muted-foreground">{product.productCode}</p>
                </div>
                <span
                  className={`text-[11px] px-2 py-1 rounded-full ${getStatusColor(
                    product.status
                  )}`}
                >
                  {product.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {product.description}
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Interest Rate</span>
                  <span className="font-semibold text-foreground">
                    {(Number(product.interestRate || 0) * 100).toFixed(2)}% ({product.interestMethod})
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Amount Range</span>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(product.minimumAmount)} - {formatCurrency(product.maximumAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Term Range</span>
                  <span className="font-semibold text-foreground">
                    {product.minimumTermMonths} - {product.maximumTermMonths} months
                  </span>
                </div>
                {product.requiresGuarantors && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Guarantors</span>
                    <span className="font-semibold text-foreground">
                      Min {product.minimumGuarantors || 0}
                    </span>
                  </div>
                )}
                {product.requiresCollateral && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Collateral</span>
                    <span className="font-semibold text-foreground">
                      Required ({product.collateralPercentage || 0}%)
                    </span>
                  </div>
                )}
              </div>
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {product.processingFeeRate && (
                    <span className="px-2 py-1 rounded bg-muted">
                      Fee: {product.processingFeeRate}%
                    </span>
                  )}
                  {product.insuranceFeeRate && (
                    <span className="px-2 py-1 rounded bg-muted">
                      Insurance: {product.insuranceFeeRate}%
                    </span>
                  )}
                </div>
                <Link
                  href={`/loans/products/${product.id}`}
                  className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  Manage
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
