"use client";

import { useQuery } from "@apollo/client";
import { GET_CHART_OF_ACCOUNTS } from "@/lib/graphql/queries";
import { ChartOfAccount } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { BookOpen, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";

export default function ChartOfAccountsPage() {
  const { data, loading, error } = useQuery(GET_CHART_OF_ACCOUNTS, {
    fetchPolicy: "network-only",
  });
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(
    new Set()
  );

  const toggleAccount = (accountId: string) => {
    setExpandedAccounts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(accountId)) {
        newSet.delete(accountId);
      } else {
        newSet.add(accountId);
      }
      return newSet;
    });
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case "ASSET":
        return "text-blue-600 bg-blue-500/10";
      case "LIABILITY":
        return "text-red-600 bg-red-500/10";
      case "EQUITY":
        return "text-purple-600 bg-purple-500/10";
      case "INCOME":
        return "text-green-600 bg-green-500/10";
      case "EXPENSE":
        return "text-orange-600 bg-orange-500/10";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  const groupAccountsByType = (accounts: ChartOfAccount[]) => {
    const grouped: Record<string, ChartOfAccount[]> = {
      ASSET: [],
      LIABILITY: [],
      EQUITY: [],
      INCOME: [],
      EXPENSE: [],
    };

    accounts?.forEach((account: ChartOfAccount) => {
      if (!account.parentAccount) {
        if (grouped[account.accountType]) {
          grouped[account.accountType].push(account);
        }
      }
    });

    return grouped;
  };

  const renderAccount = (account: ChartOfAccount, level: number = 0) => {
    const hasChildren = data?.chartOfAccounts?.some(
      (a: ChartOfAccount) => a.parentAccount?.id === account.id
    );
    const isExpanded = expandedAccounts.has(account.id);
    const children = data?.chartOfAccounts?.filter(
      (a: ChartOfAccount) => a.parentAccount?.id === account.id
    );

    return (
      <div key={account.id}>
        <div
          className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors"
          style={{ marginLeft: level * 32 }}
        >
          {hasChildren && (
            <button
              onClick={() => toggleAccount(account.id)}
              className="p-1 hover:bg-secondary rounded"
            >
              <ChevronRight
                className={`w-4 h-4 transition-transform ${
                  isExpanded ? "rotate-90" : ""
                }`}
              />
            </button>
          )}
          {!hasChildren && <div className="w-6" />}

          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-1 font-mono text-sm text-muted-foreground">
              {account.accountCode}
            </div>
            <div className="md:col-span-4 font-medium text-foreground">
              {account.accountName}
            </div>
            <div className="md:col-span-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getAccountTypeColor(
                  account.accountType
                )}`}
              >
                {account.accountType}
              </span>
            </div>
            <div className="md:col-span-2 text-sm text-muted-foreground">
              {account.accountCategory?.replace(/_/g, " ")}
            </div>
            <div className="md:col-span-2 text-right font-mono text-foreground">
              {formatCurrency(account.balance || 0)}
            </div>
            <div className="md:col-span-1 text-center">
              <span
                className={`px-2 py-1 rounded text-xs ${
                  account.status === "ACTIVE"
                    ? "bg-success/10 text-success"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {account.status}
              </span>
            </div>
          </div>
        </div>

        {isExpanded &&
          children?.map((child: ChartOfAccount) =>
            renderAccount(child, level + 1)
          )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">
          Loading chart of accounts...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">
          Error loading chart of accounts: {error.message}
        </div>
      </div>
    );
  }

  const groupedAccounts = groupAccountsByType(data?.chartOfAccounts || []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-lg">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Chart of Accounts
            </h1>
            <p className="text-muted-foreground">
              View and manage your accounting structure
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="w-5 h-5" />
          Add Account
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.entries(groupedAccounts).map(([type, accounts]) => (
          <div
            key={type}
            className="p-4 bg-card border border-border rounded-lg"
          >
            <div
              className={`text-xs font-medium mb-1 ${
                getAccountTypeColor(type).split(" ")[0]
              }`}
            >
              {type}
            </div>
            <div className="text-2xl font-bold text-foreground">
              {accounts.length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {accounts.filter((a) => a.status === "ACTIVE").length} active
            </div>
          </div>
        ))}
      </div>

      {/* Accounts List */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-muted/50 border-b border-border font-semibold text-sm text-muted-foreground">
          <div className="md:col-span-1">Code</div>
          <div className="md:col-span-4">Account Name</div>
          <div className="md:col-span-2">Type</div>
          <div className="md:col-span-2">Category</div>
          <div className="md:col-span-2 text-right">Balance</div>
          <div className="md:col-span-1 text-center">Status</div>
        </div>

        {/* Accounts by Type */}
        {Object.entries(groupedAccounts).map(([type, accounts]) => (
          <div key={type}>
            {accounts.length > 0 && (
              <>
                <div className="p-3 bg-muted/30 border-b border-border">
                  <span className="font-semibold text-foreground">
                    {type} ACCOUNTS
                  </span>
                </div>
                {accounts.map((account) => renderAccount(account, 0))}
              </>
            )}
          </div>
        ))}

        {data?.chartOfAccounts?.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            No accounts found. Click &quot;Add Account&quot; to create your
            first account.
          </div>
        )}
      </div>
    </div>
  );
}
