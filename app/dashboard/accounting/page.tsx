"use client";

import Link from "next/link";
import { useQuery } from "@apollo/client";
import { GET_FINANCIAL_STATEMENTS } from "@/lib/graphql/queries";
import {
  BookOpen,
  FileText,
  Scale,
  TrendingUp,
  PieChart,
  Calculator,
  Shield,
  BarChart3,
  ShieldAlert,
  Clock,
  Banknote,
  Users,
  Lock,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const accountingModules = [
  {
    name: "Chart of Accounts",
    description: "View and manage the chart of accounts structure",
    href: "/dashboard/accounting/chart-of-accounts",
    icon: BookOpen,
    color: "bg-blue-500",
  },
  {
    name: "General Ledger",
    description: "View detailed transactions by account",
    href: "/dashboard/accounting/general-ledger",
    icon: FileText,
    color: "bg-green-500",
  },
  {
    name: "Trial Balance",
    description: "View trial balance report for any date",
    href: "/dashboard/accounting/trial-balance",
    icon: Scale,
    color: "bg-purple-500",
  },
  {
    name: "Financial Statements",
    description: "Generate balance sheet and income statement",
    href: "/dashboard/accounting/financial-statements",
    icon: TrendingUp,
    color: "bg-orange-500",
  },
  {
    name: "Portfolio Summary",
    description: "View loan portfolio summary and statistics",
    href: "/dashboard/accounting/portfolio-summary",
    icon: PieChart,
    color: "bg-pink-500",
  },
  {
    name: "Delinquency Report",
    description: "View loan delinquency analysis and aging",
    href: "/dashboard/accounting/delinquency-report",
    icon: Calculator,
    color: "bg-red-500",
  },
  {
    name: "Cash Flow Statement",
    description: "Operating, investing, and financing activities",
    href: "/dashboard/accounting/cash-flow",
    icon: TrendingUp,
    color: "bg-cyan-500",
  },
  {
    name: "Journal Entry",
    description: "Post manual adjustments to the general ledger",
    href: "/dashboard/accounting/journal-entry",
    icon: BookOpen,
    color: "bg-amber-500",
  },
  {
    name: "Member Statement",
    description: "Generate account statements for members",
    href: "/dashboard/accounting/member-statement",
    icon: FileText,
    color: "bg-teal-500",
  },
  {
    name: "Daily Transactions",
    description: "View daily transaction summary and analysis",
    href: "/dashboard/accounting/daily-transactions",
    icon: BarChart3,
    color: "bg-violet-500",
  },
  {
    name: "Loan Provisioning",
    description: "Loan classification and provision analysis",
    href: "/dashboard/accounting/loan-provisioning",
    icon: ShieldAlert,
    color: "bg-orange-600",
  },
  {
    name: "Audit Trail",
    description: "Track all system actions and changes",
    href: "/dashboard/accounting/audit-logs",
    icon: Shield,
    color: "bg-indigo-500",
  },
  {
    name: "Batch Processing",
    description: "Run end-of-day and batch operations",
    href: "/dashboard/accounting/end-of-day",
    icon: Clock,
    color: "bg-blue-600",
  },
  {
    name: "Loan Officer Performance",
    description: "Track loan officer KPIs and portfolio quality",
    href: "/dashboard/accounting/loan-officer-performance",
    icon: Users,
    color: "bg-indigo-600",
  },
  {
    name: "Accounting Periods",
    description: "Manage fiscal periods and period locking",
    href: "/dashboard/accounting/periods",
    icon: Lock,
    color: "bg-gray-600",
  },
  {
    name: "ALM Report",
    description: "Asset-Liability Management maturity schedules and gap analysis",
    href: "/dashboard/accounting/alm-report",
    icon: BarChart3,
    color: "bg-teal-600",
  },
];

export default function AccountingDashboard() {
  // Get today's date for financial statements
  const today = new Date().toISOString().split('T')[0];

  const { data, loading, error } = useQuery(GET_FINANCIAL_STATEMENTS, {
    variables: { date: today },
    fetchPolicy: "network-only",
  });

  const balanceSheet = data?.financialStatements?.balanceSheet;
  const incomeStatement = data?.financialStatements?.incomeStatement;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Accounting & Reports</h1>
        <p className="text-muted-foreground mt-2">
          Manage financial records and generate reports
        </p>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accountingModules.map((module) => (
          <Link
            key={module.name}
            href={module.href}
            className="block p-6 bg-card border border-border rounded-xl card-interactive"
          >
            <div className="flex items-start gap-4">
              <div className={`${module.color} p-3 rounded-lg`}>
                <module.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {module.name}
                </h3>
                <p className="text-sm text-muted-foreground">{module.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <div className="p-6 bg-card border border-border rounded-xl">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Assets</div>
          <div className="text-2xl font-bold text-foreground tabular-nums">
            {loading ? "Loading..." : formatCurrency(balanceSheet?.assets || 0)}
          </div>
        </div>
        <div className="p-6 bg-card border border-border rounded-xl">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Liabilities</div>
          <div className="text-2xl font-bold text-foreground tabular-nums">
            {loading ? "Loading..." : formatCurrency(balanceSheet?.liabilities || 0)}
          </div>
        </div>
        <div className="p-6 bg-card border border-border rounded-xl">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Equity</div>
          <div className="text-2xl font-bold text-foreground tabular-nums">
            {loading ? "Loading..." : formatCurrency(balanceSheet?.equity || 0)}
          </div>
        </div>
        <div className="p-6 bg-card border border-border rounded-xl">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Net Income (MTD)</div>
          <div className="text-2xl font-bold text-success tabular-nums">
            {loading ? "Loading..." : formatCurrency(incomeStatement?.netIncome || 0)}
          </div>
        </div>
      </div>
    </div>
  );
}
