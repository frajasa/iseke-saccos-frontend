"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@apollo/client";
import { GET_DASHBOARD_STATS } from "@/lib/graphql/queries";
import { formatCurrency, getStatusColor, formatShortDate } from "@/lib/utils";
import {
  Users,
  Wallet,
  CreditCard,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Activity,
} from "lucide-react";
import Link from "next/link";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import { Skeleton, SkeletonCards } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";

export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user as any;

  const { data, loading, error, refetch } = useQuery(GET_DASHBOARD_STATS, {
    fetchPolicy: "network-only",
    pollInterval: 60000,
  });

  const stats = data?.dashboardStats;

  const statCards = [
    {
      title: "Total Members",
      value: stats ? stats.totalMembers.toLocaleString() : "0",
      icon: Users,
      color: "from-blue-500 to-blue-600",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
      href: "/members",
    },
    {
      title: "Total Savings",
      value: stats ? formatCurrency(stats.totalSavings) : "TZS 0",
      icon: Wallet,
      color: "from-emerald-500 to-emerald-600",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
      href: "/savings",
    },
    {
      title: "Active Loans",
      value: stats ? stats.activeLoans.toLocaleString() : "0",
      icon: CreditCard,
      color: "from-violet-500 to-violet-600",
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-600",
      href: "/loans",
    },
    {
      title: "Loan Portfolio",
      value: stats ? formatCurrency(stats.loanPortfolio) : "TZS 0",
      icon: TrendingUp,
      color: "from-amber-500 to-amber-600",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600",
      href: "/dashboard/accounting",
    },
  ];

  const alerts = stats
    ? [
        stats.overdueLoans > 0
          ? {
              type: "warning" as const,
              message: `${stats.overdueLoans} loan${stats.overdueLoans !== 1 ? "s are" : " is"} overdue`,
              action: "View Details",
              href: "/dashboard/accounting/loan-provisioning",
              icon: AlertCircle,
            }
          : null,
        stats.pendingApplications > 0
          ? {
              type: "info" as const,
              message: `${stats.pendingApplications} pending loan application${stats.pendingApplications !== 1 ? "s" : ""}`,
              action: "Review",
              href: "/loans",
              icon: CreditCard,
            }
          : null,
        stats.overdueLoans === 0
          ? {
              type: "success" as const,
              message: "Portfolio is healthy — no overdue loans",
              action: "View Report",
              href: "/dashboard/accounting",
              icon: Activity,
            }
          : null,
      ].filter(Boolean)
    : [];

  const alertStyles = {
    warning: "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400",
    info: "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400",
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400",
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-hover rounded-2xl p-6 lg:p-8 text-white">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute right-20 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative">
          <p className="text-white/70 text-sm font-medium mb-1">{getTimeGreeting()}</p>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">
            {user?.firstName || user?.name?.split(" ")[0]}
          </h1>
          <p className="text-white/80 text-sm max-w-lg">
            Here&apos;s an overview of your SACCOS performance today.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <SkeletonCards count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => (
            <Link
              key={stat.title}
              href={stat.href}
              className="group bg-card border border-border rounded-xl p-5 card-interactive"
              style={{ animationDelay: `${i * 75}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-lg ${stat.iconBg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-2xl font-bold text-foreground tabular-nums mb-0.5">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </Link>
          ))}
        </div>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert: any, index: number) => (
            <Link
              key={index}
              href={alert.href}
              className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all hover:shadow-sm ${alertStyles[alert.type as keyof typeof alertStyles]}`}
            >
              <alert.icon className="w-4.5 h-4.5 shrink-0" />
              <span className="text-sm font-medium flex-1">{alert.message}</span>
              <span className="text-xs font-semibold flex items-center gap-1 opacity-70">
                {alert.action}
                <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Recent Transactions</h2>
          <Link href="/transactions" className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1">
            View all
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6">
            <ErrorDisplay error={error} onRetry={() => refetch()} />
          </div>
        ) : !stats?.recentTransactions?.length ? (
          <EmptyState title="No transactions yet" description="Transactions will appear here once members start making deposits and withdrawals." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Member</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                  <th className="text-right py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="text-center py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentTransactions.map((transaction: any, i: number) => {
                  const isCredit = ["DEPOSIT", "LOAN_REPAYMENT", "INTEREST"].includes(transaction.transactionType);
                  return (
                    <tr
                      key={transaction.id}
                      className="border-t border-border hover:bg-muted/20 transition-colors table-row-animate"
                      style={{ animationDelay: `${i * 30}ms` }}
                    >
                      <td className="py-3.5 px-6">
                        <p className="text-sm font-medium text-foreground">{transaction.memberName}</p>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="text-sm text-muted-foreground">
                          {transaction.transactionType.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <span className={`text-sm font-semibold tabular-nums ${isCredit ? "text-emerald-600" : "text-foreground"}`}>
                          {isCredit ? "+" : "-"}{formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-sm text-muted-foreground">
                        {formatShortDate(transaction.date)}
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
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
