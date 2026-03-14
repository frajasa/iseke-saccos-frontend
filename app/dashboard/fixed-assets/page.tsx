"use client";

import { useState } from "react";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
import {
  GET_FIXED_ASSETS, CREATE_FIXED_ASSET, RUN_DEPRECIATION,
  DISPOSE_FIXED_ASSET, GET_ASSET_DEPRECIATION_HISTORY,
} from "@/lib/graphql/queries";
import { FixedAsset, FixedAssetDepreciation } from "@/lib/types";
import { formatDate, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, Calculator, X, Trash2, History } from "lucide-react";

const CATEGORIES = ["LAND", "BUILDING", "VEHICLE", "FURNITURE", "EQUIPMENT", "COMPUTER", "SOFTWARE", "OTHER"];
const DEP_METHODS = ["STRAIGHT_LINE", "REDUCING_BALANCE"];

const emptyAsset = {
  assetName: "", description: "", category: "EQUIPMENT", acquisitionDate: "",
  acquisitionCost: "", usefulLifeMonths: "60", residualValue: "0",
  depreciationMethod: "STRAIGHT_LINE", depreciationRate: "", location: "",
  serialNumber: "", supplier: "", warrantyExpiry: "",
};

export default function FixedAssetsPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [showDepreciation, setShowDepreciation] = useState(false);
  const [depDate, setDepDate] = useState("");
  const [form, setForm] = useState(emptyAsset);
  const [selectedAsset, setSelectedAsset] = useState<FixedAsset | null>(null);
  const [showDispose, setShowDispose] = useState<FixedAsset | null>(null);
  const [disposeForm, setDisposeForm] = useState({ disposalAmount: "", reason: "" });

  const { data, loading, error, refetch } = useQuery(GET_FIXED_ASSETS);
  const [fetchHistory, { data: historyData, loading: historyLoading }] = useLazyQuery(GET_ASSET_DEPRECIATION_HISTORY);

  const [createAsset] = useMutation(CREATE_FIXED_ASSET, {
    onCompleted: () => { toast.success("Asset created"); refetch(); setShowAdd(false); setForm(emptyAsset); },
    onError: (err) => toast.error(err.message),
  });

  const [runDepreciation] = useMutation(RUN_DEPRECIATION, {
    onCompleted: (data) => { toast.success(`Depreciation run complete: ${data.runDepreciation} assets processed`); refetch(); setShowDepreciation(false); setDepDate(""); },
    onError: (err) => toast.error(err.message),
  });

  const [disposeAsset] = useMutation(DISPOSE_FIXED_ASSET, {
    onCompleted: () => { toast.success("Asset disposed"); refetch(); setShowDispose(null); setDisposeForm({ disposalAmount: "", reason: "" }); },
    onError: (err) => toast.error(err.message),
  });

  const assets: FixedAsset[] = data?.fixedAssets || [];

  const statusColor = (s: string) => {
    if (s === "ACTIVE") return "bg-green-100 text-green-700";
    if (s === "DISPOSED") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-600";
  };

  const viewHistory = (asset: FixedAsset) => {
    setSelectedAsset(asset);
    fetchHistory({ variables: { assetId: asset.id } });
  };

  if (loading) return <div className="p-8"><div className="animate-pulse text-muted-foreground">Loading assets...</div></div>;
  if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>;

  const depHistory: FixedAssetDepreciation[] = historyData?.assetDepreciationHistory || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fixed Assets Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Track and manage fixed assets and depreciation</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowDepreciation(true)} className="flex items-center gap-2 px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 text-sm font-medium">
            <Calculator className="w-4 h-4" /> Run Depreciation
          </button>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium">
            <Plus className="w-4 h-4" /> Add Asset
          </button>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">Assets ({assets.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-border bg-muted/50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Code</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Name</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Category</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Acq. Date</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Cost</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Accum. Dep</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Net Book Value</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
            </tr></thead>
            <tbody>
              {assets.map((a) => (
                <tr key={a.id} className="border-b border-border hover:bg-muted/30">
                  <td className="px-6 py-3 font-mono text-sm">{a.assetCode}</td>
                  <td className="px-6 py-3 font-medium">{a.assetName}</td>
                  <td className="px-6 py-3 text-sm">{a.category}</td>
                  <td className="px-6 py-3 text-sm">{formatDate(a.acquisitionDate)}</td>
                  <td className="px-6 py-3 text-sm text-right">{formatCurrency(a.acquisitionCost)}</td>
                  <td className="px-6 py-3 text-sm text-right">{formatCurrency(a.accumulatedDepreciation)}</td>
                  <td className="px-6 py-3 text-sm text-right font-semibold">{formatCurrency(a.netBookValue)}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor(a.status)}`}>{a.status}</span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => viewHistory(a)} className="text-xs px-2 py-1 rounded border border-border hover:bg-muted text-primary" title="Depreciation History">
                        <History className="w-3 h-3" />
                      </button>
                      {a.status === "ACTIVE" && (
                        <button onClick={() => setShowDispose(a)} className="text-xs px-2 py-1 rounded border border-border hover:bg-muted text-red-500" title="Dispose">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {assets.length === 0 && <tr><td colSpan={9} className="px-6 py-8 text-center text-muted-foreground">No fixed assets found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Depreciation History */}
      {selectedAsset && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center">
            <h2 className="text-lg font-semibold">Depreciation History: {selectedAsset.assetName}</h2>
            <button onClick={() => setSelectedAsset(null)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
          {historyLoading ? <div className="p-6 text-muted-foreground">Loading...</div> : (
            <table className="w-full">
              <thead><tr className="border-b border-border bg-muted/50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Period</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Depreciation</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Accum. After</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">NBV After</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Posted By</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
              </tr></thead>
              <tbody>
                {depHistory.map((d) => (
                  <tr key={d.id} className="border-b border-border">
                    <td className="px-6 py-3 text-sm">{formatDate(d.periodDate)}</td>
                    <td className="px-6 py-3 text-sm text-right">{formatCurrency(d.depreciationAmount)}</td>
                    <td className="px-6 py-3 text-sm text-right">{formatCurrency(d.accumulatedAfter)}</td>
                    <td className="px-6 py-3 text-sm text-right">{formatCurrency(d.netBookValueAfter)}</td>
                    <td className="px-6 py-3 text-sm">{d.postedBy || "-"}</td>
                    <td className="px-6 py-3 text-sm">{formatDate(d.createdAt)}</td>
                  </tr>
                ))}
                {depHistory.length === 0 && <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No depreciation history</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Add Asset Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowAdd(false)}>
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Add Fixed Asset</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><label className="block text-xs font-medium text-muted-foreground mb-1">Asset Name *</label>
                <input type="text" value={form.assetName} onChange={(e) => setForm({ ...form, assetName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /></div>
              <div className="col-span-2"><label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /></div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Category *</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select></div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Acquisition Date *</label>
                <input type="date" value={form.acquisitionDate} onChange={(e) => setForm({ ...form, acquisitionDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /></div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Acquisition Cost *</label>
                <input type="number" step="0.01" value={form.acquisitionCost} onChange={(e) => setForm({ ...form, acquisitionCost: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /></div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Useful Life (months) *</label>
                <input type="number" value={form.usefulLifeMonths} onChange={(e) => setForm({ ...form, usefulLifeMonths: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /></div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Residual Value</label>
                <input type="number" step="0.01" value={form.residualValue} onChange={(e) => setForm({ ...form, residualValue: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /></div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Depreciation Method *</label>
                <select value={form.depreciationMethod} onChange={(e) => setForm({ ...form, depreciationMethod: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
                  {DEP_METHODS.map(m => <option key={m} value={m}>{m.replace("_", " ")}</option>)}
                </select></div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Location</label>
                <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /></div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Serial Number</label>
                <input type="text" value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /></div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Supplier</label>
                <input type="text" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /></div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Warranty Expiry</label>
                <input type="date" value={form.warrantyExpiry} onChange={(e) => setForm({ ...form, warrantyExpiry: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /></div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-border rounded-lg text-sm">Cancel</button>
              <button onClick={() => createAsset({ variables: {
                ...form,
                acquisitionCost: form.acquisitionCost,
                usefulLifeMonths: parseInt(form.usefulLifeMonths),
                residualValue: form.residualValue || "0",
                depreciationRate: form.depreciationRate || undefined,
                warrantyExpiry: form.warrantyExpiry || undefined,
              } })} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Run Depreciation Modal */}
      {showDepreciation && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowDepreciation(false)}>
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Run Depreciation</h2>
            <div><label className="block text-xs font-medium text-muted-foreground mb-1">Period Date</label>
              <input type="date" value={depDate} onChange={(e) => setDepDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /></div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowDepreciation(false)} className="px-4 py-2 border border-border rounded-lg text-sm">Cancel</button>
              <button onClick={() => { if (!depDate) { toast.error("Select a date"); return; } runDepreciation({ variables: { periodDate: depDate } }); }}
                className="px-4 py-2 bg-success text-white rounded-lg text-sm font-medium">Run</button>
            </div>
          </div>
        </div>
      )}

      {/* Dispose Asset Modal */}
      {showDispose && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowDispose(null)}>
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Dispose Asset: {showDispose.assetName}</h2>
            <p className="text-sm text-muted-foreground mb-3">Current NBV: {formatCurrency(showDispose.netBookValue)}</p>
            <div className="space-y-3">
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Disposal Amount</label>
                <input type="number" step="0.01" value={disposeForm.disposalAmount} onChange={(e) => setDisposeForm({ ...disposeForm, disposalAmount: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /></div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Reason</label>
                <input type="text" value={disposeForm.reason} onChange={(e) => setDisposeForm({ ...disposeForm, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /></div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowDispose(null)} className="px-4 py-2 border border-border rounded-lg text-sm">Cancel</button>
              <button onClick={() => disposeAsset({ variables: { id: showDispose.id, disposalAmount: disposeForm.disposalAmount, reason: disposeForm.reason || undefined } })}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium">Dispose</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
