"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_MEMBER, GET_MEMBERS, DELETE_MEMBER, GET_MEMBER_SAVINGS_ACCOUNTS, GET_MEMBER_LOAN_ACCOUNTS, GET_ENHANCED_CREDIT_SCORE, CALCULATE_ENHANCED_CREDIT_SCORE, GET_MEMBER_RISK_ALERTS } from "@/lib/graphql/queries";
import { Member, EnhancedCreditScore, RiskAlert } from "@/lib/types";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Edit, Trash2, Mail, Phone, MapPin, Briefcase, DollarSign, User, Calendar, AlertCircle, TrendingUp, Coins, RefreshCw, Loader2, ShieldCheck } from "lucide-react";
import CreditScoreGauge from "@/components/CreditScoreGauge";
import ScoreBreakdownChart from "@/components/ScoreBreakdownChart";

import Link from "next/link";
import { toast } from "sonner";
import { formatDate, formatCurrency, calculateAge, getStatusColor } from "@/lib/utils";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import AttachmentUpload from "@/components/AttachmentUpload";

export default function MemberDetailPage() {
  const router = useRouter();
  const { id: memberId } = useParams<{ id: string }>();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_MEMBER, {
    variables: { id: memberId },
  });

  const { data: savingsData, error: savingsError, loading: savingsLoading, refetch: refetchSavings } = useQuery(GET_MEMBER_SAVINGS_ACCOUNTS, {
    variables: { memberId },
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  });

  const { data: loansData, error: loansError, loading: loansLoading, refetch: refetchLoans } = useQuery(GET_MEMBER_LOAN_ACCOUNTS, {
    variables: { memberId },
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  });

  const { data: creditData, refetch: refetchCredit } = useQuery(GET_ENHANCED_CREDIT_SCORE, {
    variables: { memberId },
    errorPolicy: "all",
  });
  const { data: alertsData } = useQuery(GET_MEMBER_RISK_ALERTS, {
    variables: { memberId },
    errorPolicy: "all",
  });
  const [calcScore, { loading: calcLoading }] = useMutation(CALCULATE_ENHANCED_CREDIT_SCORE, {
    onCompleted: () => {
      toast.success("Credit score recalculated");
      refetchCredit();
    },
    onError: (err) => toast.error(err.message),
  });

  const [deleteMember, { loading: deleteLoading }] = useMutation(DELETE_MEMBER, {
    refetchQueries: [{ query: GET_MEMBERS, variables: { page: 0, size: 20 } }],
    onCompleted: () => {
      router.push("/members");
    },
    onError: (error) => {
      toast.error(`Error deleting member: ${error.message}`);
    },
  });

  const member: Member | undefined = data?.member;
  const savingsAccounts = savingsData?.memberSavingsAccounts || [];
  const loanAccounts = loansData?.memberLoanAccounts || [];

  const handleDelete = async () => {
    setShowDeleteDialog(false);
    await deleteMember({
      variables: { id: memberId },
    });
  };

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

  if (!member) {
    return <ErrorDisplay variant="full-page" title="Member Not Found" message="The member you're looking for doesn't exist." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Breadcrumbs items={[{ label: "Members", href: "/members" }, { label: `${member.firstName} ${member.lastName}` }]} />
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/members"
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          {member.photoPath ? (
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 flex-shrink-0">
              <img src={member.photoPath} alt={`${member.firstName} ${member.lastName}`} className="object-cover w-full h-full" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-lg flex items-center justify-center flex-shrink-0">
              {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {[member.firstName, member.middleName, member.lastName].filter(Boolean).join(" ")}
            </h1>
            <p className="text-muted-foreground mt-1">
              Member #{member.memberNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/members/${memberId}/edit`}
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteDialog(true)}
            disabled={deleteLoading}
            className="inline-flex items-center justify-center gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Status Badge */}
      <div>
        <span
          className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
            member.status
          )}`}
        >
          {member.status}
        </span>
      </div>

      {/* Personal Information */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Date of Birth</p>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <p className="text-foreground font-medium">
                {formatDate(member.dateOfBirth)} ({calculateAge(member.dateOfBirth)} years)
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Gender</p>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <p className="text-foreground font-medium">{member.gender}</p>
            </div>
          </div>
          {member.maritalStatus && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Marital Status</p>
              <p className="text-foreground font-medium">{member.maritalStatus}</p>
            </div>
          )}
          {member.nationalId && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">National ID</p>
              <p className="text-foreground font-medium">{member.nationalId}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Membership Date</p>
            <p className="text-foreground font-medium">
              {formatDate(member.membershipDate)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Branch</p>
            <p className="text-foreground font-medium">
              {member.branch ? `${member.branch.branchName} (${member.branch.branchCode})` : "Not assigned"}
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">
          Contact Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Phone Number</p>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <p className="text-foreground font-medium">{member.phoneNumber}</p>
            </div>
          </div>
          {member.email && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Email</p>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <p className="text-foreground font-medium">{member.email}</p>
              </div>
            </div>
          )}
          <div className="md:col-span-2">
            <p className="text-sm text-muted-foreground mb-1">Address</p>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <p className="text-foreground font-medium">{member.address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Employment Information */}
      {(member.occupation || member.employer || member.monthlyIncome) && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Employment Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {member.occupation && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Occupation</p>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <p className="text-foreground font-medium">{member.occupation}</p>
                </div>
              </div>
            )}
            {member.employer && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Employer</p>
                <p className="text-foreground font-medium">{member.employer}</p>
              </div>
            )}
            {member.monthlyIncome && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Monthly Income</p>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <p className="text-foreground font-medium">
                    {formatCurrency(member.monthlyIncome)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Share Information */}
      {member.shares !== undefined && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Share Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-4 h-4 text-primary" />
                <p className="text-sm text-muted-foreground">Shares Owned</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{member.shares || 0}</p>
            </div>
            <div className="bg-success/5 rounded-lg p-4 border border-success/10">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-success" />
                <p className="text-sm text-muted-foreground">Share Value</p>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency((member.shares || 0) * 50000)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">@ TZS 50,000 per share</p>
            </div>
            <div className="bg-amber-500/5 rounded-lg p-4 border border-amber-500/10">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                <p className="text-sm text-muted-foreground">Max Loan Eligible</p>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency((member.shares || 0) * 50000 * 3)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">3x share value</p>
            </div>
          </div>
        </div>
      )}

      {/* Credit Score */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Credit Score</h2>
          </div>
          <button
            onClick={() => calcScore({ variables: { memberId } })}
            disabled={calcLoading}
            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-xs font-medium disabled:opacity-50 flex items-center gap-1.5"
          >
            {calcLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            {calcLoading ? "Calculating..." : "Recalculate"}
          </button>
        </div>
        {creditData?.enhancedCreditScore ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="flex justify-center">
              <CreditScoreGauge
                score={creditData.enhancedCreditScore.score}
                rating={creditData.enhancedCreditScore.rating}
                riskLevel={creditData.enhancedCreditScore.riskLevel}
                trend={creditData.enhancedCreditScore.trend || undefined}
                trendDelta={creditData.enhancedCreditScore.trendDelta || undefined}
              />
            </div>
            <div>
              <ScoreBreakdownChart
                transactionBehaviorScore={creditData.enhancedCreditScore.transactionBehaviorScore}
                savingsBehaviorScore={creditData.enhancedCreditScore.savingsBehaviorScore}
                loanHistoryScore={creditData.enhancedCreditScore.loanHistoryScore}
                financialStabilityScore={creditData.enhancedCreditScore.financialStabilityScore}
                memberProfileScore={creditData.enhancedCreditScore.memberProfileScore}
              />
            </div>
            <div className="space-y-3">
              {creditData.enhancedCreditScore.recommendation && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Recommendation</p>
                  <p className="text-sm text-foreground">{creditData.enhancedCreditScore.recommendation}</p>
                </div>
              )}
              {alertsData?.memberRiskAlerts?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Active Alerts</p>
                  <div className="flex flex-wrap gap-1">
                    {alertsData.memberRiskAlerts.slice(0, 5).map((a: RiskAlert) => (
                      <span key={a.id} className={`px-2 py-0.5 rounded text-xs font-medium ${
                        a.severity === "CRITICAL"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}>
                        {a.alertType.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No credit score available. Click &quot;Recalculate&quot; to generate one.
          </p>
        )}
      </div>

      {/* Next of Kin Information */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">
          Next of Kin Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Name</p>
            <p className="text-foreground font-medium">{member.nextOfKinName}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Phone Number</p>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <p className="text-foreground font-medium">{member.nextOfKinPhone}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Relationship</p>
            <p className="text-foreground font-medium">{member.nextOfKinRelationship}</p>
          </div>
        </div>
      </div>

      {/* Signature & Biometrics */}
      {(member.photoPath || member.signaturePath || member.fingerprintPath) && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Documents & Biometrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {member.photoPath && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Passport Photo</p>
                <div className="w-32 h-32 rounded-lg overflow-hidden border border-border">
                  <img src={member.photoPath} alt="Member photo" className="object-cover w-full h-full" />
                </div>
              </div>
            )}
            {member.signaturePath && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Signature</p>
                <div className="rounded-lg overflow-hidden border border-border bg-background p-2 max-w-[240px]">
                  <img src={member.signaturePath} alt="Signature" className="object-contain w-full h-auto" />
                </div>
              </div>
            )}
            {member.fingerprintPath && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Fingerprint</p>
                <div className="w-20 h-20 rounded-lg overflow-hidden border border-border">
                  <img src={member.fingerprintPath} alt="Fingerprint" className="object-cover w-full h-full" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Member Documents */}
      <AttachmentUpload
        entityType="MEMBER"
        entityId={memberId}
        title="Member Documents"
      />

      {/* Accounts Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Savings Accounts */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">
              Savings Accounts {!savingsLoading && `(${savingsAccounts.length})`}
            </h2>
            <Link
              href={`/members/${memberId}/savings/open`}
              className="text-sm bg-success hover:bg-success/90 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              + Open Account
            </Link>
          </div>
          {savingsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-[3px] border-muted border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : savingsError ? (
            <ErrorDisplay error={savingsError} variant="card" onRetry={() => refetchSavings()} />
          ) : savingsAccounts.length > 0 ? (
            <div className="space-y-3">
              {savingsAccounts.map((account: any) => (
                <div
                  key={account.id}
                  className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-foreground">{account.accountNumber}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                        account.status
                      )}`}
                    >
                      {account.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {account.product?.productName || 'N/A'}
                  </p>
                  <p className="text-lg font-bold text-foreground mb-2">
                    {formatCurrency(account.balance)}
                  </p>
                  <div className="flex gap-2">
                    <Link
                      href={`/savings/accounts/${account.id}/deposit`}
                      className="flex-1 text-xs bg-primary hover:bg-primary/90 text-white px-2 py-1 rounded text-center"
                    >
                      Deposit
                    </Link>
                    <Link
                      href={`/savings/accounts/${account.id}/withdraw`}
                      className="flex-1 text-xs bg-amber-600 hover:bg-amber-700 text-white px-2 py-1 rounded text-center"
                    >
                      Withdraw
                    </Link>
                    <Link
                      href={`/savings/accounts/${account.id}`}
                      className="flex-1 text-xs bg-muted-foreground/80 hover:bg-muted-foreground text-white px-2 py-1 rounded text-center"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-sm text-muted-foreground">No savings accounts yet</p>
            </div>
          )}
        </div>

        {/* Loan Accounts */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">
              Loan Accounts {!loansLoading && `(${loanAccounts.length})`}
            </h2>
            <Link
              href={`/members/${memberId}/loans/apply`}
              className="text-sm bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              + Apply for Loan
            </Link>
          </div>
          {loansLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-[3px] border-muted border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : loansError ? (
            <ErrorDisplay error={loansError} variant="card" onRetry={() => refetchLoans()} />
          ) : loanAccounts.length > 0 ? (
            <div className="space-y-3">
              {loanAccounts.map((loan: any) => (
                <div
                  key={loan.id}
                  className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-foreground">{loan.loanNumber}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                        loan.status
                      )}`}
                    >
                      {loan.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {loan.product?.productName || 'N/A'}
                  </p>
                  <p className="text-sm text-foreground">
                    Principal: {formatCurrency(loan.principalAmount)}
                  </p>
                  <p className="text-sm text-foreground mb-2">
                    Outstanding: {formatCurrency(
                      Number(loan.outstandingPrincipal || 0) +
                      Number(loan.outstandingInterest || 0) +
                      Number(loan.outstandingFees || 0) +
                      Number(loan.outstandingPenalties || 0)
                    )}
                  </p>
                  {loan.daysInArrears > 0 && (
                    <p className="text-sm text-destructive mb-2">
                      {loan.daysInArrears} days in arrears
                    </p>
                  )}
                  <div className="flex gap-2">
                    {(loan.status === 'DISBURSED' || loan.status === 'ACTIVE') && (
                      <Link
                        href={`/loans/accounts/${loan.id}/repay`}
                        className="flex-1 text-xs bg-success hover:bg-success/90 text-white px-2 py-1 rounded text-center"
                      >
                        Repay
                      </Link>
                    )}
                    <Link
                      href={`/loans/accounts/${loan.id}`}
                      className="flex-1 text-xs bg-muted-foreground/80 hover:bg-muted-foreground text-white px-2 py-1 rounded text-center"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-sm text-muted-foreground">No loan accounts yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in flex items-center justify-center z-50">
          <div className="bg-card rounded-xl border border-border p-6 max-w-md w-full mx-4 animate-modal-in shadow-xl">
            <h3 className="text-xl font-bold text-foreground mb-4">Delete Member</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete {member.firstName} {member.lastName}? This
              action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleteLoading}
                className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="bg-muted/30 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>Created: {formatDate(member.createdAt)}</p>
          <p>Last Updated: {formatDate(member.updatedAt)}</p>
        </div>
      </div>
    </div>
  );
}
