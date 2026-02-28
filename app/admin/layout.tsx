"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const guard = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        router.replace(`/login?next=${encodeURIComponent(pathname || "/admin")}`);
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error || profile?.role !== "admin") {
        router.replace("/dashboard");
        return;
      }

      if (isMounted) {
        setChecking(false);
      }
    };

    guard();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  if (checking) {
    return (
      <main className="min-h-screen bg-white text-slate-900 flex items-center justify-center">
        <p className="text-slate-500">Checking admin access...</p>
      </main>
    );
  }

  const navItems = useMemo(
    () => [
      { href: "/admin", label: "Overview" },
      { href: "/admin/gigs", label: "Gigs" },
      { href: "/admin/portfolio", label: "Portfolio" },
      { href: "/admin/services", label: "Services" },
      { href: "/admin/blog", label: "Blog" },
      { href: "/admin/orders", label: "Orders" },
      { href: "/admin/messages", label: "Messages" },
      { href: "/admin/settings", label: "Settings" },
    ],
    []
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-slate-200 px-6 py-8">
          <div className="text-lg font-semibold">Flowbridge Admin</div>
          <p className="text-xs text-slate-500 mt-2">
            Manage content and operations.
          </p>
          <nav className="mt-8 flex flex-col gap-2">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition ${
                    active
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto pt-6 space-y-3">
            <Link
              href="/"
              className="block text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              View live site →
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              Log out
            </button>
          </div>
        </aside>

        <div className="flex-1">
          <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Admin
                </p>
                <h1 className="text-lg font-semibold">Control Center</h1>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="hidden sm:inline-flex text-sm font-semibold text-slate-600 hover:text-slate-900"
                >
                  Preview site
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-sm font-semibold text-slate-600 hover:text-slate-900"
                >
                  Log out
                </button>
              </div>
            </div>
            <div className="lg:hidden px-6 pb-4">
              <div className="flex flex-wrap gap-2">
                {navItems.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-3 py-2 rounded-full text-xs font-semibold transition ${
                        active
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </header>

          <div className="px-6 py-8">{children}</div>
        </div>
      </div>
    </main>
  );
}
