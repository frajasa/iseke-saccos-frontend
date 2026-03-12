"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_AUDIT_LOGS } from "@/lib/graphql/queries";
import { ArrowLeft, Shield, Calendar, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";
import ExportDropdown from "@/components/ExportDropdown";
import { ExportOptions, handleExport } from "@/lib/export-utils";

const PAGE_SIZE = 20;

export default function AuditLogsPage() {
  const [entityType, setEntityType] = useState("");
  const [page, setPage] = useState(0);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);

  const { data, loading, error } = useQuery(GET_AUDIT_LOGS, {
    variables: {
      entityType: entityType || undefined,
      startDate: startDate ? `${startDate}T00:00:00` : undefined,
      endDate: endDate ? `${endDate}T23:59:59` : undefined,
      page,
      size: PAGE_SIZE,
    },
    fetchPolicy: "network-only",
  });

  const logs = data?.auditLogs?.content || [];
  const totalElements = data?.auditLogs?.totalElements || 0;
  const totalPages = data?.auditLogs?.totalPages || 0;

  const handleFilterChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setter(e.target.value);
    setPage(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/accounting" className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div className="p-3 bg-indigo-500/10 rounded-lg">
            <Shield className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Audit Trail</h1>
            <p className="text-muted-foreground">Track all system actions and changes</p>
          </div>
        </div>
        <ExportDropdown
          onExport={(format) => {
            const exportOptions: ExportOptions = {
              title: "Audit Trail",
              subtitle: `${startDate} to ${endDate}${entityType ? ` | Entity: ${entityType}` : ""}`,
              filename: "audit-logs",
              columns: [
                { header: "Timestamp", key: "timestamp", width: 22, format: "date" },
                { header: "User", key: "user", width: 20 },
                { header: "Action", key: "action", width: 18 },
                { header: "Entity Type", key: "entityType", width: 16 },
                { header: "Entity ID", key: "entityId", width: 20 },
                { header: "IP Address", key: "ipAddress", width: 16 },
              ],
              data: logs.map((log: any) => ({
                timestamp: log.timestamp,
                user: log.user?.fullName || log.user?.username || "System",
                action: log.action,
                entityType: log.entityType,
                entityId: log.entityId || "-",
                ipAddress: log.ipAddress || "-",
              })),
            };
            handleExport(format, exportOptions, "print-report");
          }}
          disabled={logs.length === 0}
        />
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Entity Type
            </label>
            <select
              value={entityType}
              onChange={handleFilterChange(setEntityType)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="User">User</option>
              <option value="Member">Member</option>
              <option value="Transaction">Transaction</option>
              <option value="LoanAccount">Loan Account</option>
              <option value="SavingsAccount">Savings Account</option>
              <option value="GeneralLedger">General Ledger</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={handleFilterChange(setStartDate)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={handleFilterChange(setEndDate)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {loading ? "Loading..." : `${totalElements} audit log entries found`}
      </div>

      {/* Audit Log Table */}
      <div id="print-report" className="bg-card border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">
            Loading audit logs...
          </div>
        ) : error ? (
          <div className="p-12 text-center text-destructive">
            Error loading audit logs: {error.message}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Shield className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>No audit logs found for the selected filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Timestamp</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Entity Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Entity ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {log.user?.fullName || log.user?.username || "System"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{log.entityType}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground font-mono text-xs">
                      {log.entityId ? log.entityId.substring(0, 8) + "..." : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground font-mono">
                      {log.ipAddress || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, totalElements)} of {totalElements} entries
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i;
              } else if (page < 3) {
                pageNum = i;
              } else if (page > totalPages - 4) {
                pageNum = totalPages - 5 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                    page === pageNum
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
