"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { SETUP_2FA, VERIFY_2FA, DISABLE_2FA } from "@/lib/graphql/queries";
import ErrorDisplay from "@/components/ui/ErrorDisplay";
import { toast } from "sonner";
import { Lock, Shield, ShieldCheck, Smartphone, Loader2, Copy, Check, AlertTriangle } from "lucide-react";

type Step = "idle" | "setup" | "verify" | "enabled";

export default function SecurityPage() {
  const [step, setStep] = useState<Step>("idle");
  const [secret, setSecret] = useState("");
  const [otpAuthUri, setOtpAuthUri] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);

  const [setup2FA, { loading: setupLoading, error: setupError }] = useMutation(SETUP_2FA, {
    onCompleted: (data) => {
      const result = data.setup2FA;
      setSecret(result.secret);
      setOtpAuthUri(result.otpAuthUri);
      setStep("setup");
      toast.success("2FA setup initiated. Scan the QR code or enter the secret key.");
    },
    onError: (err) => toast.error(err.message),
  });

  const [verify2FA, { loading: verifyLoading, error: verifyError }] = useMutation(VERIFY_2FA, {
    onCompleted: (data) => {
      if (data.verify2FA) {
        setStep("enabled");
        toast.success("Two-factor authentication has been enabled successfully!");
      } else {
        toast.error("Invalid verification code. Please try again.");
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const [disable2FA, { loading: disableLoading }] = useMutation(DISABLE_2FA, {
    onCompleted: () => {
      setStep("idle");
      setSecret("");
      setOtpAuthUri("");
      setVerificationCode("");
      setShowDisableConfirm(false);
      toast.success("Two-factor authentication has been disabled.");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSetup = () => {
    setup2FA();
  };

  const handleVerify = () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code.");
      return;
    }
    verify2FA({ variables: { code: verificationCode } });
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    toast.success("Secret key copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const error = setupError || verifyError;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Two-Factor Authentication</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Add an extra layer of security to your account
          </p>
        </div>
      </div>

      {error && <ErrorDisplay error={error} />}

      <div className="max-w-lg mx-auto">
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {/* Header with icon */}
          <div className="p-8 text-center border-b border-border bg-muted/30">
            {step === "enabled" ? (
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-4">
                <ShieldCheck className="w-8 h-8 text-green-600" />
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
            )}
            <h2 className="text-lg font-semibold text-foreground">
              {step === "enabled"
                ? "2FA is Enabled"
                : step === "idle"
                  ? "Protect Your Account"
                  : "Complete Setup"}
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              {step === "enabled"
                ? "Your account is protected with two-factor authentication."
                : "Two-factor authentication adds a second layer of security by requiring a time-based code from your authenticator app during login."}
            </p>
          </div>

          <div className="p-6">
            {/* Step: Idle - Show enable button */}
            {step === "idle" && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
                  <Smartphone className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Before you begin</p>
                    <p>
                      You will need an authenticator app such as Google Authenticator, Authy, or
                      Microsoft Authenticator installed on your mobile device.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSetup}
                  disabled={setupLoading}
                  className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {setupLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      Enable Two-Factor Authentication
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Step: Setup - Show secret and QR URI */}
            {step === "setup" && (
              <div className="space-y-5">
                {/* Step indicator */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    1
                  </span>
                  <span className="font-medium text-foreground">Scan or enter the secret key</span>
                </div>

                {/* OTP Auth URI */}
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    OTP Auth URI
                  </p>
                  <p className="text-sm text-foreground break-all font-mono bg-background p-3 rounded border border-border">
                    {otpAuthUri}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Copy and paste this URI into your authenticator app, or use the secret key below.
                  </p>
                </div>

                {/* Secret Key */}
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Secret Key
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm font-mono bg-background p-3 rounded border border-border text-foreground tracking-wider">
                      {secret}
                    </code>
                    <button
                      onClick={handleCopySecret}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                      title="Copy secret key"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Step 2: Verify */}
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      2
                    </span>
                    <span className="font-medium text-foreground">Enter verification code</span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    Enter the 6-digit code from your authenticator app to verify the setup.
                  </p>

                  <div className="flex gap-3">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) =>
                        setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground text-center text-lg font-mono tracking-[0.5em] placeholder:tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                    <button
                      onClick={handleVerify}
                      disabled={verifyLoading || verificationCode.length !== 6}
                      className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                    >
                      {verifyLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Verify"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step: Enabled - Show success and disable option */}
            {step === "enabled" && (
              <div className="space-y-5">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/5 border border-green-500/10">
                  <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-green-700">Two-factor authentication is active</p>
                    <p className="text-muted-foreground mt-1">
                      Your account requires a verification code from your authenticator app during
                      each login.
                    </p>
                  </div>
                </div>

                {!showDisableConfirm ? (
                  <button
                    onClick={() => setShowDisableConfirm(true)}
                    className="w-full px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm"
                  >
                    Disable Two-Factor Authentication
                  </button>
                ) : (
                  <div className="p-4 rounded-lg border border-red-200 bg-red-50/50 space-y-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-red-700">Are you sure?</p>
                        <p className="text-red-600/80 mt-1">
                          Disabling 2FA will make your account less secure. You will only need your
                          password to log in.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowDisableConfirm(false)}
                        className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => disable2FA()}
                        disabled={disableLoading}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {disableLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Yes, Disable 2FA"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
