"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_CHART_OF_ACCOUNTS, POST_JOURNAL_ENTRY } from "@/lib/graphql/queries";
import { formatCurrency } from "@/lib/utils";
import { BookOpen, Plus, Trash2, CheckCircle, AlertCircle } from "lucide-react";

interface JournalLine {
  accountId: string;
  debitAmount: string;
  creditAmount: string;
}

export default function JournalEntryPage() {
  const [postingDate, setPostingDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState("");
  const [lines, setLines] = useState<JournalLine[]>([
    { accountId: "", debitAmount: "", creditAmount: "" },
    { accountId: "", debitAmount: "", creditAmount: "" },
  ]);
  const [result, setResult] = useState<any>(null);
  const [formError, setFormError] = useState("");

  const { data: accountsData } = useQuery(GET_CHART_OF_ACCOUNTS);
  const accounts = accountsData?.chartOfAccounts || [];

  const [postJournalEntry, { loading: posting }] = useMutation(POST_JOURNAL_ENTRY, {
    onCompleted: (data) => {
      setResult(data.postJournalEntry);
      setFormError("");
      // Reset form
      setDescription("");
      setReference("");
      setLines([
        { accountId: "", debitAmount: "", creditAmount: "" },
        { accountId: "", debitAmount: "", creditAmount: "" },
      ]);
    },
    onError: (error) => {
      setFormError(error.message);
      setResult(null);
    },
  });

  const addLine = () => {
    setLines([...lines, { accountId: "", debitAmount: "", creditAmount: "" }]);
  };

  const removeLine = (index: number) => {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: keyof JournalLine, value: string) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: value };
    // Clear the opposite field when entering a value
    if (field === "debitAmount" && value) {
      updated[index].creditAmount = "";
    } else if (field === "creditAmount" && value) {
      updated[index].debitAmount = "";
    }
    setLines(updated);
  };

  const totalDebits = lines.reduce((sum, line) => sum + (parseFloat(line.debitAmount) || 0), 0);
  const totalCredits = lines.reduce((sum, line) => sum + (parseFloat(line.creditAmount) || 0), 0);
  const isBalanced = totalDebits > 0 && Math.abs(totalDebits - totalCredits) < 0.01;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setResult(null);

    if (!description.trim()) {
      setFormError("Description is required");
      return;
    }

    const validLines = lines.filter(
      (line) => line.accountId && (parseFloat(line.debitAmount) > 0 || parseFloat(line.creditAmount) > 0)
    );

    if (validLines.length < 2) {
      setFormError("At least 2 valid lines are required");
      return;
    }

    if (!isBalanced) {
      setFormError("Total debits must equal total credits");
      return;
    }

    postJournalEntry({
      variables: {
        input: {
          postingDate,
          description: description.trim(),
          reference: reference.trim() || null,
          lines: validLines.map((line) => ({
            accountId: line.accountId,
            debitAmount: parseFloat(line.debitAmount) || 0,
            creditAmount: parseFloat(line.creditAmount) || 0,
          })),
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-amber-500/10 rounded-lg">
          <BookOpen className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Manual Journal Entry</h1>
          <p className="text-muted-foreground">Post manual adjustments to the general ledger</p>
        </div>
      </div>

      {/* Success Message */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <p className="font-semibold text-green-800">Journal entry posted successfully!</p>
            <p className="text-sm text-green-700 mt-1">
              Reference: <span className="font-mono">{result.reference}</span> |
              Entries posted: {result.entriesPosted} |
              Posting date: {result.postingDate}
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {formError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <p className="text-red-800">{formError}</p>
        </div>
      )}

      {/* Journal Entry Form */}
      <form onSubmit={handleSubmit}>
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          {/* Header Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Posting Date</label>
              <input
                type="date"
                value={postingDate}
                onChange={(e) => setPostingDate(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Month-end accrual adjustment"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Reference (Optional)</label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g., ADJ-2026-001"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Journal Lines */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-foreground">Journal Lines</h3>
              <button
                type="button"
                onClick={addLine}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Line
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-1/2">Account</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider w-1/5">Debit</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider w-1/5">Credit</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider w-[60px]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {lines.map((line, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2">
                        <select
                          value={line.accountId}
                          onChange={(e) => updateLine(index, "accountId", e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="">-- Select Account --</option>
                          {accounts.map((account: any) => (
                            <option key={account.id} value={account.id}>
                              {account.accountCode} - {account.accountName}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={line.debitAmount}
                          onChange={(e) => updateLine(index, "debitAmount", e.target.value)}
                          placeholder="0.00"
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm text-right font-mono focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={line.creditAmount}
                          onChange={(e) => updateLine(index, "creditAmount", e.target.value)}
                          placeholder="0.00"
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm text-right font-mono focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeLine(index)}
                          disabled={lines.length <= 2}
                          className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted/50 border-t-2 border-border font-semibold">
                  <tr>
                    <td className="px-4 py-3 text-sm text-foreground">Totals</td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-blue-600">
                      {formatCurrency(totalDebits)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-red-600">
                      {formatCurrency(totalCredits)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isBalanced ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                      ) : totalDebits > 0 || totalCredits > 0 ? (
                        <AlertCircle className="w-5 h-5 text-amber-500 mx-auto" />
                      ) : null}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {!isBalanced && (totalDebits > 0 || totalCredits > 0) && (
              <p className="text-sm text-amber-600 mt-2">
                Difference: {formatCurrency(Math.abs(totalDebits - totalCredits))} - Debits must equal credits.
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={posting || !isBalanced}
              className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {posting ? "Posting..." : "Post Journal Entry"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
