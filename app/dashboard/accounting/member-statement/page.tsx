"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import {
  SEARCH_MEMBERS,
  GET_MEMBER_SAVINGS_ACCOUNTS,
  GET_MEMBER_STATEMENT,
} from "@/lib/graphql/queries";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, FileText, Search, Calendar, User } from "lucide-react";
import Link from "next/link";
import ExportDropdown from "@/components/ExportDropdown";
import { ExportOptions, handleExport } from "@/lib/export-utils";

export default function MemberStatementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);

  const { data: membersData, loading: membersLoading } = useQuery(SEARCH_MEMBERS, {
    variables: { searchTerm, page: 0, size: 10 },
    skip: searchTerm.length < 2,
  });
  const members = membersData?.searchMembers?.content || [];

  const { data: accountsData } = useQuery(GET_MEMBER_SAVINGS_ACCOUNTS, {
    variables: { memberId: selectedMember?.id },
    skip: !selectedMember?.id,
  });
  const accounts = accountsData?.memberSavingsAccounts || [];

  const { data: statementData, loading: statementLoading, error: statementError } = useQuery(
    GET_MEMBER_STATEMENT,
    {
      variables: {
        memberId: selectedMember?.id,
        accountId: selectedAccountId || undefined,
        startDate,
        endDate,
      },
      skip: !selectedMember?.id,
      fetchPolicy: "network-only",
    }
  );

  const statement = statementData?.memberStatement;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/accounting" className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div className="p-3 bg-teal-500/10 rounded-lg">
            <FileText className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Member Statement</h1>
            <p className="text-muted-foreground">Generate account statements for members</p>
          </div>
        </div>
        {statement && (
          <ExportDropdown
            onExport={(format) => {
              const memberName = statement.member?.fullName || "Member";
              const transactions = statement.transactions || [];
              const exportOptions: ExportOptions = {
                title: `Member Statement - ${memberName}`,
                subtitle: `${statement.member?.memberNumber || ""} | Period: ${statement.period || `${startDate} to ${endDate}`}`,
                filename: "member-statement",
                columns: [
                  { header: "Date", key: "transactionDate", width: 14, format: "date" },
                  { header: "Reference", key: "transactionNumber", width: 16 },
                  { header: "Description", key: "description", width: 28 },
                  { header: "Type", key: "transactionType", width: 16 },
                  { header: "Amount", key: "amount", width: 16, format: "currency" },
                  { header: "Balance", key: "balanceAfter", width: 16, format: "currency" },
                ],
                data: transactions.map((tx: any) => ({
                  transactionDate: tx.transactionDate,
                  transactionNumber: tx.transactionNumber || "",
                  description: tx.description || "",
                  transactionType: tx.transactionType?.replace(/_/g, " ") || "",
                  amount: tx.amount,
                  balanceAfter: tx.balanceAfter,
                })),
                summary: [
                  { label: "Opening Balance", value: formatCurrency(statement.openingBalance || 0) },
                  { label: "Closing Balance", value: formatCurrency(statement.closingBalance || 0) },
                ],
              };
              handleExport(format, exportOptions, "print-report");
            }}
          />
        )}
      </div>

      {/* Selection Filters */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Member Search */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Search className="w-4 h-4 inline mr-1" />
              Member
            </label>
            {!selectedMember ? (
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search member..."
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {searchTerm.length >= 2 && (
                  <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-lg max-h-48 overflow-y-auto shadow-lg">
                    {membersLoading ? (
                      <div className="p-3 text-center text-muted-foreground text-sm">Searching...</div>
                    ) : members.length === 0 ? (
                      <div className="p-3 text-center text-muted-foreground text-sm">No members found</div>
                    ) : (
                      members.map((member: any) => (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => {
                            setSelectedMember(member);
                            setSearchTerm("");
                          }}
                          className="w-full p-3 text-left hover:bg-muted transition-colors border-b border-border last:border-0 text-sm"
                        >
                          <span className="font-medium">{member.firstName} {member.lastName}</span>
                          <span className="text-muted-foreground ml-2">{member.memberNumber}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between px-4 py-2 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{selectedMember.firstName} {selectedMember.lastName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => { setSelectedMember(null); setSelectedAccountId(""); }}
                  className="text-xs text-destructive hover:underline"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* Account Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Account (Optional)</label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              disabled={!selectedMember}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
            >
              <option value="">All Accounts</option>
              {accounts.map((account: any) => (
                <option key={account.id} value={account.id}>
                  {account.accountNumber} - {account.product?.productName}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Statement */}
      {!selectedMember ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
          <p className="text-muted-foreground">Select a member to generate their statement.</p>
        </div>
      ) : statementLoading ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center text-muted-foreground">
          Loading statement...
        </div>
      ) : statementError ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center text-destructive">
          Error: {statementError.message}
        </div>
      ) : statement ? (
        <div id="print-report" className="bg-card border border-border rounded-lg p-6">
          {/* Statement Header */}
          <div className="text-center mb-6 pb-4 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">ISEKE SACCOS</h2>
            <p className="text-sm text-muted-foreground">Member Account Statement</p>
            <p className="text-sm text-muted-foreground mt-1">
              {statement.member?.fullName} ({statement.member?.memberNumber})
            </p>
            {statement.account && (
              <p className="text-sm text-muted-foreground">
                Account: {statement.account.accountNumber} - {statement.account.product?.productName}
              </p>
            )}
            <p className="text-sm text-muted-foreground">Period: {statement.period}</p>
          </div>

          {/* Balances */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground">Opening Balance</div>
              <div className="text-xl font-bold font-mono text-foreground">
                {formatCurrency(statement.openingBalance)}
              </div>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg">
              <div className="text-sm text-muted-foreground">Closing Balance</div>
              <div className="text-xl font-bold font-mono text-foreground">
                {formatCurrency(statement.closingBalance)}
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Reference</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {statement.transactions?.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">
                      {formatDate(tx.transactionDate)}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground font-mono text-xs">
                      {tx.transactionNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{tx.description || "-"}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted text-foreground">
                        {tx.transactionType?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-sm text-right font-mono font-semibold ${
                      tx.transactionType === "DEPOSIT" || tx.transactionType === "LOAN_REPAYMENT"
                        ? "text-green-600" : "text-red-600"
                    }`}>
                      {tx.transactionType === "DEPOSIT" || tx.transactionType === "LOAN_REPAYMENT" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono font-semibold text-foreground">
                      {formatCurrency(tx.balanceAfter)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(!statement.transactions || statement.transactions.length === 0) && (
            <div className="p-8 text-center text-muted-foreground">
              No transactions found for the selected period.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
