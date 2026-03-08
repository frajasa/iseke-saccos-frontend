"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import {
  RUN_END_OF_DAY,
  RUN_INTEREST_ACCRUAL,
  RUN_LOAN_PROVISIONING,
} from "@/lib/graphql/queries";
import {
  Clock,
  Play,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calculator,
  ShieldAlert,
  Settings,
  X,
} from "lucide-react";

interface BatchJob {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  mutation: any;
  mutationKey: string;
}

export default function EndOfDayPage() {
  const [results, setResults] = useState<Record<string, { success: boolean; message: string }>>({});
  const [confirmJob, setConfirmJob] = useState<BatchJob | null>(null);

  const [runEndOfDay, { loading: eodLoading }] = useMutation(RUN_END_OF_DAY);
  const [runInterestAccrual, { loading: interestLoading }] = useMutation(RUN_INTEREST_ACCRUAL);
  const [runLoanProvisioning, { loading: provisionLoading }] = useMutation(RUN_LOAN_PROVISIONING);

  const jobs: BatchJob[] = [
    {
      id: "eod",
      name: "End-of-Day Processing",
      description:
        "Runs the full nightly batch: updates days in arrears, applies late fees, runs interest accrual, and loan provisioning.",
      icon: Settings,
      color: "bg-blue-500",
      mutation: runEndOfDay,
      mutationKey: "runEndOfDay",
    },
    {
      id: "interest",
      name: "Interest Accrual",
      description:
        "Calculates daily interest on savings accounts and loan accounts. For savings, accrues daily and posts monthly.",
      icon: Calculator,
      color: "bg-green-500",
      mutation: runInterestAccrual,
      mutationKey: "runInterestAccrual",
    },
    {
      id: "provision",
      name: "Loan Provisioning",
      description:
        "Classifies loans by days in arrears and calculates required provisions per Tanzania SACCOS standards.",
      icon: ShieldAlert,
      color: "bg-orange-500",
      mutation: runLoanProvisioning,
      mutationKey: "runLoanProvisioning",
    },
  ];

  const isAnyRunning = eodLoading || interestLoading || provisionLoading;

  const handleRun = async (job: BatchJob) => {
    try {
      setResults((prev) => ({ ...prev, [job.id]: undefined as any }));
      const result = await job.mutation();
      const success = result?.data?.[job.mutationKey];
      setResults((prev) => ({
        ...prev,
        [job.id]: {
          success: success === true,
          message: success ? "Completed successfully" : "Process returned false",
        },
      }));
    } catch (error: any) {
      setResults((prev) => ({
        ...prev,
        [job.id]: {
          success: false,
          message: error.message || "An error occurred",
        },
      }));
    }
  };

  const getLoadingState = (jobId: string) => {
    if (jobId === "eod") return eodLoading;
    if (jobId === "interest") return interestLoading;
    if (jobId === "provision") return provisionLoading;
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-500/10 rounded-lg">
          <Clock className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Batch Processing</h1>
          <p className="text-muted-foreground">
            Run end-of-day processing and batch operations manually
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-amber-600">
          <p className="font-semibold">Automatic Scheduling Active</p>
          <p className="mt-1">
            End-of-Day processing runs automatically every night at 11:00 PM. Use the buttons below
            only for manual runs when necessary (e.g., after system recovery).
          </p>
        </div>
      </div>

      {/* Batch Job Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {jobs.map((job) => {
          const isLoading = getLoadingState(job.id);
          const result = results[job.id];

          return (
            <div
              key={job.id}
              className="bg-card border border-border rounded-lg overflow-hidden"
            >
              {/* Card Header */}
              <div className={`${job.color} px-6 py-4`}>
                <div className="flex items-center gap-3 text-white">
                  <job.icon className="w-6 h-6" />
                  <h3 className="text-lg font-semibold">{job.name}</h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4">
                <p className="text-sm text-muted-foreground">{job.description}</p>

                {/* Result */}
                {result && (
                  <div
                    className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                      result.success
                        ? "bg-green-500/10 border border-green-500/20 text-green-600"
                        : "bg-red-500/10 border border-red-500/20 text-red-600"
                    }`}
                  >
                    {result.success ? (
                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    )}
                    <span>{result.message}</span>
                  </div>
                )}

                {/* Run Button */}
                <button
                  onClick={() => setConfirmJob(job)}
                  disabled={isAnyRunning}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Run Now
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      {confirmJob && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card rounded-xl border border-border shadow-xl max-w-md w-full p-6 animate-modal-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Confirm Batch Operation</h3>
              <button onClick={() => setConfirmJob(null)} className="p-1 hover:bg-muted rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to run <span className="font-semibold text-foreground">{confirmJob.name}</span>? This operation may take several minutes and affects financial data.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmJob(null)}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => { handleRun(confirmJob); setConfirmJob(null); }}
                className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors text-sm"
              >
                Run Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
