"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_ACTIVE_SCORING_CONFIG,
  UPDATE_SCORING_WEIGHTS,
} from "@/lib/graphql/queries";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import { toast } from "sonner";
import { Settings, Loader2, Save } from "lucide-react";

const WEIGHT_KEYS = [
  { key: "transactionBehavior", label: "Transaction Behavior", description: "Deposit patterns, withdrawal discipline, frequency" },
  { key: "loanHistory", label: "Loan History", description: "Repayment track record, defaults, arrears" },
  { key: "savingsBehavior", label: "Savings Behavior", description: "Savings ratio, activity, balance stability" },
  { key: "financialStability", label: "Financial Stability", description: "Debt-to-income, net worth, income verification" },
  { key: "memberProfile", label: "Member Profile", description: "Membership duration, employer, completeness" },
];

const DEFAULT_WEIGHTS: Record<string, number> = {
  transactionBehavior: 25,
  loanHistory: 25,
  savingsBehavior: 20,
  financialStability: 15,
  memberProfile: 15,
};

export default function ScoringConfigPage() {
  const [weights, setWeights] = useState<Record<string, number>>(DEFAULT_WEIGHTS);

  const { data, loading, error } = useQuery(GET_ACTIVE_SCORING_CONFIG);

  const [updateWeights, { loading: saving }] = useMutation(UPDATE_SCORING_WEIGHTS, {
    onCompleted: () => toast.success("Scoring weights updated"),
    onError: (err) => toast.error(err.message),
    refetchQueries: [{ query: GET_ACTIVE_SCORING_CONFIG }],
  });

  useEffect(() => {
    if (data?.activeScoringConfig?.weights) {
      const w = data.activeScoringConfig.weights;
      setWeights({
        transactionBehavior: w.transactionBehavior ?? DEFAULT_WEIGHTS.transactionBehavior,
        loanHistory: w.loanHistory ?? DEFAULT_WEIGHTS.loanHistory,
        savingsBehavior: w.savingsBehavior ?? DEFAULT_WEIGHTS.savingsBehavior,
        financialStability: w.financialStability ?? DEFAULT_WEIGHTS.financialStability,
        memberProfile: w.memberProfile ?? DEFAULT_WEIGHTS.memberProfile,
      });
    }
  }, [data]);

  const total = Object.values(weights).reduce((s, v) => s + v, 0);
  const isValid = total === 100;

  const handleChange = (key: string, value: number) => {
    setWeights((prev) => ({ ...prev, [key]: Math.max(0, Math.min(100, value)) }));
  };

  const handleSave = () => {
    if (!isValid) return toast.error("Weights must sum to 100%");
    updateWeights({
      variables: {
        configName: data?.activeScoringConfig?.configName || "DEFAULT_V2",
        weights,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-[3px] border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Scoring Configuration</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Adjust the weight of each scoring dimension (must total 100%)
          </p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 space-y-6">
        {WEIGHT_KEYS.map(({ key, label, description }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-sm font-medium text-foreground">{label}</span>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={weights[key]}
                  onChange={(e) => handleChange(key, parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 text-right border border-border rounded bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={weights[key]}
              onChange={(e) => handleChange(key, parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        ))}

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Total:</span>
            <span
              className={`text-lg font-bold ${
                isValid ? "text-green-600" : "text-red-600"
              }`}
            >
              {total}%
            </span>
            {!isValid && (
              <span className="text-xs text-red-500">Must equal 100%</span>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={!isValid || saving}
            className="px-5 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Weights
          </button>
        </div>
      </div>
    </div>
  );
}
