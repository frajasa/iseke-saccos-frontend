"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_BATCH_IMPORTS, GET_BATCH_IMPORT_ITEMS, CREATE_BATCH_IMPORT, PROCESS_BATCH_IMPORT } from "@/lib/graphql/queries";
import { BatchImport, BatchImportItem } from "@/lib/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import { Upload, History, Play, FileSpreadsheet, AlertCircle, CheckCircle2, XCircle, Eye } from "lucide-react";

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.trim().split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] || ""; });
    return row;
  });
  return { headers, rows };
}

const statusColors: Record<string, string> = {
  UPLOADED: "bg-gray-100 text-gray-700",
  VALIDATED: "bg-blue-100 text-blue-700",
  VALIDATED_WITH_ERRORS: "bg-orange-100 text-orange-700",
  PROCESSING: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
  COMPLETED_WITH_ERRORS: "bg-orange-100 text-orange-700",
  FAILED: "bg-red-100 text-red-700",
  PENDING: "bg-gray-100 text-gray-700",
};

export default function BatchImportPage() {
  const [tab, setTab] = useState<"upload" | "history">("upload");
  const [importType, setImportType] = useState("DEPOSIT");
  const [csvText, setCsvText] = useState("");
  const [parsed, setParsed] = useState<{ headers: string[]; rows: Record<string, string>[] } | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);

  const { data: batchesData, loading: batchesLoading, refetch: refetchBatches } = useQuery(GET_BATCH_IMPORTS);
  const { data: itemsData, loading: itemsLoading } = useQuery(GET_BATCH_IMPORT_ITEMS, {
    variables: { batchId: selectedBatch },
    skip: !selectedBatch,
  });

  const [createBatch, { loading: creating }] = useMutation(CREATE_BATCH_IMPORT, {
    onCompleted: () => { toast.success("Batch created and validated"); refetchBatches(); setCsvText(""); setParsed(null); setTab("history"); },
    onError: (err) => toast.error(err.message),
  });

  const [processBatch, { loading: processing }] = useMutation(PROCESS_BATCH_IMPORT, {
    onCompleted: (data) => {
      const b = data.processBatchImport;
      toast.success(`Batch processed: ${b.successfulRecords} success, ${b.failedRecords} failed`);
      refetchBatches();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setCsvText(text);
      const result = parseCSV(text);
      setParsed(result);
    };
    reader.readAsText(file);
  };

  const handleParsePreview = () => {
    if (!csvText.trim()) { toast.error("Please enter or upload CSV data"); return; }
    const result = parseCSV(csvText);
    if (result.rows.length === 0) { toast.error("No data rows found"); return; }
    setParsed(result);
  };

  const handleSubmit = () => {
    if (!parsed || parsed.rows.length === 0) { toast.error("No data to import"); return; }
    createBatch({ variables: { fileName: "batch_import.csv", importType, rows: parsed.rows } });
  };

  const batches: BatchImport[] = batchesData?.batchImports || [];
  const items: BatchImportItem[] = itemsData?.batchImportItems || [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Batch Transaction Import</h1>
        <p className="text-sm text-muted-foreground mt-1">Import transactions in bulk via CSV file</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
        <button onClick={() => setTab("upload")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === "upload" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          <Upload className="w-4 h-4" /> Upload
        </button>
        <button onClick={() => setTab("history")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === "history" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          <History className="w-4 h-4" /> History
        </button>
      </div>

      {tab === "upload" && (
        <div className="space-y-4">
          {/* Import Type */}
          <div className="bg-card rounded-xl border border-border p-4">
            <label className="block text-sm font-medium mb-2">Import Type</label>
            <select value={importType} onChange={(e) => setImportType(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm w-48">
              <option value="DEPOSIT">Deposit</option>
              <option value="WITHDRAWAL">Withdrawal</option>
            </select>
          </div>

          {/* File Upload */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <FileSpreadsheet className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-2">Upload a CSV file or paste data below</p>
              <p className="text-xs text-muted-foreground mb-4">Format: accountNumber, memberNumber, amount, paymentMethod, referenceNumber, description</p>
              <input type="file" accept=".csv,.txt" onChange={handleFileUpload}
                className="block mx-auto text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-primary file:text-white hover:file:bg-primary/90 file:cursor-pointer" />
            </div>
          </div>

          {/* CSV Text Area */}
          <div className="bg-card rounded-xl border border-border p-4">
            <label className="block text-sm font-medium mb-2">CSV Data</label>
            <textarea value={csvText} onChange={(e) => setCsvText(e.target.value)} rows={8} placeholder={`accountNumber,memberNumber,amount,paymentMethod,referenceNumber,description\nSAV00000001,,500000,CASH,REF001,Monthly deposit\n,ISK0001,300000,BANK_TRANSFER,REF002,Salary savings`}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono" />
            <button onClick={handleParsePreview} className="mt-2 px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/70">Preview Data</button>
          </div>

          {/* Preview */}
          {parsed && parsed.rows.length > 0 && (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-6 py-3 border-b border-border flex justify-between items-center">
                <h3 className="font-semibold">Preview ({parsed.rows.length} rows)</h3>
                <button onClick={handleSubmit} disabled={creating}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                  {creating ? "Creating..." : "Submit Batch"}
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">#</th>
                    {parsed.headers.map((h) => (
                      <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {parsed.rows.slice(0, 20).map((row, i) => (
                      <tr key={i} className="border-b border-border">
                        <td className="px-4 py-2 text-xs text-muted-foreground">{i + 1}</td>
                        {parsed.headers.map((h) => (
                          <td key={h} className="px-4 py-2 text-sm">{row[h]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsed.rows.length > 20 && <div className="px-6 py-2 text-xs text-muted-foreground">Showing first 20 of {parsed.rows.length} rows</div>}
            </div>
          )}
        </div>
      )}

      {tab === "history" && (
        <div className="space-y-4">
          {batchesLoading ? (
            <div className="animate-pulse text-muted-foreground p-8">Loading batches...</div>
          ) : batches.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground">No batch imports yet</div>
          ) : (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <table className="w-full">
                <thead><tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Batch #</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">File</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Type</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Records</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">By</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                </tr></thead>
                <tbody>
                  {batches.map((b) => (
                    <tr key={b.id} className={`border-b border-border hover:bg-muted/30 ${selectedBatch === b.id ? "bg-primary/5" : ""}`}>
                      <td className="px-4 py-3 font-mono text-sm">{b.batchNumber}</td>
                      <td className="px-4 py-3 text-sm">{b.fileName}</td>
                      <td className="px-4 py-3 text-sm">{b.importType}</td>
                      <td className="px-4 py-3 text-right text-sm">
                        <span className="text-green-600">{b.successfulRecords}</span>
                        {b.failedRecords > 0 && <span className="text-red-600">/{b.failedRecords}</span>}
                        <span className="text-muted-foreground">/{b.totalRecords}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm">{b.totalAmount ? formatCurrency(b.totalAmount) : "-"}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[b.status] || ""}`}>{b.status}</span></td>
                      <td className="px-4 py-3 text-sm">{b.uploadedBy}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{b.uploadedAt ? formatDateTime(b.uploadedAt) : "-"}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => setSelectedBatch(selectedBatch === b.id ? null : b.id)}
                            className="text-xs px-2 py-1 rounded border border-border hover:bg-muted"><Eye className="w-3 h-3" /></button>
                          {(b.status === "VALIDATED" || b.status === "VALIDATED_WITH_ERRORS") && (
                            <button onClick={() => processBatch({ variables: { batchId: b.id } })} disabled={processing}
                              className="text-xs px-2 py-1 rounded bg-success text-white hover:bg-success/90 disabled:opacity-50">
                              <Play className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Batch Items Detail */}
          {selectedBatch && (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-6 py-3 border-b border-border">
                <h3 className="font-semibold">Batch Items</h3>
              </div>
              {itemsLoading ? (
                <div className="p-6 animate-pulse text-muted-foreground">Loading items...</div>
              ) : items.length === 0 ? (
                <div className="p-6 text-muted-foreground text-sm">No items</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">#</th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Account</th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Member</th>
                      <th className="text-right px-4 py-2 text-xs font-semibold text-muted-foreground">Amount</th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Type</th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Error</th>
                    </tr></thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id} className="border-b border-border">
                          <td className="px-4 py-2 text-xs text-muted-foreground">{item.rowNumber}</td>
                          <td className="px-4 py-2 text-sm font-mono">{item.accountNumber || "-"}</td>
                          <td className="px-4 py-2 text-sm">{item.memberNumber || "-"}</td>
                          <td className="px-4 py-2 text-right font-mono text-sm">{item.amount ? formatCurrency(item.amount) : "-"}</td>
                          <td className="px-4 py-2 text-sm">{item.transactionType}</td>
                          <td className="px-4 py-2">
                            <span className="flex items-center gap-1">
                              {item.status === "COMPLETED" && <CheckCircle2 className="w-3 h-3 text-green-600" />}
                              {item.status === "FAILED" && <XCircle className="w-3 h-3 text-red-600" />}
                              {item.status === "PENDING" && <AlertCircle className="w-3 h-3 text-gray-400" />}
                              <span className={`text-xs font-medium ${statusColors[item.status] || ""} px-1.5 py-0.5 rounded`}>{item.status}</span>
                            </span>
                          </td>
                          <td className="px-4 py-2 text-xs text-red-600 max-w-48 truncate">{item.errorMessage || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
