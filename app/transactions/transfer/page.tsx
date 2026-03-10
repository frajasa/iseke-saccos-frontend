"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { TRANSFER_BETWEEN_ACCOUNTS, GET_MEMBERS, GET_MEMBER_SAVINGS_ACCOUNTS } from "@/lib/graphql/queries";
import { ArrowLeft, ArrowRightLeft } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function TransferPage() {
  const [fromMemberId, setFromMemberId] = useState("");
  const [toMemberId, setToMemberId] = useState("");
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const { data: membersData } = useQuery(GET_MEMBERS, {
    variables: { page: 0, size: 1000 },
  });

  const { data: fromAccountsData } = useQuery(GET_MEMBER_SAVINGS_ACCOUNTS, {
    variables: { memberId: fromMemberId },
    skip: !fromMemberId,
  });

  const { data: toAccountsData } = useQuery(GET_MEMBER_SAVINGS_ACCOUNTS, {
    variables: { memberId: toMemberId },
    skip: !toMemberId,
  });

  const [transfer, { loading }] = useMutation(TRANSFER_BETWEEN_ACCOUNTS);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAccountId || !toAccountId || !amount) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (fromAccountId === toAccountId) {
      toast.error("Cannot transfer to the same account");
      return;
    }
    try {
      const result = await transfer({
        variables: {
          fromAccountId,
          toAccountId,
          amount: parseFloat(amount),
          description: description || undefined,
        },
      });
      toast.success(`Transfer completed: ${result.data.transferBetweenAccounts.transactionNumber}`);
      setAmount("");
      setDescription("");
      setFromAccountId("");
      setToAccountId("");
    } catch (err: any) {
      toast.error(err.message || "Transfer failed");
    }
  };

  const members = membersData?.members?.content || [];
  const fromAccounts = fromAccountsData?.memberSavingsAccounts || [];
  const toAccounts = toAccountsData?.memberSavingsAccounts || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/transactions" className="p-2 hover:bg-secondary rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div className="p-3 bg-blue-500/10 rounded-lg">
          <ArrowRightLeft className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Inter-Account Transfer</h1>
          <p className="text-muted-foreground">Transfer funds between member accounts</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-6 max-w-2xl">
        {/* Source */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
            Source Account
          </h3>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Member *</label>
            <select
              value={fromMemberId}
              onChange={(e) => { setFromMemberId(e.target.value); setFromAccountId(""); }}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select member...</option>
              {members.map((m: any) => (
                <option key={m.id} value={m.id}>{m.memberNumber} - {m.firstName} {m.lastName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Account *</label>
            <select
              value={fromAccountId}
              onChange={(e) => setFromAccountId(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary"
              required
              disabled={!fromMemberId}
            >
              <option value="">Select account...</option>
              {fromAccounts.filter((a: any) => a.status === "ACTIVE").map((a: any) => (
                <option key={a.id} value={a.id}>{a.accountNumber} - {a.product?.productName} (Bal: {formatCurrency(a.balance)})</option>
              ))}
            </select>
          </div>
        </div>

        <hr className="border-border" />

        {/* Destination */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-foreground">Destination Account</h3>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Member *</label>
            <select
              value={toMemberId}
              onChange={(e) => { setToMemberId(e.target.value); setToAccountId(""); }}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select member...</option>
              {members.map((m: any) => (
                <option key={m.id} value={m.id}>{m.memberNumber} - {m.firstName} {m.lastName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Account *</label>
            <select
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary"
              required
              disabled={!toMemberId}
            >
              <option value="">Select account...</option>
              {toAccounts.map((a: any) => (
                <option key={a.id} value={a.id}>{a.accountNumber} - {a.product?.productName} (Bal: {formatCurrency(a.balance)})</option>
              ))}
            </select>
          </div>
        </div>

        <hr className="border-border" />

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Amount (TZS) *</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary"
            min="1"
            step="0.01"
            placeholder="Enter amount to transfer"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary"
            placeholder="Transfer description (optional)"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 font-semibold transition-all"
        >
          {loading ? "Processing Transfer..." : "Transfer Funds"}
        </button>
      </form>
    </div>
  );
}
