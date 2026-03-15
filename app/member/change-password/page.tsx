"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { CHANGE_PASSWORD } from "@/lib/graphql/queries";
import { ArrowLeft, Lock, Eye, EyeOff, Check } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function MemberChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [changePassword, { loading }] = useMutation(CHANGE_PASSWORD);

  const passwordChecks = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    digit: /[0-9]/.test(newPassword),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword),
  };

  const allValid = Object.values(passwordChecks).every(Boolean) && newPassword === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!allValid) {
      toast.error("Password does not meet requirements");
      return;
    }
    try {
      await changePassword({ variables: { oldPassword, newPassword } });
      toast.success("Password changed successfully");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    }
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/member" className="p-2 hover:bg-secondary rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div className="p-3 bg-amber-500/10 rounded-lg">
          <Lock className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Change Password</h1>
          <p className="text-muted-foreground">Update your account password</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Current Password</label>
          <div className="relative">
            <input
              type={showOld ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-4 py-2.5 pr-10 border border-input rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              required
            />
            <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-3 text-muted-foreground">
              {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">New Password</label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 pr-10 border border-input rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              required
            />
            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-3 text-muted-foreground">
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2.5 border border-input rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            required
          />
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-destructive text-xs mt-1">Passwords do not match</p>
          )}
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm font-medium text-foreground mb-2">Password Requirements:</p>
          <ul className="space-y-1 text-sm">
            {[
              { check: passwordChecks.length, label: "At least 8 characters" },
              { check: passwordChecks.uppercase, label: "One uppercase letter" },
              { check: passwordChecks.lowercase, label: "One lowercase letter" },
              { check: passwordChecks.digit, label: "One digit" },
              { check: passwordChecks.special, label: "One special character" },
            ].map((item) => (
              <li key={item.label} className={`flex items-center gap-2 ${item.check ? "text-green-600" : "text-muted-foreground"}`}>
                <Check className={`w-3.5 h-3.5 ${item.check ? "" : "opacity-30"}`} />
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        <button
          type="submit"
          disabled={loading || !allValid}
          className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover disabled:opacity-50 font-semibold transition-all flex items-center justify-center gap-2"
        >
          <Lock className="w-4 h-4" />
          {loading ? "Changing Password..." : "Change Password"}
        </button>
      </form>
    </div>
  );
}
