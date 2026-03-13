"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_INTEREST_RATE_GROUPS,
  CREATE_INTEREST_RATE_GROUP,
  UPDATE_INTEREST_RATE_GROUP_RATE,
  GET_INTEREST_RATE_CHANGE_LOGS,
} from "@/lib/graphql/queries";
import { formatDate } from "@/lib/utils";
import { isNullListError } from "@/lib/error-utils";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import { toast } from "sonner";
import { Plus, Pencil, History, RefreshCw } from "lucide-react";

interface InterestRateGroup {
  id: string;
  groupName: string;
  description?: string;
  baseRate: number;
  effectiveDate: string;
  isActive: boolean;
  createdAt?: string;
}

interface RateChangeLog {
  id: string;
  groupName: string;
  previousRate: number;
  newRate: number;
  effectiveDate: string;
  retroactiveFromDate?: string;
  changedBy: string;
  changedAt: string;
}

export default function InterestRateGroupsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [showUpdateRate, setShowUpdateRate] = useState<InterestRateGroup | null>(null);
  const [activeTab, setActiveTab] = useState<"groups" | "logs">("groups");

  const [newGroup, setNewGroup] = useState({
    groupName: "",
    description: "",
    baseRate: "",
    effectiveDate: "",
  });
  const [rateUpdate, setRateUpdate] = useState({
    newRate: "",
    effectiveDate: "",
    retroactiveFromDate: "",
  });

  const { data, loading, error, refetch } = useQuery(GET_INTEREST_RATE_GROUPS);
  const { data: logsData, loading: logsLoading, error: logsError, refetch: refetchLogs } = useQuery(GET_INTEREST_RATE_CHANGE_LOGS);

  const [createGroup] = useMutation(CREATE_INTEREST_RATE_GROUP, {
    onCompleted: () => {
      toast.success("Interest rate group created");
      refetch();
      setShowCreate(false);
      setNewGroup({ groupName: "", description: "", baseRate: "", effectiveDate: "" });
    },
    onError: (err) => toast.error(err.message),
  });

  const [updateRate] = useMutation(UPDATE_INTEREST_RATE_GROUP_RATE, {
    onCompleted: () => {
      toast.success("Interest rate updated");
      refetch();
      refetchLogs();
      setShowUpdateRate(null);
      setRateUpdate({ newRate: "", effectiveDate: "", retroactiveFromDate: "" });
    },
    onError: (err) => toast.error(err.message),
  });

  const groups: InterestRateGroup[] = data?.interestRateGroups || [];
  const logs: RateChangeLog[] = logsData?.interestRateChangeLogs || [];

  const hasGroupError = error && !isNullListError(error);
  const hasLogError = logsError && !isNullListError(logsError);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse text-muted-foreground">Loading interest rate groups...</div>
      </div>
    );
  }

  if (hasGroupError) {
    return (
      <div className="p-6">
        <ErrorDisplay error={error} onRetry={() => refetch()} />
      </div>
    );
  }

  const handleCreate = () => {
    if (!newGroup.groupName || !newGroup.baseRate || !newGroup.effectiveDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    createGroup({
      variables: {
        input: {
          groupName: newGroup.groupName,
          description: newGroup.description || undefined,
          baseRate: parseFloat(newGroup.baseRate),
          effectiveDate: newGroup.effectiveDate,
        },
      },
    });
  };

  const handleUpdateRate = () => {
    if (!showUpdateRate || !rateUpdate.newRate || !rateUpdate.effectiveDate) {
      toast.error("Please fill in rate and effective date");
      return;
    }
    updateRate({
      variables: {
        groupId: showUpdateRate.id,
        input: {
          newRate: parseFloat(rateUpdate.newRate),
          effectiveDate: rateUpdate.effectiveDate,
          retroactiveFromDate: rateUpdate.retroactiveFromDate || undefined,
        },
      },
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Interest Rate Groups</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage interest rate groups and track rate changes
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Create Group
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("groups")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "groups"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Rate Groups
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === "logs"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <History className="w-3.5 h-3.5" /> Change Logs
        </button>
      </div>

      {/* Groups Table */}
      {activeTab === "groups" && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold">Interest Rate Groups</h2>
            <button onClick={() => refetch()} className="text-muted-foreground hover:text-foreground">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    Group Name
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    Base Rate
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    Effective Date
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {groups.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground text-sm">
                      No interest rate groups found. Create one to get started.
                    </td>
                  </tr>
                ) : (
                  groups.map((group) => (
                    <tr key={group.id} className="border-b border-border hover:bg-muted/30">
                      <td className="px-6 py-3">
                        <div>
                          <span className="font-semibold">{group.groupName}</span>
                          {group.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{group.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3 font-mono font-semibold">
                        {Number(group.baseRate).toFixed(2)}%
                      </td>
                      <td className="px-6 py-3 text-sm">{formatDate(group.effectiveDate)}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            group.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {group.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <button
                          onClick={() => {
                            setShowUpdateRate(group);
                            setRateUpdate({
                              newRate: "",
                              effectiveDate: "",
                              retroactiveFromDate: "",
                            });
                          }}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-border hover:bg-muted text-primary font-medium"
                        >
                          <Pencil className="w-3 h-3" /> Update Rate
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Change Logs */}
      {activeTab === "logs" && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold">Rate Change History</h2>
            <button onClick={() => refetchLogs()} className="text-muted-foreground hover:text-foreground">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          {logsLoading ? (
            <div className="px-6 py-8 text-center text-muted-foreground text-sm animate-pulse">
              Loading change logs...
            </div>
          ) : hasLogError ? (
            <div className="p-4">
              <ErrorDisplay error={logsError} variant="card" onRetry={() => refetchLogs()} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                      Group
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                      Previous Rate
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                      New Rate
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                      Effective Date
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                      Retroactive From
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                      Changed By
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">
                      Changed At
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground text-sm">
                        No rate changes recorded yet.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="border-b border-border hover:bg-muted/30">
                        <td className="px-6 py-3 font-medium">{log.groupName}</td>
                        <td className="px-6 py-3 font-mono text-muted-foreground">
                          {Number(log.previousRate).toFixed(2)}%
                        </td>
                        <td className="px-6 py-3 font-mono font-semibold">
                          {Number(log.newRate).toFixed(2)}%
                        </td>
                        <td className="px-6 py-3 text-sm">{formatDate(log.effectiveDate)}</td>
                        <td className="px-6 py-3 text-sm">
                          {log.retroactiveFromDate ? formatDate(log.retroactiveFromDate) : "-"}
                        </td>
                        <td className="px-6 py-3 text-sm">{log.changedBy}</td>
                        <td className="px-6 py-3 text-sm">{formatDate(log.changedAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create Group Modal */}
      {showCreate && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="bg-card rounded-xl border border-border p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">Create Interest Rate Group</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Group Name *
                </label>
                <input
                  type="text"
                  value={newGroup.groupName}
                  onChange={(e) => setNewGroup({ ...newGroup, groupName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                  placeholder="e.g. Standard Loans"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Description
                </label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none"
                  rows={3}
                  placeholder="Optional description for this rate group"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Base Rate (%) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={newGroup.baseRate}
                  onChange={(e) => setNewGroup({ ...newGroup, baseRate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                  placeholder="e.g. 18.00"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Effective Date *
                </label>
                <input
                  type="date"
                  value={newGroup.effectiveDate}
                  onChange={(e) => setNewGroup({ ...newGroup, effectiveDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 border border-border rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Rate Modal */}
      {showUpdateRate && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={() => setShowUpdateRate(null)}
        >
          <div
            className="bg-card rounded-xl border border-border p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-1">Update Rate</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {showUpdateRate.groupName} — current rate:{" "}
              <span className="font-mono font-semibold">
                {Number(showUpdateRate.baseRate).toFixed(2)}%
              </span>
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  New Rate (%) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={rateUpdate.newRate}
                  onChange={(e) => setRateUpdate({ ...rateUpdate, newRate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                  placeholder="e.g. 20.00"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Effective Date *
                </label>
                <input
                  type="date"
                  value={rateUpdate.effectiveDate}
                  onChange={(e) => setRateUpdate({ ...rateUpdate, effectiveDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Retroactive From Date (optional)
                </label>
                <input
                  type="date"
                  value={rateUpdate.retroactiveFromDate}
                  onChange={(e) =>
                    setRateUpdate({ ...rateUpdate, retroactiveFromDate: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  If set, the new rate will be applied retroactively from this date.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowUpdateRate(null)}
                className="px-4 py-2 border border-border rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRate}
                className="px-4 py-2 bg-success text-white rounded-lg text-sm font-medium hover:bg-success/90"
              >
                Update Rate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
