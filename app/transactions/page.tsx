"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_ACCOUNT_TRANSACTIONS, GET_MEMBER_TRANSACTIONS, SEARCH_MEMBERS, GET_MEMBER_SAVINGS_ACCOUNTS, REVERSE_TRANSACTION } from "@/lib/graphql/queries";
import {
  Search,
  Filter,
  Download,
  ArrowUpCircle,
  ArrowDownCircle,
  User,
  RotateCcw,
  X,
} from "lucide-react";
import { formatCurrency, formatDateTime, getStatusColor } from "@/lib/utils";
import ErrorDisplay from "@/components/ui/ErrorDisplay";

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"account" | "member">("member");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reversalModal, setReversalModal] = useState<{ id: string; number: string } | null>(null);
  const [reversalReason, setReversalReason] = useState("");
  const [reversalError, setReversalError] = useState("");

  const [reverseTransaction, { loading: reversing }] = useMutation(REVERSE_TRANSACTION, {
    onCompleted: () => {
      setReversalModal(null);
      setReversalReason("");
      setReversalError("");
    },
    onError: (error) => {
      setReversalError(error.message);
    },
  });

  // Search members
  const { data: membersData, loading: membersLoading } = useQuery(SEARCH_MEMBERS, {
    variables: { searchTerm, page: 0, size: 10 },
    skip: searchTerm.length < 2,
  });
  const members = membersData?.searchMembers?.content || [];

  // Get member's savings accounts
  const { data: accountsData } = useQuery(GET_MEMBER_SAVINGS_ACCOUNTS, {
    variables: { memberId: selectedMember?.id },
    skip: !selectedMember?.id,
  });
  const accounts = accountsData?.memberSavingsAccounts || [];

  // Fetch transactions for selected account
  const { data: accountTxData, loading: accountTxLoading, error: accountTxError } = useQuery(
    GET_ACCOUNT_TRANSACTIONS,
    {
      variables: {
        accountId: selectedAccount?.id,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      },
      skip: !selectedAccount?.id || viewMode !== "account",
      fetchPolicy: "network-only",
    }
  );

  // Fetch all transactions for selected member
  const { data: memberTxData, loading: memberTxLoading, error: memberTxError } = useQuery(
    GET_MEMBER_TRANSACTIONS,
    {
      variables: {
        memberId: selectedMember?.id,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      },
      skip: !selectedMember?.id || viewMode !== "member",
      fetchPolicy: "network-only",
    }
  );

  const loading = accountTxLoading || memberTxLoading;
  const error = accountTxError || memberTxError;
  const allTransactions = viewMode === "account"
    ? (accountTxData?.accountTransactions || [])
    : (memberTxData?.memberTransactions || []);

  // Apply filters
  const filteredTransactions = allTransactions.filter((tx: any) => {
    const matchesSearch = !searchTerm ||
      tx.transactionNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = !typeFilter || tx.transactionType === typeFilter;
    const matchesStatus = !statusFilter || tx.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const transactions = filteredTransactions;

  // Calculate summary statistics
  const deposits = transactions.filter((tx: any) => tx.transactionType === "DEPOSIT");
  const withdrawals = transactions.filter((tx: any) => tx.transactionType === "WITHDRAWAL");
  const loanDisbursements = transactions.filter((tx: any) => tx.transactionType === "LOAN_DISBURSEMENT");
  const loanRepayments = transactions.filter((tx: any) => tx.transactionType === "LOAN_REPAYMENT");

  const totalDeposits = deposits.reduce((sum: number, tx: any) => sum + parseFloat(tx.amount || 0), 0);
  const totalWithdrawals = withdrawals.reduce((sum: number, tx: any) => sum + parseFloat(tx.amount || 0), 0);
  const totalDisbursements = loanDisbursements.reduce((sum: number, tx: any) => sum + parseFloat(tx.amount || 0), 0);
  const totalRepayments = loanRepayments.reduce((sum: number, tx: any) => sum + parseFloat(tx.amount || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            View and manage all financial transactions
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm text-sm">
          <Download className="w-5 h-5" />
          Export
        </button>
      </div>

      {/* Member and Account Selection */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Select Member & Account</h2>

          {/* View Mode Toggle */}
          {selectedMember && (
            <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
              <button
                onClick={() => setViewMode("member")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "member"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Transactions
              </button>
              <button
                onClick={() => setViewMode("account")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "account"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                By Savings Account
              </button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Member Search */}
          <div>
            {!selectedMember ? (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Search Member
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, member number..."
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                {/* Search Results */}
                {searchTerm.length >= 2 && (
                  <div className="mt-2 bg-background border border-border rounded-lg max-h-60 overflow-y-auto">
                    {membersLoading ? (
                      <div className="p-4 text-center text-muted-foreground">
                        Searching...
                      </div>
                    ) : members.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        No members found
                      </div>
                    ) : (
                      members.map((member: any) => (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => {
                            setSelectedMember(member);
                            setSearchTerm("");
                            setSelectedAccount(null);
                          }}
                          className="w-full p-3 text-left hover:bg-muted transition-colors border-b border-border last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {member.firstName} {member.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {member.memberNumber}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">
                      {selectedMember.firstName} {selectedMember.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedMember.memberNumber}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMember(null);
                      setSelectedAccount(null);
                    }}
                    className="text-sm text-destructive hover:underline"
                  >
                    Change
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Account Selection - Only show in account mode */}
          {viewMode === "account" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Select Account
              </label>
              {!selectedMember ? (
                <div className="p-4 bg-muted/30 border border-border rounded-lg text-center text-muted-foreground text-sm">
                  Please select a member first
                </div>
              ) : accounts.length === 0 ? (
                <div className="p-4 bg-muted/30 border border-border rounded-lg text-center text-muted-foreground text-sm">
                  No accounts found for this member
                </div>
              ) : (
                <select
                  value={selectedAccount?.id || ""}
                  onChange={(e) => {
                    const account = accounts.find((a: any) => a.id === e.target.value);
                    setSelectedAccount(account);
                  }}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="">Select an account</option>
                  {accounts.map((account: any) => (
                    <option key={account.id} value={account.id}>
                      {account.accountNumber} - {account.product?.productName} ({formatCurrency(account.balance)})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Member Mode Info */}
          {viewMode === "member" && selectedMember && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">
                Viewing all transactions for this member across all accounts
              </p>
              <p className="text-xs text-blue-600/80 mt-1">
                {accounts.length} account{accounts.length !== 1 ? "s" : ""} found
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
            >
              <option value="">All Types</option>
              <option value="DEPOSIT">Deposit</option>
              <option value="WITHDRAWAL">Withdrawal</option>
              <option value="LOAN_DISBURSEMENT">Loan Disbursement</option>
              <option value="LOAN_REPAYMENT">Loan Repayment</option>
              <option value="TRANSFER">Transfer</option>
              <option value="FEE">Fee</option>
              <option value="INTEREST">Interest</option>
            </select>
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="REVERSED">Reversed</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start Date"
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End Date"
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Total Deposits</h3>
            <ArrowDownCircle className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-2xl font-bold">{formatCurrency(totalDeposits)}</p>
          <p className="text-xs opacity-80 mt-1">{deposits.length} transactions</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">
              Total Withdrawals
            </h3>
            <ArrowUpCircle className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-2xl font-bold">{formatCurrency(totalWithdrawals)}</p>
          <p className="text-xs opacity-80 mt-1">{withdrawals.length} transactions</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">
              Loan Disbursements
            </h3>
            <ArrowUpCircle className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-2xl font-bold">{formatCurrency(totalDisbursements)}</p>
          <p className="text-xs opacity-80 mt-1">{loanDisbursements.length} transactions</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Loan Repayments</h3>
            <ArrowDownCircle className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-2xl font-bold">{formatCurrency(totalRepayments)}</p>
          <p className="text-xs opacity-80 mt-1">{loanRepayments.length} transactions</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-[3px] border-muted border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <ErrorDisplay error={error} />
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p className="text-lg font-semibold mb-2">No transactions found</p>
            {!selectedMember ? (
              <p className="text-sm">
                Please select a member above to view transactions.
              </p>
            ) : viewMode === "account" && !selectedAccount ? (
              <p className="text-sm">
                Please select an account to view transactions.
              </p>
            ) : (
              <p className="text-sm">
                No transactions found{typeFilter || statusFilter ? " matching the selected filters" : ""}.
                {(typeFilter || statusFilter) && " Try clearing the filters."}
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Transaction #</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date & Time</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
                  <th className="text-right py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Method</th>
                  <th className="text-center py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-center py-3 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction: any) => (
                  <tr
                    key={transaction.id}
                    className="border-t border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 px-6 text-sm font-medium text-foreground">
                      {transaction.transactionNumber}
                    </td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">
                      {formatDateTime(transaction.transactionDate)}
                      <br />
                      <span className="text-xs">
                        {transaction.transactionTime ? new Date(transaction.transactionTime).toLocaleTimeString() : ""}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-foreground">
                      {transaction.transactionType.replace(/_/g, " ")}
                    </td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">
                      {transaction.description || "-"}
                    </td>
                    <td
                      className={`py-4 px-6 text-sm font-semibold text-right ${
                        transaction.transactionType === "DEPOSIT" ||
                        transaction.transactionType === "LOAN_REPAYMENT"
                          ? "text-green-600"
                          : "text-orange-600"
                      }`}
                    >
                      {transaction.transactionType === "DEPOSIT" ||
                      transaction.transactionType === "LOAN_REPAYMENT"
                        ? "+"
                        : "-"}
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">
                      {transaction.paymentMethod || "-"}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                          transaction.status
                        )}`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {transaction.status === "COMPLETED" && (
                        <button
                          onClick={() => setReversalModal({ id: transaction.id, number: transaction.transactionNumber })}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                          title="Reverse transaction"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Reverse
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Reversal Modal */}
      {reversalModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card rounded-xl border border-border shadow-xl max-w-md w-full p-6 animate-modal-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Reverse Transaction</h3>
              <button
                onClick={() => { setReversalModal(null); setReversalReason(""); setReversalError(""); }}
                className="p-1 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              You are about to reverse transaction <span className="font-mono font-semibold">{reversalModal.number}</span>.
              This action cannot be undone.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Reason for reversal
              </label>
              <textarea
                value={reversalReason}
                onChange={(e) => setReversalReason(e.target.value)}
                placeholder="Enter reason for this reversal..."
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
            {reversalError && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                {reversalError}
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setReversalModal(null); setReversalReason(""); setReversalError(""); }}
                className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!reversalReason.trim()) {
                    setReversalError("Reason is required");
                    return;
                  }
                  reverseTransaction({
                    variables: {
                      transactionId: reversalModal.id,
                      reason: reversalReason.trim(),
                    },
                    refetchQueries: [
                      ...(selectedAccount?.id ? [{ query: GET_ACCOUNT_TRANSACTIONS, variables: { accountId: selectedAccount.id, startDate: startDate || undefined, endDate: endDate || undefined } }] : []),
                      ...(selectedMember?.id ? [{ query: GET_MEMBER_TRANSACTIONS, variables: { memberId: selectedMember.id, startDate: startDate || undefined, endDate: endDate || undefined } }] : []),
                    ],
                  });
                }}
                disabled={reversing}
                className="px-4 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors text-sm"
              >
                {reversing ? "Reversing..." : "Confirm Reversal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
