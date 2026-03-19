"use client";

interface ScoreBreakdownChartProps {
  transactionBehaviorScore: number;
  savingsBehaviorScore: number;
  loanHistoryScore: number;
  financialStabilityScore: number;
  memberProfileScore: number;
}

const CATEGORIES = [
  { key: "transactionBehaviorScore", label: "Transaction Behavior", weight: 25 },
  { key: "loanHistoryScore", label: "Loan History", weight: 25 },
  { key: "savingsBehaviorScore", label: "Savings Behavior", weight: 20 },
  { key: "financialStabilityScore", label: "Financial Stability", weight: 15 },
  { key: "memberProfileScore", label: "Member Profile", weight: 15 },
] as const;

function getBarColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-emerald-400";
  if (score >= 40) return "bg-yellow-400";
  if (score >= 20) return "bg-orange-400";
  return "bg-red-500";
}

export default function ScoreBreakdownChart(props: ScoreBreakdownChartProps) {
  return (
    <div className="space-y-3">
      {CATEGORIES.map((cat) => {
        const score = props[cat.key];
        return (
          <div key={cat.key}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {cat.label}
                <span className="text-gray-400 ml-1 text-xs">({cat.weight}%)</span>
              </span>
              <span className="font-semibold">{score}/100</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${getBarColor(score)}`}
                style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
