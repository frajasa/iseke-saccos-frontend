"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client/react";
import {
  GET_EMPLOYERS,
  PROCESS_PAYROLL_BATCH,
  SETUP_PAYROLL_DEDUCTION,
  SEARCH_MEMBERS,
  GET_MEMBER_SAVINGS_ACCOUNTS,
  GET_MEMBER_LOAN_ACCOUNTS,
} from "@/lib/graphql/queries";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import { Receipt, Play, Loader2, Plus, X, Search, ChevronDown } from "lucide-react";
import ErrorDisplay from "@/components/ui/ErrorDisplay";

function SearchableDropdown({
  label,
  placeholder,
  onSearch,
  options,
  loading,
  value,
  displayValue,
  onChange,
  renderOption,
}: {
  label: string;
  placeholder: string;
  onSearch: (term: string) => void;
  options: any[];
  loading: boolean;
  value: string;
  displayValue: string;
  onChange: (id: string, item: any) => void;
  renderOption: (item: any) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearchChange = (term: string) => {
    setSearch(term);
    onSearch(term);
  };

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
      <button
        type="button"
        onClick={() => { setOpen(!open); if (!open) handleSearchChange(""); }}
        className="w-full flex items-center justify-between px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-left"
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>
          {value ? displayValue : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-64 overflow-hidden">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                autoFocus
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Type to search..."
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-48">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : options.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {search ? "No results found" : "Type to search..."}
              </p>
            ) : (
              options.map((item: any) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onChange(item.id, item);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors ${
                    value === item.id ? "bg-primary/10 text-primary" : "text-foreground"
                  }`}
                >
                  {renderOption(item)}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AccountDropdown({
  label,
  placeholder,
  options,
  loading,
  value,
  onChange,
  renderOption,
  disabled,
}: {
  label: string;
  placeholder: string;
  options: any[];
  loading: boolean;
  value: string;
  onChange: (id: string) => void;
  renderOption: (item: any) => React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
      {disabled ? (
        <div className="w-full px-4 py-2 rounded-lg border border-input bg-muted/30 text-muted-foreground text-sm">
          Select a member first
        </div>
      ) : loading ? (
        <div className="w-full flex items-center gap-2 px-4 py-2 rounded-lg border border-input bg-background text-muted-foreground text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading accounts...
        </div>
      ) : options.length === 0 ? (
        <div className="w-full px-4 py-2 rounded-lg border border-input bg-muted/30 text-muted-foreground text-sm">
          No accounts found for this member
        </div>
      ) : (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        >
          <option value="">{placeholder}</option>
          {options.map((item: any) => (
            <option key={item.id} value={item.id}>
              {renderOption(item)}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export default function PayrollPage() {
  const [selectedEmployer, setSelectedEmployer] = useState("");
  const [period, setPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [batchResult, setBatchResult] = useState<any>(null);
  const [showDeductionForm, setShowDeductionForm] = useState(false);
  const [deductionData, setDeductionData] = useState({
    memberId: "",
    employerId: "",
    deductionType: "SAVINGS",
    savingsAccountId: "",
    loanAccountId: "",
    amount: "",
    description: "",
  });
  const [selectedMemberDisplay, setSelectedMemberDisplay] = useState("");

  const { data: employerData, loading: employersLoading, error: employersError } = useQuery(GET_EMPLOYERS);
  const employers = employerData?.employers || [];

  const [searchMembers, { data: memberSearchData, loading: membersLoading }] = useLazyQuery(SEARCH_MEMBERS);
  const memberResults = memberSearchData?.searchMembers?.content || [];

  const [fetchSavingsAccounts, { data: savingsData, loading: savingsLoading }] = useLazyQuery(GET_MEMBER_SAVINGS_ACCOUNTS);
  const savingsAccounts = savingsData?.memberSavingsAccounts || [];

  const [fetchLoanAccounts, { data: loanData, loading: loansLoading }] = useLazyQuery(GET_MEMBER_LOAN_ACCOUNTS);
  const loanAccounts = loanData?.memberLoanAccounts || [];

  const [processBatch, { loading: processing }] = useMutation(PROCESS_PAYROLL_BATCH, {
    onCompleted: (data) => setBatchResult(data.processPayrollBatch),
  });

  const [setupDeduction, { loading: settingUp }] = useMutation(SETUP_PAYROLL_DEDUCTION, {
    onCompleted: () => {
      setShowDeductionForm(false);
      setDeductionData({ memberId: "", employerId: "", deductionType: "SAVINGS", savingsAccountId: "", loanAccountId: "", amount: "", description: "" });
      setSelectedMemberDisplay("");
    },
  });

  const debounceRef = useRef<NodeJS.Timeout>(null);
  const handleMemberSearch = useCallback((term: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (term.length < 2) return;
    debounceRef.current = setTimeout(() => {
      searchMembers({ variables: { searchTerm: term, page: 0, size: 10 } });
    }, 300);
  }, [searchMembers]);

  const handleMemberSelect = (id: string, member: any) => {
    const display = `${member.memberNumber} - ${member.firstName} ${member.lastName}`;
    setSelectedMemberDisplay(display);
    setDeductionData((prev) => ({
      ...prev,
      memberId: id,
      savingsAccountId: "",
      loanAccountId: "",
    }));
    fetchSavingsAccounts({ variables: { memberId: id } });
    fetchLoanAccounts({ variables: { memberId: id } });
  };

  const handleProcess = () => {
    if (!selectedEmployer || !period) return;
    processBatch({ variables: { employerId: selectedEmployer, period } });
  };

  const handleSetupDeduction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deductionData.memberId || !deductionData.employerId || !deductionData.amount) return;
    setupDeduction({
      variables: {
        ...deductionData,
        amount: parseFloat(deductionData.amount),
        savingsAccountId: deductionData.savingsAccountId || undefined,
        loanAccountId: deductionData.loanAccountId || undefined,
      },
    });
  };

  if (employersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-[3px] border-muted border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Payroll Processing</h1>
          <p className="text-muted-foreground mt-1">Process salary deductions for SACCOS members</p>
        </div>
        <button
          onClick={() => setShowDeductionForm(!showDeductionForm)}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          {showDeductionForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showDeductionForm ? "Cancel" : "Setup Deduction"}
        </button>
      </div>

      {employersError && <ErrorDisplay error={employersError} />}

      {/* Setup Deduction Form */}
      {showDeductionForm && (
        <form onSubmit={handleSetupDeduction} className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-base font-semibold text-foreground mb-4">Setup Payroll Deduction</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchableDropdown
              label="Member *"
              placeholder="Search by name or member number..."
              onSearch={handleMemberSearch}
              options={memberResults}
              loading={membersLoading}
              value={deductionData.memberId}
              displayValue={selectedMemberDisplay}
              onChange={handleMemberSelect}
              renderOption={(m: any) => (
                <div>
                  <span className="font-medium">{m.memberNumber}</span>
                  <span className="text-muted-foreground"> - {m.firstName} {m.lastName}</span>
                  {m.phoneNumber && <span className="text-xs text-muted-foreground ml-2">({m.phoneNumber})</span>}
                </div>
              )}
            />
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Employer *</label>
              <select
                value={deductionData.employerId}
                onChange={(e) => setDeductionData({ ...deductionData, employerId: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="">Select employer</option>
                {employers.map((emp: any) => (
                  <option key={emp.id} value={emp.id}>{emp.employerName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Deduction Type *</label>
              <select
                value={deductionData.deductionType}
                onChange={(e) => setDeductionData({ ...deductionData, deductionType: e.target.value, savingsAccountId: "", loanAccountId: "" })}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="SAVINGS">Savings</option>
                <option value="LOAN_REPAYMENT">Loan Repayment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Amount *</label>
              <input
                type="number"
                min="0"
                step="100"
                value={deductionData.amount}
                onChange={(e) => setDeductionData({ ...deductionData, amount: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Deduction amount"
              />
            </div>
            {deductionData.deductionType === "SAVINGS" && (
              <AccountDropdown
                label="Savings Account"
                placeholder="Select savings account"
                options={savingsAccounts.filter((a: any) => a.status === "ACTIVE")}
                loading={savingsLoading}
                value={deductionData.savingsAccountId}
                onChange={(id) => setDeductionData({ ...deductionData, savingsAccountId: id })}
                renderOption={(a: any) =>
                  `${a.accountNumber} - ${a.product?.productName || "Savings"} (${formatCurrency(a.balance)})`
                }
                disabled={!deductionData.memberId}
              />
            )}
            {deductionData.deductionType === "LOAN_REPAYMENT" && (
              <AccountDropdown
                label="Loan Account"
                placeholder="Select loan account"
                options={loanAccounts.filter((a: any) => a.status === "ACTIVE" || a.status === "DISBURSED")}
                loading={loansLoading}
                value={deductionData.loanAccountId}
                onChange={(id) => setDeductionData({ ...deductionData, loanAccountId: id })}
                renderOption={(a: any) =>
                  `${a.loanNumber} - ${a.product?.productName || "Loan"} (Outstanding: ${formatCurrency(a.outstandingPrincipal)})`
                }
                disabled={!deductionData.memberId}
              />
            )}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">Description</label>
              <input
                type="text"
                value={deductionData.description}
                onChange={(e) => setDeductionData({ ...deductionData, description: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Optional description"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={settingUp}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {settingUp && <Loader2 className="w-4 h-4 animate-spin" />}
              Setup Deduction
            </button>
          </div>
        </form>
      )}

      {/* Process Batch */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">Process Payroll Batch</h2>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Employer</label>
            <select
              value={selectedEmployer}
              onChange={(e) => setSelectedEmployer(e.target.value)}
              className="px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-w-[200px]"
            >
              <option value="">Select employer</option>
              {employers.map((emp: any) => (
                <option key={emp.id} value={emp.id}>{emp.employerName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Period</label>
            <input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <button
            onClick={handleProcess}
            disabled={!selectedEmployer || !period || processing}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Process Batch
          </button>
        </div>
      </div>

      {/* Batch Result */}
      {batchResult && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">Batch Result</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-muted/30 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{batchResult.totalDeductions}</p>
              <p className="text-xs text-muted-foreground">Total Deductions</p>
            </div>
            <div className="bg-green-500/10 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{batchResult.successfulDeductions}</p>
              <p className="text-xs text-muted-foreground">Successful</p>
            </div>
            <div className="bg-red-500/10 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{batchResult.failedDeductions}</p>
              <p className="text-xs text-muted-foreground">Failed</p>
            </div>
            <div className="bg-blue-500/10 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(batchResult.totalAmount)}</p>
              <p className="text-xs text-muted-foreground">Total Amount</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Batch Number</span>
              <span className="font-medium">{batchResult.batchNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Period</span>
              <span className="font-medium">{batchResult.period}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(batchResult.status)}`}>
                {batchResult.status}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Info Card */}
      {!batchResult && employers.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <Receipt className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Select an employer and period, then click &quot;Process Batch&quot; to run payroll deductions.</p>
          <p className="text-sm text-muted-foreground mt-2">This will process all active salary deductions (savings contributions and loan repayments) for the selected employer&apos;s members.</p>
        </div>
      )}
    </div>
  );
}
