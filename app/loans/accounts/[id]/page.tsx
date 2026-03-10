"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_LOAN_ACCOUNT, GET_LOAN_REPAYMENT_SCHEDULE, GET_LOAN_TRANSACTIONS, APPROVE_LOAN, DISBURSE_LOAN, ADD_GUARANTOR, ADD_COLLATERAL, WRITE_OFF_LOAN, REFINANCE_LOAN } from "@/lib/graphql/queries";
import { ArrowLeft, DollarSign, Calendar, AlertCircle, ChevronLeft, ChevronRight, Receipt, CheckCircle, Banknote, UserPlus, Shield, Plus } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import AttachmentUpload from "@/components/AttachmentUpload";

export default function LoanAccountDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [schedulePage, setSchedulePage] = useState(0);
  const scheduleSize = 10;

  const { data, loading, error, refetch } = useQuery(GET_LOAN_ACCOUNT, {
    variables: { id },
  });

  const { data: scheduleData, loading: scheduleLoading } = useQuery(GET_LOAN_REPAYMENT_SCHEDULE, {
    variables: { loanId: id, page: schedulePage, size: scheduleSize },
  });

  const { data: txnData, loading: txnLoading } = useQuery(GET_LOAN_TRANSACTIONS, {
    variables: { loanId: id },
  });

  const refetchAll = [
    { query: GET_LOAN_ACCOUNT, variables: { id } },
    { query: GET_LOAN_REPAYMENT_SCHEDULE, variables: { loanId: id, page: schedulePage, size: scheduleSize } },
    { query: GET_LOAN_TRANSACTIONS, variables: { loanId: id } },
  ];

  const [approveLoan, { loading: approving }] = useMutation(APPROVE_LOAN, { refetchQueries: refetchAll });
  const [disburseLoan, { loading: disbursing }] = useMutation(DISBURSE_LOAN, { refetchQueries: refetchAll });
  const [addGuarantor, { loading: addingGuarantor }] = useMutation(ADD_GUARANTOR, { refetchQueries: refetchAll });
  const [addCollateral, { loading: addingCollateral }] = useMutation(ADD_COLLATERAL, { refetchQueries: refetchAll });
  const [writeOffLoan, { loading: writingOff }] = useMutation(WRITE_OFF_LOAN, { refetchQueries: refetchAll });
  const [refinanceLoan, { loading: refinancing }] = useMutation(REFINANCE_LOAN, { refetchQueries: refetchAll });

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDisburseModal, setShowDisburseModal] = useState(false);
  const [showGuarantorModal, setShowGuarantorModal] = useState(false);
  const [showCollateralModal, setShowCollateralModal] = useState(false);
  const [showWriteOffModal, setShowWriteOffModal] = useState(false);
  const [showRefinanceModal, setShowRefinanceModal] = useState(false);
  const [writeOffReason, setWriteOffReason] = useState("");
  const [refinanceForm, setRefinanceForm] = useState({ newTermMonths: "", newInterestRate: "", reason: "" });
  const [approvedAmount, setApprovedAmount] = useState("");
  const [disbursementDate, setDisbursementDate] = useState(new Date().toISOString().split("T")[0]);
  const [guarantorForm, setGuarantorForm] = useState({ guarantorName: "", guarantorPhone: "", guarantorNationalId: "", guaranteedAmount: "", relationship: "" });
  const [collateralForm, setCollateralForm] = useState({ collateralType: "", description: "", estimatedValue: "", registrationNumber: "", location: "" });

  const handleApprove = async () => {
    try {
      await approveLoan({
        variables: {
          id,
          approvedAmount: approvedAmount ? parseFloat(approvedAmount) : undefined,
        },
      });
      toast.success("Loan approved successfully");
      setShowApproveModal(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to approve loan");
    }
  };

  const handleDisburse = async () => {
    try {
      await disburseLoan({
        variables: {
          id,
          disbursementDate: disbursementDate || undefined,
        },
      });
      toast.success("Loan disbursed successfully");
      setShowDisburseModal(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to disburse loan");
    }
  };

  const handleAddGuarantor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addGuarantor({
        variables: {
          input: {
            loanId: id,
            guarantorName: guarantorForm.guarantorName,
            guarantorPhone: guarantorForm.guarantorPhone || undefined,
            guarantorNationalId: guarantorForm.guarantorNationalId || undefined,
            guaranteedAmount: parseFloat(guarantorForm.guaranteedAmount),
            relationship: guarantorForm.relationship || undefined,
          },
        },
      });
      toast.success("Guarantor added successfully");
      setShowGuarantorModal(false);
      setGuarantorForm({ guarantorName: "", guarantorPhone: "", guarantorNationalId: "", guaranteedAmount: "", relationship: "" });
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to add guarantor");
    }
  };

  const handleAddCollateral = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addCollateral({
        variables: {
          input: {
            loanId: id,
            collateralType: collateralForm.collateralType,
            description: collateralForm.description || undefined,
            estimatedValue: parseFloat(collateralForm.estimatedValue),
            registrationNumber: collateralForm.registrationNumber || undefined,
            location: collateralForm.location || undefined,
          },
        },
      });
      toast.success("Collateral added successfully");
      setShowCollateralModal(false);
      setCollateralForm({ collateralType: "", description: "", estimatedValue: "", registrationNumber: "", location: "" });
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to add collateral");
    }
  };

  const handleWriteOff = async () => {
    if (!writeOffReason.trim()) {
      toast.error("Please provide a reason for write-off");
      return;
    }
    try {
      await writeOffLoan({ variables: { loanId: id, reason: writeOffReason } });
      toast.success("Loan written off successfully");
      setShowWriteOffModal(false);
      setWriteOffReason("");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to write off loan");
    }
  };

  const handleRefinance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await refinanceLoan({
        variables: {
          loanId: id,
          newTermMonths: parseInt(refinanceForm.newTermMonths),
          newInterestRate: parseFloat(refinanceForm.newInterestRate),
          reason: refinanceForm.reason,
        },
      });
      toast.success("Loan refinanced successfully");
      setShowRefinanceModal(false);
      setRefinanceForm({ newTermMonths: "", newInterestRate: "", reason: "" });
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to refinance loan");
    }
  };

  const loan = data?.loanAccount;
  const transactions = txnData?.loanTransactions || [];
  const scheduleResult = scheduleData?.loanRepaymentSchedule;
  const schedule = scheduleResult?.content || [];
  const totalElements = scheduleResult?.totalElements || 0;
  const totalPages = scheduleResult?.totalPages || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-[3px] border-muted border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay error={error} variant="full-page" onRetry={() => refetch()} />;
  }

  if (!loan) {
    return <ErrorDisplay variant="full-page" title="Loan Not Found" message="The loan account you're looking for doesn't exist." />;
  }

  const totalOutstanding = Number(loan.outstandingPrincipal || 0) + Number(loan.outstandingInterest || 0) +
                          Number(loan.outstandingFees || 0) + Number(loan.outstandingPenalties || 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/members/${loan.member?.id || '#'}`}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Loan Account
            </h1>
            <p className="text-muted-foreground mt-1">
              {loan.loanNumber} - {loan.member?.firstName} {loan.member?.lastName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {loan.status === 'APPLIED' && (
            <button
              onClick={() => {
                setApprovedAmount(loan.principalAmount?.toString() || "");
                setShowApproveModal(true);
              }}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Approve Loan
            </button>
          )}
          {loan.status === 'APPROVED' && (
            <button
              onClick={() => {
                setDisbursementDate(new Date().toISOString().split("T")[0]);
                setShowDisburseModal(true);
              }}
              className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <Banknote className="w-4 h-4" />
              Disburse Loan
            </button>
          )}
          {(loan.status === 'DISBURSED' || loan.status === 'ACTIVE') && (
            <Link
              href={`/loans/accounts/${id}/repay`}
              className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <DollarSign className="w-4 h-4" />
              Make Repayment
            </Link>
          )}
          {(loan.status === 'DISBURSED' || loan.status === 'ACTIVE') && (
            <>
              <button
                onClick={() => setShowRefinanceModal(true)}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                <Receipt className="w-4 h-4" />
                Refinance
              </button>
              <button
                onClick={() => setShowWriteOffModal(true)}
                className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                <AlertCircle className="w-4 h-4" />
                Write Off
              </button>
            </>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
            loan.status
          )}`}
        >
          {loan.status}
        </span>
        {loan.daysInArrears > 0 && (
          <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium bg-red-500/10 text-red-600 border border-red-500/20">
            <AlertCircle className="w-4 h-4" />
            {loan.daysInArrears} days overdue
          </span>
        )}
      </div>

      {/* Loan Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Principal Amount</h3>
            <DollarSign className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-2xl font-bold tabular-nums">{formatCurrency(loan.principalAmount || 0)}</p>
          <p className="text-xs opacity-80 mt-1">{(Number(loan.interestRate || 0) * 100).toFixed(2)}% interest</p>
        </div>

        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Outstanding</h3>
            <AlertCircle className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-2xl font-bold tabular-nums">{formatCurrency(totalOutstanding)}</p>
          <p className="text-xs opacity-80 mt-1">
            Principal: {formatCurrency(loan.outstandingPrincipal || 0)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Total Paid</h3>
            <DollarSign className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-2xl font-bold tabular-nums">{formatCurrency(loan.totalPaid || 0)}</p>
          <p className="text-xs opacity-80 mt-1">
            {Number(loan.principalAmount || 0) > 0
              ? Math.min(100, Math.round(((Number(loan.principalAmount || 0) - Number(loan.outstandingPrincipal || 0)) / Number(loan.principalAmount || 1)) * 100))
              : 0}% of principal
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Next Payment</h3>
            <Calendar className="w-5 h-5 opacity-80" />
          </div>
          {loan.nextPaymentDate ? (
            <>
              <p className="text-2xl font-bold">{formatDate(loan.nextPaymentDate)}</p>
              <p className="text-xs opacity-80 mt-1">{loan.termMonths} months term</p>
            </>
          ) : (
            <p className="text-lg font-medium">No payment due</p>
          )}
        </div>
      </div>

      {/* Loan Details */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">
          Loan Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Product</p>
            <p className="text-foreground font-medium">{loan.product?.productName || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Branch</p>
            <p className="text-foreground font-medium">{loan.branch?.branchName || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Application Date</p>
            <p className="text-foreground font-medium">{formatDate(loan.applicationDate)}</p>
          </div>
          {loan.approvalDate && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Approval Date</p>
              <p className="text-foreground font-medium">{formatDate(loan.approvalDate)}</p>
            </div>
          )}
          {loan.disbursementDate && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Disbursement Date</p>
              <p className="text-foreground font-medium">{formatDate(loan.disbursementDate)}</p>
            </div>
          )}
          {loan.maturityDate && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Maturity Date</p>
              <p className="text-foreground font-medium">{formatDate(loan.maturityDate)}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Repayment Frequency</p>
            <p className="text-foreground font-medium">{loan.repaymentFrequency}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Interest Method</p>
            <p className="text-foreground font-medium">{loan.product?.interestMethod || 'N/A'}</p>
          </div>
          {loan.loanOfficer && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Loan Officer</p>
              <p className="text-foreground font-medium">{loan.loanOfficer}</p>
            </div>
          )}
          {loan.purpose && (
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground mb-1">Purpose</p>
              <p className="text-foreground font-medium">{loan.purpose}</p>
            </div>
          )}
        </div>
      </div>

      {/* Outstanding Breakdown */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">
          Outstanding Breakdown
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Principal</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(loan.outstandingPrincipal || 0)}</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Interest</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(loan.outstandingInterest || 0)}</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Fees</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(loan.outstandingFees || 0)}</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Penalties</p>
            <p className="text-xl font-bold text-destructive">{formatCurrency(loan.outstandingPenalties || 0)}</p>
          </div>
        </div>
      </div>

      {/* Guarantors */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-base font-semibold text-foreground">
              Guarantors
            </h2>
            <span className="text-sm text-muted-foreground">
              ({loan.guarantors?.length || 0})
            </span>
          </div>
          {(loan.status === 'APPLIED' || loan.status === 'APPROVED') && (
            <button
              onClick={() => setShowGuarantorModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Guarantor
            </button>
          )}
        </div>
        {(!loan.guarantors || loan.guarantors.length === 0) ? (
          <div className="p-8 text-center text-muted-foreground">
            No guarantors added yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">Name</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">Phone</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">National ID</th>
                  <th className="text-right py-3 px-6 text-xs font-medium text-muted-foreground uppercase">Guaranteed Amount</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">Relationship</th>
                  <th className="text-center py-3 px-6 text-xs font-medium text-muted-foreground uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {loan.guarantors.map((g: any) => (
                  <tr key={g.id} className="border-t border-border hover:bg-muted/30">
                    <td className="py-3 px-6 text-sm font-medium text-foreground">{g.guarantorName}</td>
                    <td className="py-3 px-6 text-sm text-muted-foreground">{g.guarantorPhone || '-'}</td>
                    <td className="py-3 px-6 text-sm text-muted-foreground">{g.guarantorNationalId || '-'}</td>
                    <td className="py-3 px-6 text-sm text-right font-medium">{formatCurrency(g.guaranteedAmount)}</td>
                    <td className="py-3 px-6 text-sm text-muted-foreground">{g.relationship || '-'}</td>
                    <td className="py-3 px-6 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(g.status)}`}>{g.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Collateral */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-base font-semibold text-foreground">
              Collateral
            </h2>
            <span className="text-sm text-muted-foreground">
              ({loan.collateral?.length || 0})
            </span>
          </div>
          {(loan.status === 'APPLIED' || loan.status === 'APPROVED') && (
            <button
              onClick={() => setShowCollateralModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Collateral
            </button>
          )}
        </div>
        {(!loan.collateral || loan.collateral.length === 0) ? (
          <div className="p-8 text-center text-muted-foreground">
            No collateral added yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">Type</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">Description</th>
                  <th className="text-right py-3 px-6 text-xs font-medium text-muted-foreground uppercase">Estimated Value</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">Reg. Number</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-muted-foreground uppercase">Location</th>
                  <th className="text-center py-3 px-6 text-xs font-medium text-muted-foreground uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {loan.collateral.map((c: any) => (
                  <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                    <td className="py-3 px-6 text-sm font-medium text-foreground">{c.collateralType}</td>
                    <td className="py-3 px-6 text-sm text-muted-foreground">{c.description || '-'}</td>
                    <td className="py-3 px-6 text-sm text-right font-medium">{formatCurrency(c.estimatedValue)}</td>
                    <td className="py-3 px-6 text-sm text-muted-foreground">{c.registrationNumber || '-'}</td>
                    <td className="py-3 px-6 text-sm text-muted-foreground">{c.location || '-'}</td>
                    <td className="py-3 px-6 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(c.status)}`}>{c.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Documents / Attachments */}
      <AttachmentUpload
        entityType="LOAN"
        entityId={id}
        requiredTypes={loan.product?.requiredDocuments?.split(",").map((s: string) => s.trim()).filter(Boolean)}
      />

      {/* Repayment Schedule */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            Repayment Schedule
          </h2>
          {totalElements > 0 && (
            <span className="text-sm text-muted-foreground">
              {totalElements} installment{totalElements !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {scheduleLoading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-[3px] border-muted border-t-primary rounded-full animate-spin mx-auto"></div>
          </div>
        ) : schedule.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No repayment schedule available
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      #
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Principal
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Interest
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Total Due
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Paid
                    </th>
                    <th className="text-center py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((item: any) => (
                    <tr
                      key={item.id}
                      className="border-t border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-4 px-6 text-sm font-medium text-foreground">
                        {item.installmentNumber}
                      </td>
                      <td className="py-4 px-6 text-sm text-muted-foreground">
                        {formatDate(item.dueDate)}
                      </td>
                      <td className="py-4 px-6 text-sm text-right font-medium">
                        {formatCurrency(item.principalDue)}
                      </td>
                      <td className="py-4 px-6 text-sm text-right font-medium">
                        {formatCurrency(item.interestDue)}
                      </td>
                      <td className="py-4 px-6 text-sm text-right font-semibold text-foreground">
                        {formatCurrency(item.totalDue)}
                      </td>
                      <td className="py-4 px-6 text-sm text-right font-semibold text-green-600">
                        {formatCurrency(item.totalPaid)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Showing {schedulePage * scheduleSize + 1}-{Math.min((schedulePage + 1) * scheduleSize, totalElements)} of {totalElements}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSchedulePage(p => Math.max(0, p - 1))}
                    disabled={schedulePage === 0}
                    className="inline-flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setSchedulePage(i)}
                        className={`w-8 h-8 text-sm font-medium rounded-lg transition-colors ${
                          schedulePage === i
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted text-muted-foreground'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setSchedulePage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={schedulePage >= totalPages - 1}
                    className="inline-flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Loan Transactions */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-base font-semibold text-foreground">
              Transactions
            </h2>
          </div>
          {transactions.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {txnLoading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-[3px] border-muted border-t-primary rounded-full animate-spin mx-auto"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No transactions recorded yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Transaction #
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-right py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Method
                  </th>
                  <th className="text-center py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn: any) => (
                  <tr
                    key={txn.id}
                    className="border-t border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 px-6 text-sm font-medium text-foreground">
                      {txn.transactionNumber}
                    </td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">
                      {formatDate(txn.transactionDate)}
                    </td>
                    <td className="py-4 px-6 text-sm text-foreground">
                      {txn.transactionType?.replace(/_/g, ' ')}
                    </td>
                    <td className="py-4 px-6 text-sm text-right font-semibold text-green-600">
                      {formatCurrency(txn.amount)}
                    </td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">
                      {txn.paymentMethod?.replace(/_/g, ' ')}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                          txn.status
                        )}`}
                      >
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approve Loan Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl max-w-md w-full p-6 shadow-xl border border-border animate-scale-in">
            <h2 className="text-xl font-bold text-foreground mb-2">Approve Loan</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Approve loan <span className="font-semibold">{loan.loanNumber}</span> for{" "}
              <span className="font-semibold">{loan.member?.firstName} {loan.member?.lastName}</span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Applied Amount
                </label>
                <p className="text-lg font-bold text-foreground">{formatCurrency(loan.principalAmount || 0)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Approved Amount (optional - leave blank for full amount)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(e.target.value)}
                  placeholder={loan.principalAmount?.toString() || ""}
                  className="block w-full rounded-md border border-input bg-background text-foreground px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowApproveModal(false)}
                className="flex-1 px-4 py-2.5 border border-border rounded-lg hover:bg-muted transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={approving}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold disabled:opacity-50"
              >
                {approving ? "Approving..." : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Guarantor Modal */}
      {showGuarantorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl max-w-lg w-full p-6 shadow-xl border border-border animate-scale-in">
            <h2 className="text-xl font-bold text-foreground mb-4">Add Guarantor</h2>
            <form onSubmit={handleAddGuarantor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Full Name *</label>
                <input type="text" required value={guarantorForm.guarantorName} onChange={(e) => setGuarantorForm({ ...guarantorForm, guarantorName: e.target.value })} className="block w-full rounded-md border border-input bg-background text-foreground px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Enter guarantor's full name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Phone Number</label>
                  <input type="tel" value={guarantorForm.guarantorPhone} onChange={(e) => setGuarantorForm({ ...guarantorForm, guarantorPhone: e.target.value })} className="block w-full rounded-md border border-input bg-background text-foreground px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary" placeholder="+255..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">National ID</label>
                  <input type="text" value={guarantorForm.guarantorNationalId} onChange={(e) => setGuarantorForm({ ...guarantorForm, guarantorNationalId: e.target.value })} className="block w-full rounded-md border border-input bg-background text-foreground px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Guaranteed Amount (TZS) *</label>
                  <input type="number" required step="0.01" value={guarantorForm.guaranteedAmount} onChange={(e) => setGuarantorForm({ ...guarantorForm, guaranteedAmount: e.target.value })} className="block w-full rounded-md border border-input bg-background text-foreground px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Relationship</label>
                  <input type="text" value={guarantorForm.relationship} onChange={(e) => setGuarantorForm({ ...guarantorForm, relationship: e.target.value })} className="block w-full rounded-md border border-input bg-background text-foreground px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary" placeholder="e.g. Friend, Colleague" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowGuarantorModal(false)} className="flex-1 px-4 py-2.5 border border-border rounded-lg hover:bg-muted transition-all font-medium">Cancel</button>
                <button type="submit" disabled={addingGuarantor} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold disabled:opacity-50">{addingGuarantor ? "Adding..." : "Add Guarantor"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Collateral Modal */}
      {showCollateralModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl max-w-lg w-full p-6 shadow-xl border border-border animate-scale-in">
            <h2 className="text-xl font-bold text-foreground mb-4">Add Collateral</h2>
            <form onSubmit={handleAddCollateral} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Collateral Type *</label>
                <select required value={collateralForm.collateralType} onChange={(e) => setCollateralForm({ ...collateralForm, collateralType: e.target.value })} className="block w-full rounded-md border border-input bg-background text-foreground px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary">
                  <option value="">Select type</option>
                  <option value="LAND">Land</option>
                  <option value="BUILDING">Building</option>
                  <option value="VEHICLE">Vehicle</option>
                  <option value="MACHINERY">Machinery</option>
                  <option value="SAVINGS">Savings</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                <input type="text" value={collateralForm.description} onChange={(e) => setCollateralForm({ ...collateralForm, description: e.target.value })} className="block w-full rounded-md border border-input bg-background text-foreground px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Brief description of the collateral" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Estimated Value (TZS) *</label>
                  <input type="number" required step="0.01" value={collateralForm.estimatedValue} onChange={(e) => setCollateralForm({ ...collateralForm, estimatedValue: e.target.value })} className="block w-full rounded-md border border-input bg-background text-foreground px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Registration Number</label>
                  <input type="text" value={collateralForm.registrationNumber} onChange={(e) => setCollateralForm({ ...collateralForm, registrationNumber: e.target.value })} className="block w-full rounded-md border border-input bg-background text-foreground px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Location</label>
                <input type="text" value={collateralForm.location} onChange={(e) => setCollateralForm({ ...collateralForm, location: e.target.value })} className="block w-full rounded-md border border-input bg-background text-foreground px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Physical location of the collateral" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowCollateralModal(false)} className="flex-1 px-4 py-2.5 border border-border rounded-lg hover:bg-muted transition-all font-medium">Cancel</button>
                <button type="submit" disabled={addingCollateral} className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-semibold disabled:opacity-50">{addingCollateral ? "Adding..." : "Add Collateral"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disburse Loan Modal */}
      {showDisburseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl max-w-md w-full p-6 shadow-xl border border-border animate-scale-in">
            <h2 className="text-xl font-bold text-foreground mb-2">Disburse Loan</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Disburse loan <span className="font-semibold">{loan.loanNumber}</span> for{" "}
              <span className="font-semibold">{loan.member?.firstName} {loan.member?.lastName}</span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Approved Amount
                </label>
                <p className="text-lg font-bold text-foreground">{formatCurrency(loan.principalAmount || 0)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Disbursement Date
                </label>
                <input
                  type="date"
                  value={disbursementDate}
                  onChange={(e) => setDisbursementDate(e.target.value)}
                  className="block w-full rounded-md border border-input bg-background text-foreground px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDisburseModal(false)}
                className="flex-1 px-4 py-2.5 border border-border rounded-lg hover:bg-muted transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDisburse}
                disabled={disbursing}
                className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-semibold disabled:opacity-50"
              >
                {disbursing ? "Disbursing..." : "Disburse"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Write-off Modal */}
      {showWriteOffModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-foreground mb-2">Write Off Loan</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This will write off loan {loan.loanNumber} with outstanding balance of {formatCurrency(loan.outstandingPrincipal)}. This action cannot be easily undone.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-1">Reason for Write-off *</label>
              <textarea
                value={writeOffReason}
                onChange={(e) => setWriteOffReason(e.target.value)}
                className="w-full border border-input rounded-lg p-2 bg-background text-foreground"
                rows={3}
                placeholder="Enter reason for writing off this loan..."
                required
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowWriteOffModal(false)} className="flex-1 px-4 py-2.5 border border-border rounded-lg hover:bg-muted transition-all font-medium">Cancel</button>
              <button onClick={handleWriteOff} disabled={writingOff} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold disabled:opacity-50">
                {writingOff ? "Processing..." : "Confirm Write Off"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refinance Modal */}
      {showRefinanceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-foreground mb-4">Refinance Loan</h3>
            <form onSubmit={handleRefinance} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">New Term (months) *</label>
                <input
                  type="number"
                  value={refinanceForm.newTermMonths}
                  onChange={(e) => setRefinanceForm({ ...refinanceForm, newTermMonths: e.target.value })}
                  className="w-full border border-input rounded-lg p-2 bg-background text-foreground"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">New Interest Rate (%) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={refinanceForm.newInterestRate}
                  onChange={(e) => setRefinanceForm({ ...refinanceForm, newInterestRate: e.target.value })}
                  className="w-full border border-input rounded-lg p-2 bg-background text-foreground"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Reason *</label>
                <textarea
                  value={refinanceForm.reason}
                  onChange={(e) => setRefinanceForm({ ...refinanceForm, reason: e.target.value })}
                  className="w-full border border-input rounded-lg p-2 bg-background text-foreground"
                  rows={2}
                  required
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowRefinanceModal(false)} className="flex-1 px-4 py-2.5 border border-border rounded-lg hover:bg-muted transition-all font-medium">Cancel</button>
                <button type="submit" disabled={refinancing} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold disabled:opacity-50">
                  {refinancing ? "Processing..." : "Refinance Loan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
