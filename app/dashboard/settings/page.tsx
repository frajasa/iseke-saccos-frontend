"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_SACCOS_SETTINGS, UPDATE_SACCOS_SETTING } from "@/lib/graphql/queries";
import { Settings, Save, Loader2 } from "lucide-react";
import ErrorDisplay from "@/components/ui/ErrorDisplay";

const SETTING_LABELS: Record<string, { label: string; description: string }> = {
  SHARE_PRICE: { label: "Share Price (TZS)", description: "Price per individual share" },
  LOAN_SHARE_MULTIPLIER: { label: "Loan Share Multiplier", description: "Max loan = shares x multiplier x share price" },
  DEFAULT_MIN_MONTHLY_CONTRIBUTION: { label: "Min Monthly Contribution (TZS)", description: "Default minimum savings deduction" },
  MAX_SALARY_DEDUCTION_RATIO: { label: "Max Salary Deduction Ratio", description: "Max portion of salary for deductions (0.6667 = 2/3)" },
  MINIMUM_SHARES_FOR_MEMBERSHIP: { label: "Min Shares for Membership", description: "Minimum shares required for loan eligibility" },
};

export default function SettingsPage() {
  const { data, loading, error, refetch } = useQuery(GET_SACCOS_SETTINGS);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [updateSetting, { loading: saving }] = useMutation(UPDATE_SACCOS_SETTING, {
    onCompleted: () => {
      setEditingKey(null);
      setSuccessMessage("Setting updated successfully");
      refetch();
      setTimeout(() => setSuccessMessage(""), 3000);
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-[3px] border-muted border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) return <ErrorDisplay error={error} variant="full-page" />;

  const settings = data?.saccosSettings || [];

  const handleEdit = (key: string, currentValue: string) => {
    setEditingKey(key);
    setEditValue(currentValue);
  };

  const handleSave = (key: string) => {
    updateSetting({
      variables: { key, value: editValue, description: SETTING_LABELS[key]?.description },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">SACCOS Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Configure business rules and parameters</p>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-700 text-sm">
          {successMessage}
        </div>
      )}

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Business Rules Configuration</h2>
          <p className="text-sm text-muted-foreground mt-1">These settings control loan eligibility, share pricing, and contribution rules.</p>
        </div>
        <div className="divide-y divide-border">
          {settings.map((setting: any) => {
            const meta = SETTING_LABELS[setting.settingKey] || { label: setting.settingKey, description: setting.description || "" };
            const isEditing = editingKey === setting.settingKey;

            return (
              <div key={setting.id} className="p-6 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-foreground">{meta.label}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{meta.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-40 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSave(setting.settingKey)}
                        disabled={saving}
                        className="inline-flex items-center gap-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        Save
                      </button>
                      <button
                        onClick={() => setEditingKey(null)}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-semibold text-foreground bg-muted/50 px-3 py-1.5 rounded-lg tabular-nums">
                        {setting.settingValue}
                      </span>
                      <button
                        onClick={() => handleEdit(setting.settingKey, setting.settingValue)}
                        className="text-sm text-primary hover:underline"
                      >
                        Edit
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
