"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/dashboard";
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";

  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [step, setStep] = useState<"details" | "verify" | "username">("details");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const redirectByRole = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    const safeNext = nextPath.startsWith("/admin") ? "/dashboard" : nextPath;
    if (!userId) {
      router.replace(safeNext);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    router.replace(profile?.role === "admin" ? "/admin" : safeNext);
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        await redirectByRole();
      }
    };
    checkSession();
  }, [nextPath, router]);

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
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      setStep("verify");
      setMessage("Enter the 6-digit code sent to your email.");
      setLoading(false);
      return;
    }

    if (step === "verify") {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "email",
      });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        const { error: updateError } = await supabase.auth.updateUser({
          password,
        });

        if (updateError) {
          setMessage(updateError.message);
          setLoading(false);
          return;
        }
      }

      setStep("username");
      setMessage(null);
      setLoading(false);
      return;
    }

    if (step === "username") {
      const normalized = username.trim().toLowerCase();
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
        setMessage(profileError.message);
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
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    placeholder="********"
                  />
                </div>
              ) : null}

              {mode === "signup" && step === "verify" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Verification Code</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    placeholder="6-digit code"
                  />
                </div>
              ) : null}

              {mode === "signup" && step === "username" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Username</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    placeholder="flowbridge"
                  />
                  <p className="text-xs text-slate-500">
                    Usernames must be unique and at least 3 characters.
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
