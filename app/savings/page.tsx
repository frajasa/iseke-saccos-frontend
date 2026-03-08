"use client";

import { useQuery } from "@apollo/client/react";
import { GET_SAVINGS_PRODUCTS } from "@/lib/graphql/queries";
import { SavingsProduct } from "@/lib/types";
import { Plus, Eye, Wallet } from "lucide-react";
import Link from "next/link";
import { getStatusColor } from "@/lib/utils";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import { SkeletonCards } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { isNullListError } from "@/lib/error-utils";

export default function SavingsProductsPage() {
  const { data, loading, error, refetch } = useQuery(GET_SAVINGS_PRODUCTS, {
    fetchPolicy: "network-only",
  });

  const products: SavingsProduct[] = data?.activeSavingsProducts || [];

  const shouldShowError = error && !isNullListError(error) && products.length === 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl tracking-tight font-bold text-foreground">
            Savings Products
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage savings and deposit products
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/savings/accounts/new"
            className="inline-flex items-center justify-center gap-2 bg-success hover:bg-success/90 text-white font-semibold px-5 py-2.5 text-sm rounded-lg transition-colors"
          >
            <Wallet className="w-5 h-5" />
            Open Account
          </Link>
          <Link
            href="/savings/products/new"
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 py-2.5 text-sm rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <SkeletonCards count={6} />
        ) : shouldShowError ? (
          <div className="col-span-full"><ErrorDisplay error={error} onRetry={() => refetch()} /></div>
        ) : products.length === 0 ? (
          <EmptyState title="No savings products" description="Create your first savings product to get started." />
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="bg-card rounded-xl border border-border p-6 card-interactive"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {product.productName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {product.productCode}
                  </p>
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
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Interest Rate</span>
                  <span className="font-semibold text-foreground">
                    {(Number(product.interestRate || 0) * 100).toFixed(2)}% p.a.
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Min Balance</span>
                  <span className="font-semibold text-foreground">
                    TZS {(product.minimumBalance ?? 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Opening Balance</span>
                  <span className="font-semibold text-foreground">
                    TZS {(product.minimumOpeningBalance ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <span className="inline-flex items-center text-sm text-muted-foreground">
                  <span className="px-2 py-1 rounded bg-muted text-xs">
                    {product.productType}
                  </span>
                </span>
                <Link
                  href={`/savings/products/${product.id}`}
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
