"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordChangeError, setPasswordChangeError] = useState("");
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [changingPassword, setChangingPassword] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);

  // Check if redirected due to expired session
  useEffect(() => {
    if (searchParams.get("expired") === "true") {
      setSessionExpired(true);
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      const user = session?.user as any;
      router.push(user?.role === "MEMBER" ? "/member" : "/dashboard");
    }
  }, [status, session, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes("force_password_change") || result.error.includes("Password change required")) {
          // Get a temporary token via direct fetch for password change
          try {
            const graphqlUrl = "/api/graphql";
            const loginRes = await fetch(graphqlUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                query: `mutation Login($username: String!, $password: String!) {
                  login(username: $username, password: $password) { token }
                }`,
                variables: { username, password },
              }),
            });
            const loginData = await loginRes.json();
            if (loginData.data?.login?.token) {
              setTempToken(loginData.data.login.token);
            }
          } catch {
            // Token fetch failed — password change will use credentials directly
          }
          setShowPasswordChange(true);
          setError("");
        } else {
          setError(result.error);
        }
      } else if (result?.ok) {
        router.push("/");
      }
    } catch (err) {
      setError((err as Error).message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Left Column - Ad Banner */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-hover">
        <div className="absolute inset-0">
          <Image
            src="/banner.png"
            alt="ISACCOS Banner"
            fill
            className="object-cover opacity-20"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-success/40"></div>

        {/* Banner Content */}
        <div className="relative z-10 flex flex-col justify-between p-8 xl:p-12 text-white h-full">
          {/* Top Logo */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/95 rounded-2xl flex items-center justify-center p-2 shadow-2xl">
              <Image src="/logo.png" alt="ISACCOS" width={64} height={64} className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">ISEKE SACCOS</h3>
              <p className="text-sm text-white/80">Financial Management System</p>
            </div>
          </div>

          {/* Center Content */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-3">
                Welcome Back
              </h1>
              <p className="text-lg xl:text-xl text-white/90 leading-relaxed max-w-lg">
                Empowering financial growth through innovation, trust, and excellence in cooperative banking.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2">
              <div className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                ✓ Secure Banking
              </div>
              <div className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                ✓ Member Management
              </div>
              <div className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                ✓ Loan Processing
              </div>
              <div className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                ✓ Real-time Reports
              </div>
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-2xl xl:text-3xl font-bold">10K+</div>
              <div className="text-xs text-white/70">Active Members</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl xl:text-3xl font-bold">TZS 5B+</div>
              <div className="text-xs text-white/70">Assets Managed</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl xl:text-3xl font-bold">99.9%</div>
              <div className="text-xs text-white/70">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-8 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile Logo - Only visible on small screens */}
          <div className="lg:hidden text-center mb-6">
            <div className="flex items-center justify-center mb-3">
              <div className="w-24 h-24 bg-white rounded-2xl shadow-xl border border-border p-3">
                <Image src="/logo.png" alt="ISACCOS" width={96} height={96} className="w-full h-full object-contain" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">ISEKE SACCOS</h1>
            <p className="text-sm text-muted-foreground mt-1">Management System</p>
          </div>

          {/* Login Card */}
          <div className="bg-card rounded-3xl shadow-2xl p-6 lg:p-8 border border-border/50">
            <div className="mb-6">
              <h2 className="text-2xl lg:text-2xl font-bold text-foreground tracking-tight mb-1">Sign In</h2>
              <p className="text-sm text-muted-foreground">Enter your credentials to access your account</p>
            </div>

            {sessionExpired && (
              <div className="mb-4 p-3 bg-amber-50 border-l-4 border-amber-500 text-amber-700 rounded-lg text-sm flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 011.414 0L10 7.586l.707-.293a1 1 0 011.414 1.414L11.414 10l.707.707a1 1 0 01-1.414 1.414L10 11.414l-.707.707a1 1 0 01-1.414-1.414L8.586 10l-.707-.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span>Your session has expired. Please sign in again.</span>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border-l-4 border-destructive text-destructive rounded-lg text-sm flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {showPasswordChange && (
              <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                <p className="text-sm font-semibold text-blue-800 mb-2">Password Change Required</p>
                <p className="text-xs text-blue-700 mb-3">
                  Your password must be changed before you can continue. Password must be at least 8 characters with uppercase, lowercase, digit, and special character.
                </p>
                <div className="space-y-3">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    className="w-full px-3 py-2 rounded-lg border-2 border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-3 py-2 rounded-lg border-2 border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  {passwordChangeError && (
                    <p className="text-xs text-destructive">{passwordChangeError}</p>
                  )}
                  <button
                    type="button"
                    disabled={changingPassword}
                    onClick={async () => {
                      setPasswordChangeError("");
                      if (newPassword !== confirmPassword) {
                        setPasswordChangeError("Passwords do not match");
                        return;
                      }
                      if (newPassword.length < 8) {
                        setPasswordChangeError("Password must be at least 8 characters");
                        return;
                      }
                      setChangingPassword(true);
                      try {
                        // Use direct fetch with temp token since user isn't authenticated via NextAuth yet
                        const graphqlUrl = "/api/graphql";
                        const res = await fetch(graphqlUrl, {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            ...(tempToken ? { Authorization: `Bearer ${tempToken}` } : {}),
                          },
                          body: JSON.stringify({
                            query: `mutation ChangePassword($oldPassword: String!, $newPassword: String!) {
                              changePassword(oldPassword: $oldPassword, newPassword: $newPassword)
                            }`,
                            variables: { oldPassword: password, newPassword },
                          }),
                        });
                        const data = await res.json();
                        if (data.errors) {
                          throw new Error(data.errors[0].message || "Failed to change password");
                        }
                        setShowPasswordChange(false);
                        setNewPassword("");
                        setConfirmPassword("");
                        setTempToken(null);
                        // Re-login with new password
                        const result = await signIn("credentials", {
                          username,
                          password: newPassword,
                          redirect: false,
                        });
                        if (result?.ok) {
                          router.push("/");
                        }
                      } catch (err: any) {
                        setPasswordChangeError(err.message || "Failed to change password");
                      } finally {
                        setChangingPassword(false);
                      }
                    }}
                    className="w-full bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 text-sm"
                  >
                    {changingPassword ? "Changing..." : "Change Password"}
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-foreground mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="Enter your username"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-foreground mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end text-sm">
                <span className="text-muted-foreground text-xs">
                  Forgot password? Contact your administrator
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary via-primary to-success hover:shadow-2xl text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Signing in...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>Sign In</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">
                Need help? Contact your system administrator
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} ISEKE SACCOS. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Version 1.0.0 | Powered by ISACCOS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
