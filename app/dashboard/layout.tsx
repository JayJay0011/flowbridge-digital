"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

type Profile = {
  username: string | null;
  avatar_url: string | null;
  company_name: string | null;
  role: "admin" | "client" | null;
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!user) {
        router.replace("/login?next=/dashboard");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("username,avatar_url,company_name,role")
        .eq("id", user.id)
        .single();

      setProfile(profileData ?? null);
    };

    load();
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("dashboard-theme");
    if (saved === "dark" || saved === "light") {
      setTheme(saved);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("dashboard-theme", theme);
  }, [theme]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  const navItems = [
    { href: "/dashboard/orders", label: "Orders" },
    { href: "/dashboard/billing", label: "Add billing" },
    { href: "/dashboard/support", label: "Support" },
    { href: "/dashboard/referrals", label: "Refer a friend" },
  ];

  const isDark = theme === "dark";
  const themeClass = useMemo(
    () => (isDark ? "dashboard-theme-dark" : "dashboard-theme-light"),
    [isDark]
  );

  const headerLinkClass = isDark
    ? "text-sm font-semibold text-slate-200 hover:text-white"
    : "text-sm font-semibold text-[var(--dash-muted)] hover:text-[var(--dash-strong)]";

  return (
    <main className={`min-h-screen ${themeClass} bg-[var(--dash-bg)] text-[var(--dash-text)]`}>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--dash-muted)]">
              Client Dashboard
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold mt-3">
              Welcome back{profile?.username ? `, ${profile.username}` : ""}.
            </h1>
            <p className="mt-2 text-[var(--dash-muted)]">
              Track orders, message the team, and manage your profile.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className={headerLinkClass}
            >
              Back to main site →
            </Link>
            <button
              onClick={handleSignOut}
              className={headerLinkClass}
            >
              Log out
            </button>
          </div>
        </div>

        <div className="mt-10 grid lg:grid-cols-[240px_1fr] gap-8">
          <aside
            className="rounded-3xl p-6 bg-[var(--dash-surface)] border border-[var(--dash-border)]"
          >
            <div className="flex flex-col items-center text-center gap-3">
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={profile?.company_name || profile?.username || "Profile"}
                  className="h-16 w-16 rounded-full object-cover border border-[var(--dash-border)]"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-[var(--dash-surface-2)] flex items-center justify-center text-sm font-semibold text-[var(--dash-muted)]">
                  {(profile?.company_name || profile?.username || "FB")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold">
                  {profile?.company_name || "Flowbridge Client"}
                </p>
                <p className="text-xs text-[var(--dash-muted)]">
                  {profile?.username || "Client dashboard"}
                </p>
              </div>
              <Link
                href="/dashboard/profile"
                className="text-xs font-semibold text-[var(--dash-strong)] bg-[var(--dash-surface-2)] px-3 py-1 rounded-full"
              >
                Edit profile
              </Link>
            </div>

            <div className="mt-8 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium transition ${
                    pathname === item.href
                      ? isDark
                        ? "bg-white text-slate-900"
                        : "bg-slate-900 text-white"
                      : isDark
                      ? "text-slate-200 hover:bg-slate-800/60"
                      : "text-slate-700 hover:bg-[var(--dash-surface-2)]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {profile?.role === "admin" ? (
              <div className="mt-6">
                <p className="text-xs uppercase tracking-[0.25em] text-[var(--dash-muted)]">
                  Admin
                </p>
                <Link
                  href="/admin"
                  className={`mt-3 flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium transition ${
                    isDark
                      ? "bg-slate-800 text-white hover:bg-slate-700"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  Admin dashboard
                </Link>
              </div>
            ) : null}

            <div className="mt-8">
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--dash-muted)]">
                Theme
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`rounded-2xl px-3 py-2 text-xs font-semibold transition ${
                    theme === "light"
                      ? "bg-slate-900 text-white"
                      : isDark
                      ? "bg-slate-800 text-slate-200"
                      : "bg-[var(--dash-surface-2)] text-slate-700"
                  }`}
                >
                  Light mode
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`rounded-2xl px-3 py-2 text-xs font-semibold transition ${
                    theme === "dark"
                      ? "bg-slate-900 text-white"
                      : isDark
                      ? "bg-slate-800 text-slate-200"
                      : "bg-[var(--dash-surface-2)] text-slate-700"
                  }`}
                >
                  Dark mode
                </button>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className={`mt-8 w-full rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                isDark
                  ? "bg-slate-800 text-white hover:bg-slate-700"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              Log out
            </button>
          </aside>

          <div
            className="rounded-3xl p-6 md:p-10 bg-[var(--dash-surface)] text-[var(--dash-text)] border border-[var(--dash-border)]"
          >
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
