"use client";

import { useState, Fragment } from "react";
import { useQuery, useLazyQuery, gql } from "@apollo/client";
import { GET_FX_POSITIONS, GET_FX_POSITION_HISTORY } from "@/lib/graphql/queries";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { isNullListError } from "@/lib/error-utils";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Filter,
  X,
} from "lucide-react";

const GET_BRANCHES = gql`
  query {
    branches {
      id
      branchName
    }
  }
`;

interface FxPosition {
  id: string;
  currency: string;
  positionAmount: number;
  averageRate: number;
  currentRate: number;
  unrealizedPnL: number;
  branch?: { id: string; branchName: string } | null;
  branchName?: string;
  lastUpdated: string;
}

interface FxPositionHistory {
  id: string;
  currency: string;
  positionAmount: number;
  rate: number;
  unrealizedPnL: number;
  recordedAt: string;
  note?: string;
}

interface Branch {
  id: string;
  branchName: string;
}

export default function FxPositionsPage() {
  const [branchFilter, setBranchFilter] = useState<string>("");
  const [expandedCurrency, setExpandedCurrency] = useState<string | null>(null);

  const {
    data: positionsData,
    loading: positionsLoading,
    error: positionsError,
    refetch,
  } = useQuery(GET_FX_POSITIONS, {
    variables: branchFilter ? { branchId: branchFilter } : {},
    fetchPolicy: "cache-and-network",
  });

  const { data: branchesData } = useQuery(GET_BRANCHES);

  const [fetchHistory, { data: historyData, loading: historyLoading }] =
    useLazyQuery(GET_FX_POSITION_HISTORY);

  const positions: FxPosition[] =
    positionsData?.fxPositions || positionsData?.getFxPositions || [];
  const branches: Branch[] = branchesData?.branches || [];
  const history: FxPositionHistory[] =
    historyData?.fxPositionHistory || historyData?.getFxPositionHistory || [];

  const totalPositions = positions.length;
  const totalUnrealizedPnL = positions.reduce(
    (sum, p) => sum + (Number(p.unrealizedPnL) || 0),
    0
  );

  const handleRowClick = (position: FxPosition) => {
    const currency = position.currency;
    if (expandedCurrency === currency) {
      setExpandedCurrency(null);
    } else {
      setExpandedCurrency(currency);
      fetchHistory({
        variables: {
          currency,
          ...(branchFilter ? { branchId: branchFilter } : {}),
        },
      });
    }
  };

  const formatRate = (rate: number | string | null | undefined): string => {
    const num = Number(rate ?? 0);
    if (isNaN(num)) return "0.000000";
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  const formatAmount = (amount: number | string | null | undefined): string => {
    const num = Number(amount ?? 0);
    if (isNaN(num)) return "0.00";
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const pnlColor = (value: number) => {
    if (value > 0) return "text-green-600";
    if (value < 0) return "text-red-600";
    return "text-muted-foreground";
  };

  const pnlBgColor = (value: number) => {
    if (value > 0) return "bg-green-500/10";
    if (value < 0) return "bg-red-500/10";
    return "bg-muted/50";
  };

  const isNullError = isNullListError(positionsError);

  if (positionsLoading && !positionsData) {
    return (
      <div className="p-8">
        <div className="animate-pulse text-muted-foreground">
          Loading FX positions...
        </div>
      </div>
    );
  }

  if (positionsError && !isNullError) {
    return (
      <div className="p-6">
        <ErrorDisplay
          error={positionsError}
          variant="full-page"
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">FX Positions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor foreign exchange positions and unrealized P&L
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Positions</p>
              <p className="text-2xl font-bold text-foreground">
                {totalPositions}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                totalUnrealizedPnL >= 0
                  ? "bg-green-500/10"
                  : "bg-red-500/10"
              }`}
            >
              {totalUnrealizedPnL >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Total Unrealized P&L
              </p>
              <p
                className={`text-2xl font-bold ${pnlColor(totalUnrealizedPnL)}`}
              >
                {totalUnrealizedPnL >= 0 ? "+" : ""}
                {formatCurrency(totalUnrealizedPnL)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Branch Filter */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span>Filter by Branch:</span>
        </div>
        <select
          value={branchFilter}
          onChange={(e) => {
            setBranchFilter(e.target.value);
            setExpandedCurrency(null);
          }}
          className="px-3 py-2 rounded-lg border border-border bg-background text-sm min-w-[200px]"
        >
          <option value="">All Branches</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.branchName}
            </option>
          ))}
        </select>
        {branchFilter && (
          <button
            onClick={() => {
              setBranchFilter("");
              setExpandedCurrency(null);
            }}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Clear filter"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Positions Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Open Positions</h2>
        </div>

        {positions.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">
            No FX positions found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    Currency
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    Position Amount
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    Average Rate
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    Current Rate
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    Unrealized P&L
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    Branch
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {positions.map((position) => {
                  const pnl = Number(position.unrealizedPnL) || 0;
                  const isExpanded = expandedCurrency === position.currency;
                  const branchDisplay =
                    position.branch?.branchName ||
                    position.branchName ||
                    "-";

                  return (
                    <Fragment key={position.id || position.currency}>
                      <tr
                        className="border-b border-border hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => handleRowClick(position)}
                      >
                        <td className="px-6 py-3">
                          <span className="font-mono font-semibold text-foreground">
                            {position.currency}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right font-mono">
                          {formatAmount(position.positionAmount)}
                        </td>
                        <td className="px-6 py-3 text-right font-mono">
                          {formatRate(position.averageRate)}
                        </td>
                        <td className="px-6 py-3 text-right font-mono">
                          {formatRate(position.currentRate)}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono font-semibold text-sm ${pnlBgColor(pnl)} ${pnlColor(pnl)}`}
                          >
                            {pnl > 0 && (
                              <TrendingUp className="w-3.5 h-3.5" />
                            )}
                            {pnl < 0 && (
                              <TrendingDown className="w-3.5 h-3.5" />
                            )}
                            {pnl >= 0 ? "+" : ""}
                            {formatAmount(pnl)}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm text-muted-foreground">
                          {branchDisplay}
                        </td>
                        <td className="px-6 py-3 text-sm text-muted-foreground">
                          {position.lastUpdated
                            ? formatDateTime(position.lastUpdated)
                            : "-"}
                        </td>
                        <td className="px-6 py-3">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </td>
                      </tr>

                      {/* Expanded History Row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={8} className="bg-muted/20 px-6 py-4">
                            <div className="space-y-3">
                              <h3 className="text-sm font-semibold text-foreground">
                                Position History &mdash; {position.currency}
                              </h3>

                              {historyLoading ? (
                                <div className="text-sm text-muted-foreground animate-pulse">
                                  Loading history...
                                </div>
                              ) : history.length === 0 ? (
                                <div className="text-sm text-muted-foreground">
                                  No history records found for this currency.
                                </div>
                              ) : (
                                <div className="overflow-x-auto rounded-lg border border-border">
                                  <table className="w-full">
                                    <thead>
                                      <tr className="bg-muted/50 border-b border-border">
                                        <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                                          Date
                                        </th>
                                        <th className="text-right px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                                          Position
                                        </th>
                                        <th className="text-right px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                                          Rate
                                        </th>
                                        <th className="text-right px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                                          Unrealized P&L
                                        </th>
                                        <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                                          Note
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {history.map((h) => {
                                        const hPnl =
                                          Number(h.unrealizedPnL) || 0;
                                        return (
                                          <tr
                                            key={h.id || h.recordedAt}
                                            className="border-b border-border last:border-b-0"
                                          >
                                            <td className="px-4 py-2 text-sm">
                                              {h.recordedAt
                                                ? formatDateTime(h.recordedAt)
                                                : "-"}
                                            </td>
                                            <td className="px-4 py-2 text-right font-mono text-sm">
                                              {formatAmount(h.positionAmount)}
                                            </td>
                                            <td className="px-4 py-2 text-right font-mono text-sm">
                                              {formatRate(h.rate)}
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                              <span
                                                className={`font-mono text-sm font-semibold ${pnlColor(hPnl)}`}
                                              >
                                                {hPnl >= 0 ? "+" : ""}
                                                {formatAmount(hPnl)}
                                              </span>
                                            </td>
                                            <td className="px-4 py-2 text-sm text-muted-foreground">
                                              {h.note || "-"}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
