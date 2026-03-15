"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
import {
  GET_CREDIT_SCORE,
  CALCULATE_CREDIT_SCORE,
  SEARCH_MEMBERS,
} from "@/lib/graphql/queries";
import { CreditScoreResult } from "@/lib/types";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import EmptyState from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "sonner";
import {
  Star,
  TrendingUp,
  Award,
  Search,
  Loader2,
  User,
  X,
  ChevronRight,
  Clock,
} from "lucide-react";

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function getRatingColor(rating: string) {
  switch (rating?.toUpperCase()) {
    case "EXCELLENT":
      return { border: "border-green-500", text: "text-green-600", bg: "bg-green-500/10" };
    case "GOOD":
      return { border: "border-blue-500", text: "text-blue-600", bg: "bg-blue-500/10" };
    case "FAIR":
      return { border: "border-amber-500", text: "text-amber-600", bg: "bg-amber-500/10" };
    case "POOR":
      return { border: "border-red-500", text: "text-red-600", bg: "bg-red-500/10" };
    default:
      return { border: "border-muted", text: "text-muted-foreground", bg: "bg-muted/10" };
  }
}

function getRatingIcon(rating: string) {
  switch (rating?.toUpperCase()) {
    case "EXCELLENT":
      return Award;
    case "GOOD":
      return Star;
    case "FAIR":
      return TrendingUp;
    default:
      return TrendingUp;
  }
}

export default function CreditScoringPage() {
  const [memberSearch, setMemberSearch] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(memberSearch, 300);

  const [searchMembers, { data: membersData, loading: membersLoading }] =
    useLazyQuery(SEARCH_MEMBERS);

  const [getCreditScore, { data: scoreData, loading: scoreLoading, error: scoreError }] =
    useLazyQuery(GET_CREDIT_SCORE);

  const [calculateScore, { loading: calcLoading }] = useMutation(CALCULATE_CREDIT_SCORE, {
    onCompleted: (data) => {
      toast.success("Credit score calculated successfully");
      // Refetch the score to update the display
      if (selectedMember) {
        getCreditScore({ variables: { memberId: selectedMember.id }, fetchPolicy: "network-only" });
      }
    },
    onError: (err) => toast.error(err.message),
  });

  // Search members when input changes
  useEffect(() => {
    if (debouncedSearch.length >= 2) {
      searchMembers({ variables: { searchTerm: debouncedSearch, page: 0, size: 10 } });
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [debouncedSearch, searchMembers]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectMember = (member: any) => {
    setSelectedMember(member);
    setMemberSearch("");
    setShowResults(false);
    getCreditScore({ variables: { memberId: member.id } });
  };

  const handleCalculate = () => {
    if (!selectedMember) {
      toast.error("Please select a member first.");
      return;
    }
    calculateScore({ variables: { memberId: selectedMember.id } });
  };

  const handleClearMember = () => {
    setSelectedMember(null);
    setMemberSearch("");
  };

  const creditScore: CreditScoreResult | null = scoreData?.creditScore || null;
  const members = membersData?.searchMembers?.content || [];
  const colors = creditScore ? getRatingColor(creditScore.rating) : null;
  const RatingIcon = creditScore ? getRatingIcon(creditScore.rating) : Star;

  // Parse factors - could be JSON string or plain text
  let factors: string[] = [];
  if (creditScore?.factors) {
    try {
      const parsed = JSON.parse(creditScore.factors);
      if (Array.isArray(parsed)) {
        factors = parsed;
      } else if (typeof parsed === "object") {
        factors = Object.entries(parsed).map(([k, v]) => `${k}: ${v}`);
      } else {
        factors = [String(parsed)];
      }
    } catch {
      factors = creditScore.factors.split(",").map((f: string) => f.trim()).filter(Boolean);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Award className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Credit Scoring</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Evaluate member creditworthiness based on their financial history
          </p>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Member Search */}
          <div className="flex-1 relative" ref={searchRef}>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Select Member
            </label>
            {selectedMember ? (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-muted/30">
                <User className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {selectedMember.firstName} {selectedMember.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{selectedMember.memberNumber}</p>
                </div>
                <button
                  onClick={handleClearMember}
                  className="p-1 rounded hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search by name or member number..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                {membersLoading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
                )}
              </div>
            )}

            {/* Search Results Dropdown */}
            {showResults && members.length > 0 && (
              <div className="absolute z-10 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
                {members.map((member: any) => (
                  <button
                    key={member.id}
                    onClick={() => handleSelectMember(member)}
                    className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex items-center gap-3 border-b border-border last:border-0"
                  >
                    <User className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{member.memberNumber}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {showResults && !membersLoading && members.length === 0 && debouncedSearch.length >= 2 && (
              <div className="absolute z-10 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-lg p-4 text-center text-sm text-muted-foreground">
                No members found matching &quot;{debouncedSearch}&quot;
              </div>
            )}
          </div>

          {/* Calculate Button */}
          <div className="flex items-end">
            <button
              onClick={handleCalculate}
              disabled={!selectedMember || calcLoading}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
            >
              {calcLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4" />
                  Calculate Score
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {scoreError && <ErrorDisplay error={scoreError} />}

      {/* Loading State */}
      {scoreLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-10 h-10 border-[3px] border-muted border-t-primary rounded-full animate-spin"></div>
        </div>
      )}

      {/* No member selected */}
      {!selectedMember && !scoreLoading && (
        <EmptyState
          icon={Search}
          title="Search for a member"
          description="Select a member to view or calculate their credit score."
          variant="search"
        />
      )}

      {/* Member selected but no score yet */}
      {selectedMember && !creditScore && !scoreLoading && !scoreError && (
        <EmptyState
          icon={Award}
          title="No credit score available"
          description="Click 'Calculate Score' to generate a credit score for this member."
        />
      )}

      {/* Credit Score Display */}
      {creditScore && !scoreLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score Gauge */}
          <div className="bg-card rounded-xl border border-border p-8 flex flex-col items-center justify-center">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">
              Credit Score
            </h3>

            {/* Circular Gauge */}
            <div
              className={`w-48 h-48 rounded-full border-8 ${colors?.border} ${colors?.bg} flex flex-col items-center justify-center transition-all duration-500`}
            >
              <span className={`text-5xl font-bold ${colors?.text}`}>
                {creditScore.score}
              </span>
              <span className="text-xs text-muted-foreground mt-1">/ 1000</span>
            </div>

            {/* Rating Badge */}
            <div className="mt-6 flex items-center gap-2">
              <RatingIcon className={`w-5 h-5 ${colors?.text}`} />
              <span className={`text-lg font-semibold ${colors?.text}`}>
                {creditScore.rating}
              </span>
            </div>

            {/* Member Info */}
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                {creditScore.member?.firstName} {creditScore.member?.lastName}
              </p>
              <p className="text-xs text-muted-foreground">
                {creditScore.member?.memberNumber}
              </p>
            </div>

            {/* Calculated At */}
            {creditScore.calculatedAt && (
              <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>
                  Calculated:{" "}
                  {new Date(creditScore.calculatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Factors Breakdown */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="text-base font-semibold text-foreground">Scoring Factors</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Factors that contributed to the credit score calculation.
              </p>
            </div>

            {factors.length > 0 ? (
              <div className="divide-y divide-border">
                {factors.map((factor, index) => (
                  <div
                    key={index}
                    className="px-6 py-4 flex items-start gap-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="mt-0.5 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary">{index + 1}</span>
                    </div>
                    <p className="text-sm text-foreground">{factor}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No detailed factor breakdown available.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
