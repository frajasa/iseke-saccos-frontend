"use client";

import { useState, useEffect, useRef } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import {
  GET_ENHANCED_CREDIT_SCORE,
  CALCULATE_ENHANCED_CREDIT_SCORE,
  GET_SCORE_TREND_ANALYSIS,
  SEARCH_MEMBERS,
} from "@/lib/graphql/queries";
import { EnhancedCreditScore, ScoreTrendAnalysis } from "@/lib/types";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import EmptyState from "@/components/ui/EmptyState";
import CreditScoreGauge from "@/components/CreditScoreGauge";
import ScoreBreakdownChart from "@/components/ScoreBreakdownChart";
import ScoreTrendChart from "@/components/ScoreTrendChart";
import { toast } from "sonner";
import {
  Award,
  TrendingUp,
  Search,
  Loader2,
  User,
  X,
  ChevronRight,
  Clock,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function CreditScoringPage() {
  const [memberSearch, setMemberSearch] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(memberSearch, 300);

  const [searchMembers, { data: membersData, loading: membersLoading }] =
    useLazyQuery(SEARCH_MEMBERS);

  const [getScore, { data: scoreData, loading: scoreLoading, error: scoreError }] =
    useLazyQuery(GET_ENHANCED_CREDIT_SCORE);

  const [getTrend, { data: trendData }] = useLazyQuery(GET_SCORE_TREND_ANALYSIS);

  const [calculateScore, { loading: calcLoading }] = useMutation(CALCULATE_ENHANCED_CREDIT_SCORE, {
    onCompleted: () => {
      toast.success("Enhanced credit score calculated");
      if (selectedMember) {
        getScore({ variables: { memberId: selectedMember.id }, fetchPolicy: "network-only" });
        getTrend({ variables: { memberId: selectedMember.id }, fetchPolicy: "network-only" });
      }
    },
    onError: (err) => toast.error(err.message),
  });

  useEffect(() => {
    if (debouncedSearch.length >= 2) {
      searchMembers({ variables: { searchTerm: debouncedSearch, page: 0, size: 10 } });
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [debouncedSearch, searchMembers]);

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
    getScore({ variables: { memberId: member.id } });
    getTrend({ variables: { memberId: member.id } });
  };

  const handleCalculate = () => {
    if (!selectedMember) return toast.error("Please select a member first.");
    calculateScore({ variables: { memberId: selectedMember.id } });
  };

  const creditScore: EnhancedCreditScore | null = scoreData?.enhancedCreditScore || null;
  const trendAnalysis: ScoreTrendAnalysis | null = trendData?.scoreTrendAnalysis || null;
  const members = membersData?.searchMembers?.content || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Award className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Enhanced Credit Scoring
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            AI-powered multi-dimensional credit analysis with risk assessment
          </p>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex flex-col sm:flex-row gap-4">
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
                  onClick={() => setSelectedMember(null)}
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
                No members found
              </div>
            )}
          </div>
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

      {scoreError && <ErrorDisplay error={scoreError} />}

      {scoreLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-10 h-10 border-[3px] border-muted border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {!selectedMember && !scoreLoading && (
        <EmptyState
          icon={Search}
          title="Search for a member"
          description="Select a member to view or calculate their enhanced credit score."
          variant="search"
        />
      )}

      {selectedMember && !creditScore && !scoreLoading && !scoreError && (
        <EmptyState
          icon={Award}
          title="No credit score available"
          description="Click 'Calculate Score' to generate an enhanced credit score for this member."
        />
      )}

      {/* Enhanced Score Display */}
      {creditScore && !scoreLoading && (
        <div className="space-y-6">
          {/* Top row: Gauge + Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Score Gauge Card */}
            <div className="bg-card rounded-xl border border-border p-8 flex flex-col items-center justify-center">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                Credit Score
              </h3>
              <CreditScoreGauge
                score={creditScore.score}
                rating={creditScore.rating}
                riskLevel={creditScore.riskLevel}
                trend={creditScore.trend || undefined}
                trendDelta={creditScore.trendDelta || undefined}
                size="lg"
              />
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  {creditScore.member?.firstName} {creditScore.member?.lastName}
                </p>
                <p className="text-xs text-muted-foreground">{creditScore.member?.memberNumber}</p>
              </div>
              {creditScore.calculatedAt && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>
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

            {/* Score Breakdown */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-base font-semibold text-foreground mb-4">Score Breakdown</h3>
              <ScoreBreakdownChart
                transactionBehaviorScore={creditScore.transactionBehaviorScore}
                savingsBehaviorScore={creditScore.savingsBehaviorScore}
                loanHistoryScore={creditScore.loanHistoryScore}
                financialStabilityScore={creditScore.financialStabilityScore}
                memberProfileScore={creditScore.memberProfileScore}
              />
            </div>
          </div>

          {/* Recommendation + Risk Flags */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recommendation */}
            {creditScore.recommendation && (
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldAlert className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">Recommendation</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {creditScore.recommendation}
                </p>
              </div>
            )}

            {/* Risk Flags */}
            {creditScore.riskFlags && creditScore.riskFlags.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-semibold text-foreground">Risk Flags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {creditScore.riskFlags.map((flag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                    >
                      {flag.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Trend Chart */}
          {trendAnalysis && trendAnalysis.scores.length > 1 && (
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-foreground">Score Trend</h3>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>Avg: {trendAnalysis.averageScore}</span>
                  <span>High: {trendAnalysis.highestScore}</span>
                  <span>Low: {trendAnalysis.lowestScore}</span>
                </div>
              </div>
              <ScoreTrendChart scores={trendAnalysis.scores} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
