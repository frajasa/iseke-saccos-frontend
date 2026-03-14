"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
import { GET_LOAN_INSURANCE_POLICIES, CREATE_LOAN_INSURANCE_POLICY, SUBMIT_INSURANCE_CLAIM, PROCESS_INSURANCE_CLAIM, GET_LOAN_ACCOUNTS } from "@/lib/graphql/queries";
import { LoanInsurancePolicy, LoanAccount } from "@/lib/types";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { isNullListError } from "@/lib/error-utils";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import { Search, ChevronDown, X } from "lucide-react";

export default function LoanInsurancePage() {
  const [selectedLoan, setSelectedLoan] = useState<LoanAccount | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<LoanInsurancePolicy | null>(null);
  const [claimAmount, setClaimAmount] = useState("");
  const [claimReason, setClaimReason] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch all active/disbursed loans for the selector
  const { data: loansData, loading: loansLoading } = useQuery(GET_LOAN_ACCOUNTS, {
    variables: { page: 0, size: 200 },
  });

  const allLoans: LoanAccount[] = loansData?.loanAccounts?.content || [];

  // Filter loans by search term (loan number or member name)
  const filteredLoans = allLoans.filter((loan) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const memberName = `${loan.member?.firstName || ""} ${loan.member?.lastName || ""}`.toLowerCase();
    const loanNumber = (loan.loanNumber || "").toLowerCase();
    const memberNumber = (loan.member?.memberNumber || "").toLowerCase();
    return loanNumber.includes(term) || memberName.includes(term) || memberNumber.includes(term);
  });

  // Fetch policies for selected loan
  const { data, loading, error, refetch } = useQuery(GET_LOAN_INSURANCE_POLICIES, {
    variables: { loanId: selectedLoan?.id },
    skip: !selectedLoan,
  });

  const [createPolicy, { loading: creating }] = useMutation(CREATE_LOAN_INSURANCE_POLICY, {
    onCompleted: () => refetch(),
  });

  const [submitClaim, { loading: submitting }] = useMutation(SUBMIT_INSURANCE_CLAIM, {
    onCompleted: () => { setShowClaimModal(false); setClaimAmount(""); setClaimReason(""); refetch(); },
  });

  const [processClaim] = useMutation(PROCESS_INSURANCE_CLAIM, {
    onCompleted: () => refetch(),
  });

  const policies: LoanInsurancePolicy[] = data?.loanInsurancePolicies || [];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelectLoan = (loan: LoanAccount) => {
    setSelectedLoan(loan);
    setSearchTerm("");
    setShowDropdown(false);
  };

  const handleClearSelection = () => {
    setSelectedLoan(null);
    setSearchTerm("");
  };

  const handleCreatePolicy = () => {
    if (!selectedLoan) return;
    createPolicy({ variables: { loanId: selectedLoan.id } });
  };

  const handleSubmitClaim = () => {
    if (!selectedPolicy || !claimAmount || !claimReason) return;
    submitClaim({
      variables: { policyId: selectedPolicy.id, claimAmount: parseFloat(claimAmount), reason: claimReason },
    });
  };

  const handleProcessClaim = (policyId: string, approved: boolean) => {
    processClaim({
      variables: { policyId, approved, processedBy: "Admin" },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Loan Insurance</h1>
        <p className="text-sm text-muted-foreground">Manage insurance policies and claims for loans</p>
      </div>

      {/* Loan Selector */}
      <div className="bg-card border border-border rounded-xl p-5">
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Select Loan Account</label>
        <div className="flex gap-3">
          <div className="relative flex-1" ref={dropdownRef}>
            {selectedLoan ? (
              <div className="flex items-center justify-between px-3 py-2 border border-border rounded-lg bg-background">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-medium text-foreground">{selectedLoan.loanNumber}</span>
                  <span className="text-sm text-muted-foreground">
                    {selectedLoan.member?.firstName} {selectedLoan.member?.lastName}
                  </span>
                  <span className="text-xs text-muted-foreground">({selectedLoan.member?.memberNumber})</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor(selectedLoan.status)}`}>
                    {selectedLoan.status}
                  </span>
                  <span className="text-sm font-medium text-foreground">{formatCurrency(selectedLoan.principalAmount)}</span>
                </div>
                <button onClick={handleClearSelection} className="p-1 text-muted-foreground hover:text-foreground rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setShowDropdown(true); }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Search by loan number, member name, or member number..."
                  className="w-full pl-9 pr-8 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            )}

            {/* Dropdown */}
            {showDropdown && !selectedLoan && (
              <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-72 overflow-y-auto">
                {loansLoading ? (
                  <div className="px-4 py-3 text-sm text-muted-foreground">Loading loans...</div>
                ) : filteredLoans.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-muted-foreground">No loans found</div>
                ) : (
                  filteredLoans.map((loan) => (
                    <button
                      key={loan.id}
                      onClick={() => handleSelectLoan(loan)}
                      className="w-full text-left px-4 py-2.5 hover:bg-muted/50 transition-colors border-b border-border last:border-0 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono font-medium text-foreground">{loan.loanNumber}</span>
                        <span className="text-sm text-muted-foreground">
                          {loan.member?.firstName} {loan.member?.lastName}
                        </span>
                        <span className="text-xs text-muted-foreground">({loan.member?.memberNumber})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor(loan.status)}`}>
                          {loan.status}
                        </span>
                        <span className="text-sm font-medium text-foreground">{formatCurrency(loan.principalAmount)}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {selectedLoan && (
            <button onClick={handleCreatePolicy} disabled={creating} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 whitespace-nowrap">
              {creating ? "Creating..." : "Create Policy"}
            </button>
          )}
        </div>
      </div>

      {error && !isNullListError(error) && <ErrorDisplay error={error} />}

      {selectedLoan && (
        loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading policies...</div>
        ) : policies.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No insurance policies found for this loan. Click &quot;Create Policy&quot; to add one.</div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Policy #</th>
                  <th className="text-right px-5 py-3 font-medium text-muted-foreground">Premium</th>
                  <th className="text-right px-5 py-3 font-medium text-muted-foreground">Max Insured</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Coverage</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Claim</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="px-5 py-3 font-mono text-foreground">{p.policyNumber}</td>
                    <td className="px-5 py-3 text-right text-foreground">{formatCurrency(p.premiumAmount)}</td>
                    <td className="px-5 py-3 text-right text-foreground">{formatCurrency(p.maxInsuredAmount)}</td>
                    <td className="px-5 py-3 text-foreground">{formatDate(p.coverageStartDate)} - {formatDate(p.coverageEndDate)}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(p.status)}`}>{p.status}</span>
                    </td>
                    <td className="px-5 py-3">
                      {p.claimStatus && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(p.claimStatus)}`}>
                          {p.claimStatus} {p.claimAmount ? `- ${formatCurrency(p.claimAmount)}` : ""}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 space-x-2">
                      {p.status === "ACTIVE" && !p.claimStatus && (
                        <button
                          onClick={() => { setSelectedPolicy(p); setShowClaimModal(true); }}
                          className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
                        >
                          File Claim
                        </button>
                      )}
                      {p.claimStatus === "PENDING" && (
                        <>
                          <button onClick={() => handleProcessClaim(p.id, true)} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">
                            Approve
                          </button>
                          <button onClick={() => handleProcessClaim(p.id, false)} className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200">
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Claim Modal */}
      {showClaimModal && selectedPolicy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowClaimModal(false)}>
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-foreground">Submit Insurance Claim</h2>
            <p className="text-sm text-muted-foreground">Policy: {selectedPolicy.policyNumber}</p>
            <p className="text-sm text-muted-foreground">Max insured: {formatCurrency(selectedPolicy.maxInsuredAmount)}</p>
            <input
              type="number"
              value={claimAmount}
              onChange={(e) => setClaimAmount(e.target.value)}
              placeholder="Claim Amount"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
            />
            <textarea
              value={claimReason}
              onChange={(e) => setClaimReason(e.target.value)}
              placeholder="Reason for claim..."
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowClaimModal(false)} className="px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted">
                Cancel
              </button>
              <button onClick={handleSubmitClaim} disabled={submitting} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                {submitting ? "Submitting..." : "Submit Claim"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
