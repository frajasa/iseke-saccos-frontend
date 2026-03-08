"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_EMPLOYERS, CREATE_EMPLOYER } from "@/lib/graphql/queries";
import { Factory, Plus, X, Loader2 } from "lucide-react";
import ErrorDisplay from "@/components/ui/ErrorDisplay";

export default function EmployersPage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employerCode: "",
    employerName: "",
    contactPerson: "",
    phoneNumber: "",
    email: "",
    address: "",
    tinNumber: "",
    payrollCutoffDay: 25,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, loading, error, refetch } = useQuery(GET_EMPLOYERS);
  const [createEmployer, { loading: creating }] = useMutation(CREATE_EMPLOYER, {
    onCompleted: () => {
      setShowForm(false);
      setFormData({ employerCode: "", employerName: "", contactPerson: "", phoneNumber: "", email: "", address: "", tinNumber: "", payrollCutoffDay: 25 });
      refetch();
    },
  });

  const employers = data?.employers || [];

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.employerCode.trim()) errs.employerCode = "Required";
    if (!formData.employerName.trim()) errs.employerName = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    createEmployer({
      variables: {
        ...formData,
        payrollCutoffDay: Number(formData.payrollCutoffDay),
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-[3px] border-muted border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Employers</h1>
          <p className="text-muted-foreground mt-1">{employers.length} registered employers</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancel" : "Add Employer"}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-base font-semibold text-foreground mb-4">New Employer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Employer Code *</label>
              <input
                type="text"
                value={formData.employerCode}
                onChange={(e) => setFormData({ ...formData, employerCode: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="e.g. EMP001"
              />
              {errors.employerCode && <p className="text-xs text-destructive mt-1">{errors.employerCode}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Employer Name *</label>
              <input
                type="text"
                value={formData.employerName}
                onChange={(e) => setFormData({ ...formData, employerName: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Company name"
              />
              {errors.employerName && <p className="text-xs text-destructive mt-1">{errors.employerName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Contact Person</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">TIN Number</label>
              <input
                type="text"
                value={formData.tinNumber}
                onChange={(e) => setFormData({ ...formData, tinNumber: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Payroll Cutoff Day</label>
              <input
                type="number"
                min={1}
                max={31}
                value={formData.payrollCutoffDay}
                onChange={(e) => setFormData({ ...formData, payrollCutoffDay: parseInt(e.target.value) || 25 })}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {creating && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Employer
            </button>
          </div>
        </form>
      )}

      {/* Error */}
      {error && <ErrorDisplay error={error} onRetry={() => refetch()} />}

      {/* Employers Grid */}
      {employers.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Factory className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No employers registered yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employers.map((emp: any) => (
            <div key={emp.id} className="card-interactive">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Factory className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{emp.employerName}</h3>
                  <p className="text-xs text-muted-foreground">{emp.employerCode}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full border ${emp.isActive ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground border-border"}`}>
                  {emp.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                {emp.contactPerson && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contact</span>
                    <span className="font-medium">{emp.contactPerson}</span>
                  </div>
                )}
                {emp.phoneNumber && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="font-medium">{emp.phoneNumber}</span>
                  </div>
                )}
                {emp.email && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium truncate ml-2">{emp.email}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
