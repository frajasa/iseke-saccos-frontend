"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useLazyQuery } from "@apollo/client";
import {
  GET_TRANSACTION_RECEIPT,
  GET_PASSBOOK_ENTRIES,
  GET_LOAN_STATEMENT,
  SEARCH_MEMBERS,
  GET_MEMBER_SAVINGS_ACCOUNTS,
  GET_MEMBER_LOAN_ACCOUNTS,
  GET_ACCOUNT_TRANSACTIONS,
} from "@/lib/graphql/queries";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Printer, Receipt, BookOpen, FileText, Search, X, User, ChevronRight, Copy, Check } from "lucide-react";

// Debounce hook
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function PassbookPage() {
  const [tab, setTab] = useState<"receipt" | "passbook" | "loan">("receipt");

  // Receipt tab state
  const [memberSearch, setMemberSearch] = useState("");
  const [showMemberResults, setShowMemberResults] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const memberSearchRef = useRef<HTMLDivElement>(null);

  // Passbook tab state
  const [passbookMemberSearch, setPassbookMemberSearch] = useState("");
  const [showPassbookMemberResults, setShowPassbookMemberResults] = useState(false);
  const [passbookSelectedMember, setPassbookSelectedMember] = useState<any>(null);
  const [passbookSelectedAccount, setPassbookSelectedAccount] = useState<any>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const passbookMemberSearchRef = useRef<HTMLDivElement>(null);

  // Loan tab state
  const [loanMemberSearch, setLoanMemberSearch] = useState("");
  const [showLoanMemberResults, setShowLoanMemberResults] = useState(false);
  const [loanSelectedMember, setLoanSelectedMember] = useState<any>(null);
  const [loanSelectedLoan, setLoanSelectedLoan] = useState<any>(null);
  const loanMemberSearchRef = useRef<HTMLDivElement>(null);

  // Copied state for copy button
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const debouncedMemberSearch = useDebounce(memberSearch, 300);
  const debouncedPassbookSearch = useDebounce(passbookMemberSearch, 300);
  const debouncedLoanSearch = useDebounce(loanMemberSearch, 300);

  // Queries
  const [searchMembers, { data: membersData, loading: membersLoading }] = useLazyQuery(SEARCH_MEMBERS);
  const [searchPassbookMembers, { data: passbookMembersData, loading: passbookMembersLoading }] = useLazyQuery(SEARCH_MEMBERS);
  const [searchLoanMembers, { data: loanMembersData, loading: loanMembersLoading }] = useLazyQuery(SEARCH_MEMBERS);
  const [fetchMemberAccounts, { data: memberAccountsData, loading: accountsLoading }] = useLazyQuery(GET_MEMBER_SAVINGS_ACCOUNTS);
  const [fetchPassbookMemberAccounts, { data: passbookAccountsData, loading: passbookAccountsLoading }] = useLazyQuery(GET_MEMBER_SAVINGS_ACCOUNTS);
  const [fetchMemberLoans, { data: memberLoansData, loading: loansLoading }] = useLazyQuery(GET_MEMBER_LOAN_ACCOUNTS);
  const [fetchAccountTransactions, { data: accountTxnsData, loading: txnsLoading }] = useLazyQuery(GET_ACCOUNT_TRANSACTIONS);

  const [fetchReceipt, { data: receiptData, loading: receiptLoading }] = useLazyQuery(GET_TRANSACTION_RECEIPT, {
    onError: (err) => toast.error(err.message),
  });
  const [fetchPassbook, { data: passbookData, loading: passbookLoading }] = useLazyQuery(GET_PASSBOOK_ENTRIES, {
    onError: (err) => toast.error(err.message),
  });
  const [fetchLoanStatement, { data: loanData, loading: loanLoading }] = useLazyQuery(GET_LOAN_STATEMENT, {
    onError: (err) => toast.error(err.message),
  });

  // Trigger member searches on debounced input
  useEffect(() => {
    if (debouncedMemberSearch.length >= 2) {
      searchMembers({ variables: { searchTerm: debouncedMemberSearch, page: 0, size: 10 } });
      setShowMemberResults(true);
    } else {
      setShowMemberResults(false);
    }
  }, [debouncedMemberSearch, searchMembers]);

  useEffect(() => {
    if (debouncedPassbookSearch.length >= 2) {
      searchPassbookMembers({ variables: { searchTerm: debouncedPassbookSearch, page: 0, size: 10 } });
      setShowPassbookMemberResults(true);
    } else {
      setShowPassbookMemberResults(false);
    }
  }, [debouncedPassbookSearch, searchPassbookMembers]);

  useEffect(() => {
    if (debouncedLoanSearch.length >= 2) {
      searchLoanMembers({ variables: { searchTerm: debouncedLoanSearch, page: 0, size: 10 } });
      setShowLoanMemberResults(true);
    } else {
      setShowLoanMemberResults(false);
    }
  }, [debouncedLoanSearch, searchLoanMembers]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (memberSearchRef.current && !memberSearchRef.current.contains(e.target as Node)) setShowMemberResults(false);
      if (passbookMemberSearchRef.current && !passbookMemberSearchRef.current.contains(e.target as Node)) setShowPassbookMemberResults(false);
      if (loanMemberSearchRef.current && !loanMemberSearchRef.current.contains(e.target as Node)) setShowLoanMemberResults(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handlePrint = () => window.print();

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  // Receipt flow: select member → select account → select transaction → generate
  const handleSelectMemberForReceipt = (member: any) => {
    setSelectedMember(member);
    setSelectedAccount(null);
    setSelectedTransaction(null);
    setMemberSearch("");
    setShowMemberResults(false);
    fetchMemberAccounts({ variables: { memberId: member.id } });
  };

  const handleSelectAccountForReceipt = (account: any) => {
    setSelectedAccount(account);
    setSelectedTransaction(null);
    fetchAccountTransactions({ variables: { accountId: account.id } });
  };

  const handleSelectTransaction = (txn: any) => {
    setSelectedTransaction(txn);
    fetchReceipt({ variables: { transactionId: txn.id } });
  };

  // Passbook flow: select member → select account → generate
  const handleSelectMemberForPassbook = (member: any) => {
    setPassbookSelectedMember(member);
    setPassbookSelectedAccount(null);
    setPassbookMemberSearch("");
    setShowPassbookMemberResults(false);
    fetchPassbookMemberAccounts({ variables: { memberId: member.id } });
  };

  const handleGeneratePassbook = () => {
    if (!passbookSelectedAccount) { toast.error("Select an account first"); return; }
    fetchPassbook({ variables: { accountId: passbookSelectedAccount.id, startDate: startDate || null, endDate: endDate || null } });
  };

  // Loan flow: select member → select loan → generate
  const handleSelectMemberForLoan = (member: any) => {
    setLoanSelectedMember(member);
    setLoanSelectedLoan(null);
    setLoanMemberSearch("");
    setShowLoanMemberResults(false);
    fetchMemberLoans({ variables: { memberId: member.id } });
  };

  const handleGenerateLoanStatement = () => {
    if (!loanSelectedLoan) { toast.error("Select a loan first"); return; }
    fetchLoanStatement({ variables: { loanId: loanSelectedLoan.id } });
  };

  const receipt = receiptData?.transactionReceipt;
  const passbook = passbookData?.passbookEntries;
  const loanStatement = loanData?.loanStatement;

  const members = membersData?.searchMembers?.content || [];
  const passbookMembers = passbookMembersData?.searchMembers?.content || [];
  const loanMembers = loanMembersData?.searchMembers?.content || [];
  const memberAccounts = memberAccountsData?.memberSavingsAccounts || [];
  const passbookAccounts = passbookAccountsData?.memberSavingsAccounts || [];
  const memberLoans = memberLoansData?.memberLoanAccounts || [];
  const accountTransactions = accountTxnsData?.accountTransactions || [];

  // Member search dropdown component
  const MemberSearchDropdown = ({
    searchValue,
    onSearchChange,
    showResults,
    results,
    loading,
    onSelect,
    placeholder,
    ref: dropdownRef,
  }: {
    searchValue: string;
    onSearchChange: (val: string) => void;
    showResults: boolean;
    results: any[];
    loading: boolean;
    onSelect: (member: any) => void;
    placeholder: string;
    ref: React.RefObject<HTMLDivElement | null>;
  }) => (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm"
        />
      </div>
      {showResults && (
        <div className="absolute z-50 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">Searching...</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">No members found</div>
          ) : (
            results.map((m: any) => (
              <button
                key={m.id}
                onClick={() => onSelect(m)}
                className="w-full text-left px-4 py-2.5 hover:bg-muted/50 transition-colors flex items-center gap-3 border-b border-border last:border-0"
              >
                <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-xs font-bold shrink-0">
                  {m.firstName?.[0]}{m.lastName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{m.firstName} {m.middleName || ""} {m.lastName}</div>
                  <div className="text-xs text-muted-foreground">{m.memberNumber} &middot; {m.phoneNumber || "No phone"}</div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );

  // Selected member card
  const SelectedMemberCard = ({ member, onClear }: { member: any; onClear: () => void }) => (
    <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
      <div className="flex items-center justify-center w-9 h-9 bg-primary/10 text-primary rounded-full text-xs font-bold">
        {member.firstName?.[0]}{member.lastName?.[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold">{member.firstName} {member.middleName || ""} {member.lastName}</div>
        <div className="text-xs text-muted-foreground">{member.memberNumber} &middot; {member.phoneNumber || ""}</div>
      </div>
      <button onClick={onClear} className="p-1 hover:bg-muted rounded transition-colors" title="Change member">
        <X className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Passbook & Receipts</h1>
        <p className="text-sm text-muted-foreground mt-1">Search members, select accounts, and generate printable documents</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit print:hidden">
        <button onClick={() => setTab("receipt")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === "receipt" ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}>
          <Receipt className="w-4 h-4" /> Transaction Receipt
        </button>
        <button onClick={() => setTab("passbook")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === "passbook" ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}>
          <BookOpen className="w-4 h-4" /> Savings Passbook
        </button>
        <button onClick={() => setTab("loan")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === "loan" ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}>
          <FileText className="w-4 h-4" /> Loan Statement
        </button>
      </div>

      {/* ========== Transaction Receipt Tab ========== */}
      {tab === "receipt" && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-4 print:hidden space-y-4">
            {/* Step 1: Search & select member */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                <span className="inline-flex items-center gap-1.5">
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold">1</span>
                  Search Member
                </span>
              </label>
              {selectedMember ? (
                <SelectedMemberCard member={selectedMember} onClear={() => { setSelectedMember(null); setSelectedAccount(null); setSelectedTransaction(null); }} />
              ) : (
                <MemberSearchDropdown
                  searchValue={memberSearch}
                  onSearchChange={setMemberSearch}
                  showResults={showMemberResults}
                  results={members}
                  loading={membersLoading}
                  onSelect={handleSelectMemberForReceipt}
                  placeholder="Type member name or number..."
                  ref={memberSearchRef}
                />
              )}
            </div>

            {/* Step 2: Select account */}
            {selectedMember && (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold">2</span>
                    Select Account
                  </span>
                </label>
                {accountsLoading ? (
                  <div className="text-sm text-muted-foreground py-2">Loading accounts...</div>
                ) : memberAccounts.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-2">No savings accounts found</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {memberAccounts.map((acc: any) => (
                      <button
                        key={acc.id}
                        onClick={() => handleSelectAccountForReceipt(acc)}
                        className={`text-left p-3 rounded-lg border transition-colors ${
                          selectedAccount?.id === acc.id
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border hover:bg-muted/50"
                        }`}
                      >
                        <div className="text-sm font-mono font-medium">{acc.accountNumber}</div>
                        <div className="text-xs text-muted-foreground">{acc.product?.productName}</div>
                        <div className="text-sm font-bold mt-1">{formatCurrency(acc.balance)}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{acc.status}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Select transaction */}
            {selectedAccount && (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold">3</span>
                    Select Transaction
                  </span>
                </label>
                {txnsLoading ? (
                  <div className="text-sm text-muted-foreground py-2">Loading transactions...</div>
                ) : accountTransactions.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-2">No transactions found for this account</div>
                ) : (
                  <div className="border border-border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 sticky top-0">
                        <tr>
                          <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Date</th>
                          <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Ref</th>
                          <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Type</th>
                          <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Amount</th>
                          <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Balance</th>
                          <th className="px-3 py-2 w-8"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {accountTransactions.map((txn: any) => (
                          <tr
                            key={txn.id}
                            onClick={() => handleSelectTransaction(txn)}
                            className={`cursor-pointer transition-colors ${
                              selectedTransaction?.id === txn.id
                                ? "bg-primary/10"
                                : "hover:bg-muted/30"
                            }`}
                          >
                            <td className="px-3 py-2">{txn.transactionDate}</td>
                            <td className="px-3 py-2 font-mono text-xs">{txn.transactionNumber}</td>
                            <td className="px-3 py-2">
                              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                                txn.transactionType?.includes("DEPOSIT") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                              }`}>
                                {txn.transactionType?.replace(/_/g, " ")}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right font-medium">{formatCurrency(txn.amount)}</td>
                            <td className="px-3 py-2 text-right">{txn.balanceAfter != null ? formatCurrency(txn.balanceAfter) : "-"}</td>
                            <td className="px-3 py-2">
                              {selectedTransaction?.id === txn.id && <Check className="w-4 h-4 text-primary" />}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Receipt output */}
          {receiptLoading && <div className="text-center text-sm text-muted-foreground py-4">Generating receipt...</div>}
          {receipt && (
            <div className="bg-white rounded-xl border border-border p-8 max-w-lg mx-auto print:border-0 print:shadow-none print:p-4" id="printable-receipt">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold">ISEKE SACCOS</h2>
                <p className="text-sm text-muted-foreground">Dodoma, Tanzania</p>
                <div className="h-px bg-border my-3" />
                <p className="text-sm font-semibold">TRANSACTION RECEIPT</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Receipt No:</span><span className="font-mono">{receipt.receiptNumber}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Date:</span><span>{receipt.transactionDate}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Time:</span><span>{receipt.transactionTime}</span></div>
                <div className="h-px bg-border my-2" />
                <div className="flex justify-between"><span className="text-muted-foreground">Member:</span><span>{receipt.memberName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Member No:</span><span>{receipt.memberNumber}</span></div>
                {receipt.accountNumber && <div className="flex justify-between"><span className="text-muted-foreground">Account:</span><span className="font-mono">{receipt.accountNumber}</span></div>}
                {receipt.loanNumber && <div className="flex justify-between"><span className="text-muted-foreground">Loan:</span><span className="font-mono">{receipt.loanNumber}</span></div>}
                <div className="h-px bg-border my-2" />
                <div className="flex justify-between"><span className="text-muted-foreground">Type:</span><span className="font-medium">{receipt.transactionType}</span></div>
                <div className="flex justify-between text-lg font-bold"><span>Amount:</span><span>{formatCurrency(receipt.amount)}</span></div>
                {receipt.balanceBefore != null && <div className="flex justify-between"><span className="text-muted-foreground">Balance Before:</span><span>{formatCurrency(receipt.balanceBefore)}</span></div>}
                {receipt.balanceAfter != null && <div className="flex justify-between"><span className="text-muted-foreground">Balance After:</span><span className="font-semibold">{formatCurrency(receipt.balanceAfter)}</span></div>}
                <div className="h-px bg-border my-2" />
                <div className="flex justify-between"><span className="text-muted-foreground">Payment Method:</span><span>{receipt.paymentMethod}</span></div>
                {receipt.referenceNumber && <div className="flex justify-between"><span className="text-muted-foreground">Reference:</span><span className="font-mono">{receipt.referenceNumber}</span></div>}
                {receipt.description && <div className="flex justify-between"><span className="text-muted-foreground">Description:</span><span>{receipt.description}</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">Processed By:</span><span>{receipt.processedBy}</span></div>
                {receipt.branchName && <div className="flex justify-between"><span className="text-muted-foreground">Branch:</span><span>{receipt.branchName}</span></div>}
              </div>
              <div className="text-center mt-6 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">Thank you for banking with ISEKE SACCOS</p>
                <p className="text-[10px] text-muted-foreground mt-1">This is a computer-generated receipt</p>
              </div>
            </div>
          )}
          {receipt && (
            <div className="text-center print:hidden">
              <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium mx-auto hover:bg-primary/90">
                <Printer className="w-4 h-4" /> Print Receipt
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========== Savings Passbook Tab ========== */}
      {tab === "passbook" && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-4 print:hidden space-y-4">
            {/* Step 1: Search & select member */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                <span className="inline-flex items-center gap-1.5">
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold">1</span>
                  Search Member
                </span>
              </label>
              {passbookSelectedMember ? (
                <SelectedMemberCard member={passbookSelectedMember} onClear={() => { setPassbookSelectedMember(null); setPassbookSelectedAccount(null); }} />
              ) : (
                <MemberSearchDropdown
                  searchValue={passbookMemberSearch}
                  onSearchChange={setPassbookMemberSearch}
                  showResults={showPassbookMemberResults}
                  results={passbookMembers}
                  loading={passbookMembersLoading}
                  onSelect={handleSelectMemberForPassbook}
                  placeholder="Type member name or number..."
                  ref={passbookMemberSearchRef}
                />
              )}
            </div>

            {/* Step 2: Select account */}
            {passbookSelectedMember && (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold">2</span>
                    Select Account
                  </span>
                </label>
                {passbookAccountsLoading ? (
                  <div className="text-sm text-muted-foreground py-2">Loading accounts...</div>
                ) : passbookAccounts.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-2">No savings accounts found</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {passbookAccounts.map((acc: any) => (
                      <button
                        key={acc.id}
                        onClick={() => setPassbookSelectedAccount(acc)}
                        className={`text-left p-3 rounded-lg border transition-colors ${
                          passbookSelectedAccount?.id === acc.id
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border hover:bg-muted/50"
                        }`}
                      >
                        <div className="text-sm font-mono font-medium">{acc.accountNumber}</div>
                        <div className="text-xs text-muted-foreground">{acc.product?.productName}</div>
                        <div className="text-sm font-bold mt-1">{formatCurrency(acc.balance)}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{acc.status}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Date range & generate */}
            {passbookSelectedAccount && (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold">3</span>
                    Date Range (optional) & Generate
                  </span>
                </label>
                <div className="flex flex-wrap gap-3 items-end">
                  <div>
                    <label className="block text-[10px] font-medium text-muted-foreground mb-0.5">Start Date</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-border bg-background text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-muted-foreground mb-0.5">End Date</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-border bg-background text-sm" />
                  </div>
                  <button onClick={handleGeneratePassbook}
                    disabled={passbookLoading} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90">
                    {passbookLoading ? "Loading..." : "Generate Passbook"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Passbook output */}
          {passbook && (
            <>
              <div className="bg-white rounded-xl border border-border p-6 print:border-0 print:p-4" id="printable-passbook">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold">ISEKE SACCOS</h2>
                  <p className="text-sm font-semibold mt-1">SAVINGS PASSBOOK</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div><span className="text-muted-foreground">Member: </span><span className="font-medium">{passbook.memberName}</span></div>
                  <div><span className="text-muted-foreground">Member No: </span><span className="font-mono">{passbook.memberNumber}</span></div>
                  <div><span className="text-muted-foreground">Account: </span><span className="font-mono">{passbook.accountNumber}</span></div>
                  <div><span className="text-muted-foreground">Product: </span><span>{passbook.productName}</span></div>
                  <div><span className="text-muted-foreground">Period: </span><span>{passbook.periodStart} - {passbook.periodEnd}</span></div>
                  <div><span className="text-muted-foreground">Balance: </span><span className="font-bold">{formatCurrency(passbook.currentBalance)}</span></div>
                </div>
                <table className="w-full text-sm border border-border">
                  <thead><tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-3 py-2">Date</th>
                    <th className="text-left px-3 py-2">Ref</th>
                    <th className="text-left px-3 py-2">Description</th>
                    <th className="text-right px-3 py-2">Debit</th>
                    <th className="text-right px-3 py-2">Credit</th>
                    <th className="text-right px-3 py-2">Balance</th>
                  </tr></thead>
                  <tbody>
                    {(passbook.entries as any[])?.map((e: any, i: number) => (
                      <tr key={i} className="border-b border-border">
                        <td className="px-3 py-1.5">{e.date}</td>
                        <td className="px-3 py-1.5 font-mono text-xs">{e.reference}</td>
                        <td className="px-3 py-1.5">{e.description}</td>
                        <td className="px-3 py-1.5 text-right text-red-600">{e.debit ? formatCurrency(e.debit) : ""}</td>
                        <td className="px-3 py-1.5 text-right text-green-600">{e.credit ? formatCurrency(e.credit) : ""}</td>
                        <td className="px-3 py-1.5 text-right font-medium">{e.balance != null ? formatCurrency(e.balance) : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-center print:hidden">
                <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium mx-auto hover:bg-primary/90">
                  <Printer className="w-4 h-4" /> Print Passbook
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========== Loan Statement Tab ========== */}
      {tab === "loan" && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-4 print:hidden space-y-4">
            {/* Step 1: Search & select member */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                <span className="inline-flex items-center gap-1.5">
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold">1</span>
                  Search Member
                </span>
              </label>
              {loanSelectedMember ? (
                <SelectedMemberCard member={loanSelectedMember} onClear={() => { setLoanSelectedMember(null); setLoanSelectedLoan(null); }} />
              ) : (
                <MemberSearchDropdown
                  searchValue={loanMemberSearch}
                  onSearchChange={setLoanMemberSearch}
                  showResults={showLoanMemberResults}
                  results={loanMembers}
                  loading={loanMembersLoading}
                  onSelect={handleSelectMemberForLoan}
                  placeholder="Type member name or number..."
                  ref={loanMemberSearchRef}
                />
              )}
            </div>

            {/* Step 2: Select loan */}
            {loanSelectedMember && (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold">2</span>
                    Select Loan
                  </span>
                </label>
                {loansLoading ? (
                  <div className="text-sm text-muted-foreground py-2">Loading loans...</div>
                ) : memberLoans.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-2">No loans found for this member</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {memberLoans.map((loan: any) => (
                      <button
                        key={loan.id}
                        onClick={() => setLoanSelectedLoan(loan)}
                        className={`text-left p-3 rounded-lg border transition-colors ${
                          loanSelectedLoan?.id === loan.id
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-mono font-medium">{loan.loanNumber}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            loan.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                            loan.status === "CLOSED" ? "bg-gray-100 text-gray-700" :
                            loan.status === "DISBURSED" ? "bg-blue-100 text-blue-700" :
                            "bg-yellow-100 text-yellow-700"
                          }`}>{loan.status}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">{loan.product?.productName}</div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-muted-foreground">Principal:</span>
                          <span className="text-sm font-bold">{formatCurrency(loan.principalAmount)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Outstanding:</span>
                          <span className="text-sm font-bold text-red-600">{formatCurrency(loan.outstandingPrincipal)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Generate button */}
            {loanSelectedLoan && (
              <div>
                <button onClick={handleGenerateLoanStatement}
                  disabled={loanLoading} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90">
                  {loanLoading ? "Loading..." : "Generate Statement"}
                </button>
              </div>
            )}
          </div>

          {/* Loan statement output */}
          {loanStatement && (
            <>
              <div className="bg-white rounded-xl border border-border p-6 print:border-0 print:p-4" id="printable-loan">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold">ISEKE SACCOS</h2>
                  <p className="text-sm font-semibold mt-1">LOAN STATEMENT</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div><span className="text-muted-foreground">Member: </span><span className="font-medium">{loanStatement.memberName}</span></div>
                  <div><span className="text-muted-foreground">Loan No: </span><span className="font-mono">{loanStatement.loanNumber}</span></div>
                  <div><span className="text-muted-foreground">Product: </span><span>{loanStatement.productName}</span></div>
                  <div><span className="text-muted-foreground">Status: </span><span className="font-medium">{loanStatement.status}</span></div>
                  <div><span className="text-muted-foreground">Principal: </span><span className="font-bold">{formatCurrency(loanStatement.principalAmount)}</span></div>
                  <div><span className="text-muted-foreground">Outstanding: </span><span className="font-bold text-red-600">{formatCurrency(loanStatement.outstandingPrincipal)}</span></div>
                  <div><span className="text-muted-foreground">Interest Rate: </span><span>{(Number(loanStatement.interestRate) * 100).toFixed(1)}%</span></div>
                  <div><span className="text-muted-foreground">Term: </span><span>{loanStatement.termMonths} months</span></div>
                  <div><span className="text-muted-foreground">Disbursed: </span><span>{loanStatement.disbursementDate}</span></div>
                  <div><span className="text-muted-foreground">Total Paid: </span><span className="font-bold text-green-600">{formatCurrency(loanStatement.totalPaid)}</span></div>
                </div>
                <h3 className="font-semibold text-sm mb-2">Payment History</h3>
                <table className="w-full text-sm border border-border">
                  <thead><tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-3 py-2">Date</th>
                    <th className="text-left px-3 py-2">Reference</th>
                    <th className="text-left px-3 py-2">Type</th>
                    <th className="text-right px-3 py-2">Amount</th>
                    <th className="text-left px-3 py-2">Method</th>
                  </tr></thead>
                  <tbody>
                    {(loanStatement.payments as any[])?.map((p: any, i: number) => (
                      <tr key={i} className="border-b border-border">
                        <td className="px-3 py-1.5">{p.date}</td>
                        <td className="px-3 py-1.5 font-mono text-xs">{p.reference}</td>
                        <td className="px-3 py-1.5">{p.type}</td>
                        <td className="px-3 py-1.5 text-right font-medium">{formatCurrency(p.amount)}</td>
                        <td className="px-3 py-1.5">{p.paymentMethod}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-center print:hidden">
                <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium mx-auto hover:bg-primary/90">
                  <Printer className="w-4 h-4" /> Print Statement
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #printable-receipt, #printable-receipt *,
          #printable-passbook, #printable-passbook *,
          #printable-loan, #printable-loan * {
            visibility: visible;
          }
          #printable-receipt, #printable-passbook, #printable-loan {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
