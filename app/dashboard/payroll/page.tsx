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
import {
  Receipt,
  Play,
  Loader2,
  Plus,
  X,
  Search,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Building2,
  CalendarDays,
  User,
  Wallet,
  CreditCard,
  FileText,
  Banknote,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import ErrorDisplay from "@/components/ui/ErrorDisplay";

/* ─── Searchable Member Dropdown ─── */
function MemberSearch({
  value,
  displayValue,
  onSelect,
}: {
  value: string;
  displayValue: string;
  onSelect: (id: string, member: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [searchMembers, { data, loading }] = useLazyQuery(SEARCH_MEMBERS);
  const results = data?.searchMembers?.content || [];

  const debounceRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = (term: string) => {
    setSearch(term);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (term.length < 2) return;
    debounceRef.current = setTimeout(() => {
      searchMembers({ variables: { searchTerm: term, page: 0, size: 8 } });
    }, 300);
  };

  return (
    <div ref={ref} className="relative">
      <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
        Member <span className="text-destructive">*</span>
      </label>
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          if (!open) {
            setSearch("");
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg border bg-card text-sm transition-all text-left ${
          open
            ? "border-primary ring-2 ring-primary/20"
            : "border-input hover:border-primary/40"
        }`}
      >
        <div className="p-1.5 rounded-md bg-blue-500/10 shrink-0">
          <User className="w-3.5 h-3.5 text-blue-600" />
        </div>
        <span className={`flex-1 truncate ${value ? "text-foreground font-medium" : "text-muted-foreground"}`}>
          {value ? displayValue : "Search by name or member number..."}
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-fade-in">
          <div className="p-3 border-b border-border bg-muted/20">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                autoFocus
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground"
                placeholder="Type name, number, or phone..."
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-56">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-6">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Searching...</span>
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center py-6 px-4">
                <User className="w-8 h-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {search.length >= 2 ? "No members found" : "Start typing to search"}
                </p>
              </div>
            ) : (
              results.map((m: any, i: number) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    onSelect(m.id, m);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-border/50 last:border-0 ${
                    value === m.id
                      ? "bg-primary/5"
                      : "hover:bg-muted/40"
                  }`}
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    value === m.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {m.firstName?.[0]}{m.lastName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {m.firstName} {m.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {m.memberNumber} {m.phoneNumber && `\u00B7 ${m.phoneNumber}`}
                    </p>
                  </div>
                  {value === m.id && (
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Account Selector ─── */
function AccountSelector({
  label,
  icon: Icon,
  iconColor,
  placeholder,
  emptyText,
  options,
  loading,
  value,
  onChange,
  renderOption,
  disabled,
}: {
  label: string;
  icon: any;
  iconColor: string;
  placeholder: string;
  emptyText: string;
  options: any[];
  loading: boolean;
  value: string;
  onChange: (id: string) => void;
  renderOption: (item: any) => string;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <div>
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
          {label}
        </label>
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg border border-dashed border-input bg-muted/20 text-sm text-muted-foreground">
          <div className="p-1.5 rounded-md bg-muted shrink-0">
            <Icon className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          Select a member first
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
          {label}
        </label>
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-input bg-card text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          Loading accounts...
        </div>
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div>
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
          {label}
        </label>
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg border border-dashed border-input bg-muted/20 text-sm text-muted-foreground">
          <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0" />
          {emptyText}
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div className="relative">
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md ${iconColor}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
        >
          <option value="">{placeholder}</option>
          {options.map((item: any) => (
            <option key={item.id} value={item.id}>{renderOption(item)}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}

/* ─── Form Field Wrapper ─── */
function FormField({
  label,
  required,
  icon: Icon,
  iconColor,
  children,
}: {
  label: string;
  required?: boolean;
  icon: any;
  iconColor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <div className="relative">
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md ${iconColor}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        {children}
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
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
  const [successMessage, setSuccessMessage] = useState("");

  const { data: employerData, loading: employersLoading, error: employersError } = useQuery(GET_EMPLOYERS);
  const employers = employerData?.employers || [];

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
      setSuccessMessage("Payroll deduction set up successfully!");
      setTimeout(() => setSuccessMessage(""), 4000);
    },
  });

  const handleMemberSelect = (id: string, member: any) => {
    const display = `${member.memberNumber} - ${member.firstName} ${member.lastName}`;
    setSelectedMemberDisplay(display);
    setDeductionData((prev) => ({ ...prev, memberId: id, savingsAccountId: "", loanAccountId: "" }));
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

  const isFormValid = deductionData.memberId && deductionData.employerId && deductionData.amount;

  if (employersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-[3px] border-muted border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-hover rounded-2xl p-6 lg:p-8 text-white">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute right-20 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-white/10">
                <Receipt className="w-5 h-5" />
              </div>
              <p className="text-white/70 text-sm font-medium">Payroll Management</p>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-1">Payroll Processing</h1>
            <p className="text-white/70 text-sm max-w-lg">
              Set up salary deductions and process monthly payroll batches for SACCOS members.
            </p>
          </div>
          <button
            onClick={() => setShowDeductionForm(!showDeductionForm)}
            className={`shrink-0 inline-flex items-center gap-2 font-semibold px-5 py-2.5 rounded-lg transition-all shadow-lg ${
              showDeductionForm
                ? "bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                : "bg-white text-primary hover:bg-white/90"
            }`}
          >
            {showDeductionForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showDeductionForm ? "Cancel" : "Setup Deduction"}
          </button>
        </div>
      </div>

      {employersError && <ErrorDisplay error={employersError} />}

      {/* Success Toast */}
      {successMessage && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl border bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400 animate-fade-in">
          <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {/* Setup Deduction Form */}
      {showDeductionForm && (
        <form onSubmit={handleSetupDeduction} className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
          <div className="px-6 py-4 border-b border-border bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Plus className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">New Payroll Deduction</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Configure a recurring salary deduction for a member</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Row 1: Member & Employer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <MemberSearch
                value={deductionData.memberId}
                displayValue={selectedMemberDisplay}
                onSelect={handleMemberSelect}
              />
              <FormField label="Employer" required icon={Building2} iconColor="bg-violet-500/10 text-violet-600">
                <select
                  value={deductionData.employerId}
                  onChange={(e) => setDeductionData({ ...deductionData, employerId: e.target.value })}
                  className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                >
                  <option value="">Select employer</option>
                  {employers.map((emp: any) => (
                    <option key={emp.id} value={emp.id}>{emp.employerName}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </FormField>
            </div>

            {/* Row 2: Type & Amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField label="Deduction Type" required icon={FileText} iconColor="bg-amber-500/10 text-amber-600">
                <select
                  value={deductionData.deductionType}
                  onChange={(e) => setDeductionData({ ...deductionData, deductionType: e.target.value, savingsAccountId: "", loanAccountId: "" })}
                  className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                >
                  <option value="SAVINGS">Savings Contribution</option>
                  <option value="LOAN_REPAYMENT">Loan Repayment</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </FormField>
              <FormField label="Amount (TZS)" required icon={Banknote} iconColor="bg-emerald-500/10 text-emerald-600">
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={deductionData.amount}
                  onChange={(e) => setDeductionData({ ...deductionData, amount: e.target.value })}
                  className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground tabular-nums"
                  placeholder="e.g. 150,000"
                />
              </FormField>
            </div>

            {/* Row 3: Account Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {deductionData.deductionType === "SAVINGS" && (
                <AccountSelector
                  label="Savings Account"
                  icon={Wallet}
                  iconColor="bg-emerald-500/10 text-emerald-600"
                  placeholder="Select savings account"
                  emptyText="No active savings accounts"
                  options={savingsAccounts.filter((a: any) => a.status === "ACTIVE")}
                  loading={savingsLoading}
                  value={deductionData.savingsAccountId}
                  onChange={(id) => setDeductionData({ ...deductionData, savingsAccountId: id })}
                  renderOption={(a: any) => `${a.accountNumber} \u2014 ${a.product?.productName || "Savings"} (${formatCurrency(a.balance)})`}
                  disabled={!deductionData.memberId}
                />
              )}
              {deductionData.deductionType === "LOAN_REPAYMENT" && (
                <AccountSelector
                  label="Loan Account"
                  icon={CreditCard}
                  iconColor="bg-violet-500/10 text-violet-600"
                  placeholder="Select loan account"
                  emptyText="No active loan accounts"
                  options={loanAccounts.filter((a: any) => a.status === "ACTIVE" || a.status === "DISBURSED")}
                  loading={loansLoading}
                  value={deductionData.loanAccountId}
                  onChange={(id) => setDeductionData({ ...deductionData, loanAccountId: id })}
                  renderOption={(a: any) => `${a.loanNumber} \u2014 ${a.product?.productName || "Loan"} (Bal: ${formatCurrency(a.outstandingPrincipal)})`}
                  disabled={!deductionData.memberId}
                />
              )}
              <div className={deductionData.deductionType ? "" : "md:col-span-2"}>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-muted">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    value={deductionData.description}
                    onChange={(e) => setDeductionData({ ...deductionData, description: e.target.value })}
                    className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground"
                    placeholder="e.g. Monthly savings deduction"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Footer */}
          <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {isFormValid ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready to submit
                </span>
              ) : (
                "Fill in all required fields to continue"
              )}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeductionForm(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={settingUp || !isFormValid}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2 rounded-lg transition-all disabled:opacity-40 disabled:pointer-events-none shadow-sm"
              >
                {settingUp ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Setup Deduction
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Process Batch Card */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <Play className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Process Payroll Batch</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Run monthly salary deductions for an employer</p>
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Employer</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-violet-500/10">
                  <Building2 className="w-3.5 h-3.5 text-violet-600" />
                </div>
                <select
                  value={selectedEmployer}
                  onChange={(e) => setSelectedEmployer(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                >
                  <option value="">Select employer</option>
                  {employers.map((emp: any) => (
                    <option key={emp.id} value={emp.id}>{emp.employerName}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="min-w-[180px]">
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Period</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-amber-500/10">
                  <CalendarDays className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <input
                  type="month"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>
            <button
              onClick={handleProcess}
              disabled={!selectedEmployer || !period || processing}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-all disabled:opacity-40 disabled:pointer-events-none shadow-sm"
            >
              {processing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Process Batch
            </button>
          </div>
        </div>
      </div>

      {/* Batch Result */}
      {batchResult && (
        <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Receipt className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Batch Results</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Batch #{batchResult.batchNumber} &middot; {batchResult.period}</p>
              </div>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getStatusColor(batchResult.status)}`}>
              {batchResult.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
            {[
              { label: "Total Deductions", value: batchResult.totalDeductions, bg: "bg-muted/30", color: "text-foreground", icon: Receipt },
              { label: "Successful", value: batchResult.successfulDeductions, bg: "bg-emerald-500/5", color: "text-emerald-600", icon: CheckCircle2 },
              { label: "Failed", value: batchResult.failedDeductions, bg: "bg-red-500/5", color: "text-red-600", icon: XCircle },
              { label: "Total Amount", value: formatCurrency(batchResult.totalAmount), bg: "bg-blue-500/5", color: "text-blue-600", icon: Banknote },
            ].map((stat, i) => (
              <div key={i} className={`${stat.bg} bg-card p-5 flex flex-col items-center text-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color} mb-2 opacity-60`} />
                <p className={`text-2xl font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
                <p className="text-[11px] text-muted-foreground mt-1 uppercase tracking-wider font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!batchResult && !showDeductionForm && employers.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-10 text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
            <Receipt className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Ready to Process</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Select an employer and period above to process payroll, or set up new deductions for members.
          </p>
          <button
            onClick={() => setShowDeductionForm(true)}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Setup a new deduction <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
