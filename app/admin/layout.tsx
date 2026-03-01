"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

const navItems = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/gigs", label: "Gigs", module: "gigs" },
  { href: "/admin/portfolio", label: "Portfolio", module: "portfolio" },
  { href: "/admin/case-studies", label: "Case Studies", module: "case_studies" },
  { href: "/admin/services", label: "Services", module: "services" },
  { href: "/admin/blog", label: "Blog", module: "blog" },
  { href: "/admin/orders", label: "Orders", module: "orders" },
  { href: "/admin/messages", label: "Messages", module: "messages" },
  { href: "/admin/settings", label: "Settings", module: "settings" },
];

type Permission = {
  module: string;
  can_read: boolean;
  can_write: boolean;
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const [hasPermissionRows, setHasPermissionRows] = useState(false);

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
        const { data: permissionRows } = await supabase
          .from("admin_permissions")
          .select("module,can_read,can_write")
          .eq("user_id", user.id);
        setPermissions(permissionRows ?? []);
        setHasPermissionRows((permissionRows ?? []).length > 0);
        setPermissionsLoaded(true);
        setChecking(false);
      }
    };

    guard();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("admin-theme");
    if (saved === "dark" || saved === "light") {
      setTheme(saved);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("admin-theme", theme);
  }, [theme]);

  const moduleFromPath = (path: string) => {
    if (path.startsWith("/admin/gigs")) return "gigs";
    if (path.startsWith("/admin/portfolio")) return "portfolio";
    if (path.startsWith("/admin/case-studies")) return "case_studies";
    if (path.startsWith("/admin/services")) return "services";
    if (path.startsWith("/admin/blog")) return "blog";
    if (path.startsWith("/admin/orders")) return "orders";
    if (path.startsWith("/admin/messages")) return "messages";
    if (path.startsWith("/admin/settings")) return "settings";
    return null;
  };

  const currentModule = moduleFromPath(pathname || "");
  const canAccess = (module: string, action: "read" | "write" = "read") => {
    if (!hasPermissionRows) return true;
    const entry = permissions.find((item) => item.module === module);
    if (!entry) return false;
    return action === "read" ? entry.can_read : entry.can_write;
  };

  useEffect(() => {
    if (!permissionsLoaded || !currentModule) return;
    if (!hasPermissionRows) return;
    const entry = permissions.find((item) => item.module === currentModule);
    if (!entry?.can_read) {
      router.replace("/admin");
    }
  }, [currentModule, hasPermissionRows, permissions, permissionsLoaded, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  if (checking || !permissionsLoaded) {
    return (
      <main className="min-h-screen bg-white text-slate-900 flex items-center justify-center">
        <p className="text-slate-500">Checking admin access...</p>
      </main>
    );
  }

  return (
    <main
      className={`min-h-screen bg-slate-100 text-slate-900 ${
        theme === "dark" ? "admin-theme-dark" : ""
      }`}
    >
      <div className="flex min-h-screen">
        <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-slate-200 px-6 py-8">
          <div className="text-lg font-semibold">Flowbridge Admin</div>
          <p className="text-xs text-slate-500 mt-2">
            Manage content and operations.
          </p>
          <nav className="mt-8 flex flex-col gap-2">
            {navItems
              .filter((item) => !item.module || canAccess(item.module, "read"))
              .map((item) => {
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
                <button
                  type="button"
                  onClick={() =>
                    setTheme((prev) => (prev === "light" ? "dark" : "light"))
                  }
                  className="text-sm font-semibold text-slate-600 hover:text-slate-900"
                >
                  {theme === "light" ? "Dark mode" : "Light mode"}
                </button>
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
                {navItems
                  .filter((item) => !item.module || canAccess(item.module, "read"))
                  .map((item) => {
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
