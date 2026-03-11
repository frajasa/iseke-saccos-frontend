"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_SESSION_RESTRICTIONS, UPDATE_SESSION_RESTRICTION } from "@/lib/graphql/queries";
import { SessionRestriction } from "@/lib/types";
import { toast } from "sonner";
import { Clock, Edit2 } from "lucide-react";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const DAY_LABELS: Record<string, string> = { MON: "Mon", TUE: "Tue", WED: "Wed", THU: "Thu", FRI: "Fri", SAT: "Sat", SUN: "Sun" };

export default function SessionRestrictionsPage() {
  const [editing, setEditing] = useState<SessionRestriction | null>(null);
  const [form, setForm] = useState({ maxConcurrentSessions: 1, allowedLoginStart: "", allowedLoginEnd: "", allowedDays: "MON,TUE,WED,THU,FRI", sessionTimeoutMinutes: 480 });

  const { data, loading, refetch } = useQuery(GET_SESSION_RESTRICTIONS);
  const [updateRestriction] = useMutation(UPDATE_SESSION_RESTRICTION, {
    onCompleted: () => { toast.success("Restriction updated"); refetch(); setEditing(null); },
    onError: (err) => toast.error(err.message),
  });

  const restrictions: SessionRestriction[] = data?.sessionRestrictions || [];

  const startEdit = (r: SessionRestriction) => {
    setEditing(r);
    setForm({
      maxConcurrentSessions: r.maxConcurrentSessions || 1,
      allowedLoginStart: r.allowedLoginStart || "",
      allowedLoginEnd: r.allowedLoginEnd || "",
      allowedDays: r.allowedDays || "",
      sessionTimeoutMinutes: r.sessionTimeoutMinutes || 480,
    });
  };

  const toggleDay = (day: string) => {
    const days = form.allowedDays ? form.allowedDays.split(",").filter(Boolean) : [];
    if (days.includes(day)) {
      setForm({ ...form, allowedDays: days.filter((d) => d !== day).join(",") });
    } else {
      setForm({ ...form, allowedDays: [...days, day].join(",") });
    }
  };

  const handleSave = () => {
    if (!editing) return;
    updateRestriction({
      variables: {
        id: editing.id,
        maxConcurrentSessions: form.maxConcurrentSessions,
        allowedLoginStart: form.allowedLoginStart || null,
        allowedLoginEnd: form.allowedLoginEnd || null,
        allowedDays: form.allowedDays || null,
        sessionTimeoutMinutes: form.sessionTimeoutMinutes,
      },
    });
  };

  if (loading) return <div className="p-8"><div className="animate-pulse text-muted-foreground">Loading session restrictions...</div></div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Session Restrictions</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure login hours, concurrent sessions, and timeout per role</p>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-border bg-muted/50">
            <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Role</th>
            <th className="text-center px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Max Sessions</th>
            <th className="text-center px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Login Hours</th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Allowed Days</th>
            <th className="text-center px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Timeout (min)</th>
            <th className="text-center px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
          </tr></thead>
          <tbody>
            {restrictions.map((r) => (
              <tr key={r.id} className="border-b border-border hover:bg-muted/30">
                <td className="px-6 py-3 font-semibold">{r.role.replace(/_/g, " ")}</td>
                <td className="px-6 py-3 text-center">{r.maxConcurrentSessions || "-"}</td>
                <td className="px-6 py-3 text-center">
                  {r.allowedLoginStart && r.allowedLoginEnd ? (
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-mono">
                      {r.allowedLoginStart} - {r.allowedLoginEnd}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">Unrestricted</span>
                  )}
                </td>
                <td className="px-6 py-3">
                  {r.allowedDays ? (
                    <div className="flex gap-1">
                      {DAYS.map((d) => (
                        <span key={d} className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          r.allowedDays?.includes(d) ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                        }`}>{DAY_LABELS[d]}</span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs">All days</span>
                  )}
                </td>
                <td className="px-6 py-3 text-center font-mono text-sm">{r.sessionTimeoutMinutes}</td>
                <td className="px-6 py-3 text-center">
                  <button onClick={() => startEdit(r)} className="text-xs px-2 py-1 rounded border border-border hover:bg-muted">
                    <Edit2 className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-2"><Clock className="w-4 h-4 text-primary" /><h3 className="font-semibold text-sm">Login Hours</h3></div>
          <p className="text-xs text-muted-foreground">Restrict when users can log in based on time of day. Useful for limiting after-hours access.</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-2"><Clock className="w-4 h-4 text-success" /><h3 className="font-semibold text-sm">Concurrent Sessions</h3></div>
          <p className="text-xs text-muted-foreground">Limit how many devices a user can be logged in from simultaneously. Oldest sessions are terminated automatically.</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-2"><Clock className="w-4 h-4 text-orange-500" /><h3 className="font-semibold text-sm">Session Timeout</h3></div>
          <p className="text-xs text-muted-foreground">Auto-expire inactive sessions after the configured timeout period to enhance security.</p>
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setEditing(null)}>
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Edit Restrictions - {editing.role.replace(/_/g, " ")}</h2>
            <div className="space-y-4">
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Max Concurrent Sessions</label>
                <input type="number" min={1} max={10} value={form.maxConcurrentSessions} onChange={(e) => setForm({ ...form, maxConcurrentSessions: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-muted-foreground mb-1">Login Start Time</label>
                  <input type="time" value={form.allowedLoginStart} onChange={(e) => setForm({ ...form, allowedLoginStart: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /></div>
                <div><label className="block text-xs font-medium text-muted-foreground mb-1">Login End Time</label>
                  <input type="time" value={form.allowedLoginEnd} onChange={(e) => setForm({ ...form, allowedLoginEnd: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /></div>
              </div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Allowed Days</label>
                <div className="flex gap-2 flex-wrap">
                  {DAYS.map((d) => (
                    <button key={d} onClick={() => toggleDay(d)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        form.allowedDays?.includes(d)
                          ? "bg-primary text-white border-primary"
                          : "bg-background text-muted-foreground border-border hover:bg-muted"
                      }`}>{DAY_LABELS[d]}</button>
                  ))}
                </div>
              </div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Session Timeout (minutes)</label>
                <input type="number" min={5} value={form.sessionTimeoutMinutes} onChange={(e) => setForm({ ...form, sessionTimeoutMinutes: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /></div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setEditing(null)} className="px-4 py-2 border border-border rounded-lg text-sm">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
