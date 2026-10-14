"use client";

import { Suspense, useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/dashboard";
  const referralCode = searchParams.get("ref")?.trim().toUpperCase() || "";
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const initialStep =
    initialMode === "signup" && searchParams.get("step") === "username"
      ? "username"
      : "details";

  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [step, setStep] = useState<"details" | "verify" | "username">(
    initialStep
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const redirectByRole = useCallback(async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    const safeNext = nextPath.startsWith("/admin") ? "/dashboard" : nextPath;
    if (!userId) {
      router.replace(safeNext);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role,username")
      .eq("id", userId)
      .maybeSingle();

    if (profile?.role !== "admin" && !profile?.username) {
      router.replace(
        `/login?mode=signup&step=username&next=${encodeURIComponent(safeNext)}`
      );
      return;
    }

    router.replace(profile?.role === "admin" ? "/admin" : safeNext);
  }, [nextPath, router]);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (mode === "signup" && step === "username") {
        if (data.session?.user.email && !email) {
          setEmail(data.session.user.email);
        }
        return;
      }
      if (data.session) {
        await redirectByRole();
      }
    };
    checkSession();
  }, [email, mode, redirectByRole, step]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setTimeout(() => {
      setResendCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  const createAccount = async () => {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const resendVerificationCode = async () => {
    return supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleResendCode = async () => {
    if (!email || resendCooldown > 0) return;
    setResending(true);
    setMessage(null);

    const { error } = await resendVerificationCode();

    if (error) {
      setMessage(error.message);
      setResending(false);
      return;
    }

    setCode("");
    setResendCooldown(60);
    setMessage("A new verification code has been sent.");
    setResending(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }
      await redirectByRole();
      return;
    }

    if (step === "details") {
      const { data, error } = await createAccount();

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        setStep("username");
        setMessage(null);
        setLoading(false);
        return;
      }

      setStep("verify");
      setCode("");
      setResendCooldown(60);
      setMessage("Enter the verification code sent to your email.");
      setLoading(false);
      return;
    }

    if (step === "verify") {
      const verificationCode = code.replace(/\D/g, "");
      if (verificationCode.length < 6) {
        setMessage("Enter the full verification code from your email.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: verificationCode,
        type: "signup",
      });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      const capturedReferralCode = referralCode || window.localStorage.getItem("flowbridge-referral-code") || "";
      if (data.user && capturedReferralCode) {
        const { data: verifiedSession } = await supabase.auth.getSession();
        const { error: referralError } = await fetch("/api/referrals/attribute", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${verifiedSession.session?.access_token || ""}` },
          body: JSON.stringify({ referralCode: capturedReferralCode }),
        }).then(async (response) => ({ error: response.ok ? null : (await response.json()).error || "Unable to apply referral code." }));
        if (referralError) {
          window.localStorage.removeItem("flowbridge-referral-code");
          setMessage(`Your account was created, but the referral could not be recorded: ${referralError}`);
        } else {
          window.localStorage.removeItem("flowbridge-referral-code");
        }
      }

      setStep("username");
      setMessage(null);
      setLoading(false);
      return;
    }

    if (step === "username") {
      const normalized = username
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "");
      if (normalized.length < 3) {
        setMessage("Username must be at least 3 characters.");
        setLoading(false);
        return;
      }

      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", normalized);

      if (existing && existing.length > 0) {
        setMessage("Username already taken. Try another.");
        setLoading(false);
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;

      if (!userId) {
        setMessage("Session expired. Please sign in again.");
        setLoading(false);
        return;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ username: normalized })
        .eq("id", userId);

      if (profileError) {
        setMessage(
          profileError.code === "23505"
            ? "Username already taken. Try another."
            : profileError.message
        );
        setLoading(false);
        return;
      }

      await redirectByRole();
      return;
    }
  };

  const handleGoogleSignIn = async () => {
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${siteUrl.replace(/\/$/, "")}/auth/callback`,
      },
    });
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-4xl bg-white text-slate-900 rounded-3xl overflow-hidden shadow-xl">
        <div className="grid md:grid-cols-[1.1fr_1fr]">
          <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white p-10">
            <div>
              <p className="uppercase tracking-[0.3em] text-xs text-slate-300">
                Flowbridge Digital
              </p>
              <h2 className="text-3xl font-semibold mt-6">Systems start here</h2>
              <p className="text-slate-200 mt-4">
                Access structured automation, CRM, and growth infrastructure built
                for serious operators.
              </p>
            </div>
            <ul className="mt-10 space-y-3 text-sm text-slate-200">
              <li>✓ Clear project tracking and updates</li>
              <li>✓ Order history and progress visibility</li>
              <li>✓ Priority support channels</li>
            </ul>
          </div>

          <div className="p-8 md:p-10">
            <div className="flex gap-4 text-sm font-medium">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setStep("details");
                }}
                className={`px-4 py-2 rounded-full ${
                  mode === "login"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setStep("details");
                }}
                className={`px-4 py-2 rounded-full ${
                  mode === "signup"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                Create Account
              </button>
            </div>

            <h1 className="text-2xl font-semibold mt-6">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm text-slate-600 mt-2">
              {mode === "login"
                ? "Access your dashboard and active projects."
                : "Create an account to track your order and collaborate with our team."}
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="you@company.com"
                  disabled={mode === "signup" && step !== "details"}
                />
              </div>

              {mode === "login" || step === "details" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full border border-slate-300 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      placeholder="********"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-500 transition hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-900"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                    >
                      {showPassword ? (
                        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M3 3l18 18" strokeLinecap="round" />
                          <path d="M10.6 10.7a2 2 0 002.7 2.7" strokeLinecap="round" />
                          <path d="M9.9 4.2A10.8 10.8 0 0112 4c5.2 0 8.6 4.4 9.5 6a1.9 1.9 0 010 2 15 15 0 01-2.5 3.1M6.2 6.2A15 15 0 002.5 10a1.9 1.9 0 000 2c.9 1.6 4.3 6 9.5 6 1.3 0 2.5-.3 3.6-.7" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M2.5 10a1.9 1.9 0 000 2c.9 1.6 4.3 6 9.5 6s8.6-4.4 9.5-6a1.9 1.9 0 000-2C20.6 8.4 17.2 4 12 4S3.4 8.4 2.5 10z" />
                          <circle cx="12" cy="11" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              ) : null}

              {mode === "signup" && step === "verify" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Verification Code</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(event) =>
                      setCode(event.target.value.replace(/\D/g, "").slice(0, 8))
                    }
                    inputMode="numeric"
                    maxLength={8}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    placeholder="Enter code"
                  />
                  <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                    <span>Use the latest code sent to your inbox.</span>
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={resending || resendCooldown > 0}
                      className="font-semibold text-slate-900 disabled:text-slate-400"
                    >
                      {resending
                        ? "Sending..."
                        : resendCooldown > 0
                          ? `Resend in ${resendCooldown}s`
                          : "Resend code"}
                    </button>
                  </div>
                </div>
              ) : null}

              {mode === "signup" && step === "username" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Username</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(event) =>
                      setUsername(
                        event.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9_]/g, "")
                      )
                    }
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    placeholder="flowbridge"
                  />
                  <p className="text-xs text-slate-500">
                    Use at least 3 letters, numbers, or underscores.
                  </p>
                </div>
              ) : null}

              {message && (
                <div className="text-sm text-slate-600">{message}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-3 rounded-xl hover:bg-slate-800 transition disabled:opacity-60"
              >
                {loading
                  ? "Processing..."
                  : mode === "login"
                  ? "Sign In"
                  : step === "details"
                  ? "Send Verification Code"
                  : step === "verify"
                  ? "Verify Code"
                  : "Finish Setup"}
              </button>

              <div className="mt-2">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full border border-slate-300 rounded-xl py-3 text-sm font-medium hover:bg-slate-50 transition"
                >
                  Continue with Google
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-900 text-white flex items-center justify-center px-6 py-16">
          <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-xl p-10 text-center">
            Loading...
          </div>
        </main>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}
