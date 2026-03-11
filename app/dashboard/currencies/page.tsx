"use client";

import { useState } from "react";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
import {
  GET_CURRENCIES,
  CREATE_CURRENCY,
  UPDATE_CURRENCY,
  SET_EXCHANGE_RATE,
  GET_EXCHANGE_RATES,
  CONVERT_CURRENCY,
} from "@/lib/graphql/queries";
import { Currency, ExchangeRate } from "@/lib/types";
import { formatDate, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, RefreshCw, ArrowRightLeft, X } from "lucide-react";

export default function CurrenciesPage() {
  const [showAddCurrency, setShowAddCurrency] = useState(false);
  const [showAddRate, setShowAddRate] = useState(false);
  const [newCurrency, setNewCurrency] = useState({ currencyCode: "", currencyName: "", symbol: "", decimalPlaces: 2 });
  const [newRate, setNewRate] = useState({ fromCurrency: "", toCurrency: "", rate: "", effectiveDate: "", source: "" });
  const [convertFrom, setConvertFrom] = useState("USD");
  const [convertTo, setConvertTo] = useState("TZS");
  const [convertAmount, setConvertAmount] = useState("");
  const [convertResult, setConvertResult] = useState<string | null>(null);
  const [selectedPair, setSelectedPair] = useState<{ from: string; to: string } | null>(null);

  const { data, loading, refetch } = useQuery(GET_CURRENCIES);
  const [fetchRates, { data: ratesData }] = useLazyQuery(GET_EXCHANGE_RATES);
  const [fetchConvert] = useLazyQuery(CONVERT_CURRENCY, {
    onCompleted: (data) => setConvertResult(data.convertCurrency),
    onError: (err) => toast.error(err.message),
  });

  const [createCurrency] = useMutation(CREATE_CURRENCY, {
    onCompleted: () => { toast.success("Currency created"); refetch(); setShowAddCurrency(false); setNewCurrency({ currencyCode: "", currencyName: "", symbol: "", decimalPlaces: 2 }); },
    onError: (err) => toast.error(err.message),
  });

  const [updateCurrency] = useMutation(UPDATE_CURRENCY, {
    onCompleted: () => { toast.success("Currency updated"); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const [setExchangeRate] = useMutation(SET_EXCHANGE_RATE, {
    onCompleted: () => { toast.success("Exchange rate set"); setShowAddRate(false); setNewRate({ fromCurrency: "", toCurrency: "", rate: "", effectiveDate: "", source: "" }); if (selectedPair) fetchRates({ variables: selectedPair }); },
    onError: (err) => toast.error(err.message),
  });

  const currencies: Currency[] = data?.currencies || [];

  const handleConvert = () => {
    if (!convertAmount || !convertFrom || !convertTo) return;
    fetchConvert({ variables: { amount: convertAmount, fromCurrency: convertFrom, toCurrency: convertTo } });
  };

  const viewRates = (from: string, to: string) => {
    setSelectedPair({ from, to });
    fetchRates({ variables: { fromCurrency: from, toCurrency: to } });
  };

  if (loading) return <div className="p-8"><div className="animate-pulse text-muted-foreground">Loading currencies...</div></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Currency Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage currencies and exchange rates</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAddRate(true)} className="flex items-center gap-2 px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 text-sm font-medium">
            <ArrowRightLeft className="w-4 h-4" /> Set Rate
          </button>
          <button onClick={() => setShowAddCurrency(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium">
            <Plus className="w-4 h-4" /> Add Currency
          </button>
        </div>
      </div>

      {/* Currencies Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">Currencies</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-border bg-muted/50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Code</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Name</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Symbol</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Decimals</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Base</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
            </tr></thead>
            <tbody>
              {currencies.map((c) => (
                <tr key={c.id} className="border-b border-border hover:bg-muted/30">
                  <td className="px-6 py-3 font-mono font-semibold">{c.currencyCode}</td>
                  <td className="px-6 py-3">{c.currencyName}</td>
                  <td className="px-6 py-3">{c.symbol}</td>
                  <td className="px-6 py-3">{c.decimalPlaces}</td>
                  <td className="px-6 py-3">{c.isBaseCurrency ? <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">Base</span> : "-"}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${c.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => updateCurrency({ variables: { id: c.id, isActive: !c.isActive } })}
                        className="text-xs px-2 py-1 rounded border border-border hover:bg-muted"
                        disabled={c.isBaseCurrency}>
                        {c.isActive ? "Deactivate" : "Activate"}
                      </button>
                      {!c.isBaseCurrency && (
                        <button onClick={() => viewRates(c.currencyCode, "TZS")}
                          className="text-xs px-2 py-1 rounded border border-border hover:bg-muted text-primary">
                          Rates
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Currency Converter */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold mb-4">Currency Converter</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Amount</label>
            <input type="number" value={convertAmount} onChange={(e) => setConvertAmount(e.target.value)} placeholder="0.00"
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm w-40" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">From</label>
            <select value={convertFrom} onChange={(e) => setConvertFrom(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm">
              {currencies.filter(c => c.isActive).map(c => <option key={c.id} value={c.currencyCode}>{c.currencyCode}</option>)}
            </select>
          </div>
          <ArrowRightLeft className="w-5 h-5 text-muted-foreground mb-2" />
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">To</label>
            <select value={convertTo} onChange={(e) => setConvertTo(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm">
              {currencies.filter(c => c.isActive).map(c => <option key={c.id} value={c.currencyCode}>{c.currencyCode}</option>)}
            </select>
          </div>
          <button onClick={handleConvert} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90">Convert</button>
          {convertResult && (
            <div className="px-4 py-2 bg-success/10 text-success rounded-lg font-semibold text-lg">
              = {Number(convertResult).toLocaleString("en-TZ", { minimumFractionDigits: 2 })} {convertTo}
            </div>
          )}
        </div>
      </div>

      {/* Exchange Rates for selected pair */}
      {selectedPair && ratesData?.exchangeRates && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center">
            <h2 className="text-lg font-semibold">Exchange Rates: {selectedPair.from} → {selectedPair.to}</h2>
            <button onClick={() => setSelectedPair(null)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
          <table className="w-full">
            <thead><tr className="border-b border-border bg-muted/50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Rate</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Effective Date</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Expiry Date</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Source</th>
            </tr></thead>
            <tbody>
              {(ratesData.exchangeRates as ExchangeRate[]).map((r) => (
                <tr key={r.id} className="border-b border-border">
                  <td className="px-6 py-3 font-semibold">{Number(r.rate).toFixed(6)}</td>
                  <td className="px-6 py-3">{formatDate(r.effectiveDate)}</td>
                  <td className="px-6 py-3">{r.expiryDate ? formatDate(r.expiryDate) : "-"}</td>
                  <td className="px-6 py-3">{r.source || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Currency Modal */}
      {showAddCurrency && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowAddCurrency(false)}>
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Add Currency</h2>
            <div className="space-y-3">
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Currency Code (3 letters)</label>
                <input type="text" maxLength={3} value={newCurrency.currencyCode} onChange={(e) => setNewCurrency({ ...newCurrency, currencyCode: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" placeholder="e.g. ZAR" /></div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Currency Name</label>
                <input type="text" value={newCurrency.currencyName} onChange={(e) => setNewCurrency({ ...newCurrency, currencyName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" placeholder="e.g. South African Rand" /></div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Symbol</label>
                <input type="text" value={newCurrency.symbol} onChange={(e) => setNewCurrency({ ...newCurrency, symbol: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" placeholder="e.g. R" /></div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Decimal Places</label>
                <input type="number" min={0} max={6} value={newCurrency.decimalPlaces} onChange={(e) => setNewCurrency({ ...newCurrency, decimalPlaces: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /></div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowAddCurrency(false)} className="px-4 py-2 border border-border rounded-lg text-sm">Cancel</button>
              <button onClick={() => createCurrency({ variables: newCurrency })} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Set Exchange Rate Modal */}
      {showAddRate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowAddRate(false)}>
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Set Exchange Rate</h2>
            <div className="space-y-3">
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">From Currency</label>
                <select value={newRate.fromCurrency} onChange={(e) => setNewRate({ ...newRate, fromCurrency: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
                  <option value="">Select...</option>
                  {currencies.filter(c => c.isActive).map(c => <option key={c.id} value={c.currencyCode}>{c.currencyCode} - {c.currencyName}</option>)}
                </select></div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">To Currency</label>
                <select value={newRate.toCurrency} onChange={(e) => setNewRate({ ...newRate, toCurrency: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
                  <option value="">Select...</option>
                  {currencies.filter(c => c.isActive).map(c => <option key={c.id} value={c.currencyCode}>{c.currencyCode} - {c.currencyName}</option>)}
                </select></div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Rate</label>
                <input type="number" step="0.000001" value={newRate.rate} onChange={(e) => setNewRate({ ...newRate, rate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" placeholder="e.g. 2650.50" /></div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Effective Date</label>
                <input type="date" value={newRate.effectiveDate} onChange={(e) => setNewRate({ ...newRate, effectiveDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /></div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Source (optional)</label>
                <input type="text" value={newRate.source} onChange={(e) => setNewRate({ ...newRate, source: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" placeholder="e.g. BOT, Reuters" /></div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowAddRate(false)} className="px-4 py-2 border border-border rounded-lg text-sm">Cancel</button>
              <button onClick={() => setExchangeRate({ variables: { ...newRate, effectiveDate: newRate.effectiveDate || undefined } })}
                className="px-4 py-2 bg-success text-white rounded-lg text-sm font-medium">Set Rate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
