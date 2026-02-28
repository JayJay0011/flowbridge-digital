"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

export default function Header() {
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("site-theme");
      if (saved === "dark" || saved === "light") {
        setTheme(saved);
        document.documentElement.classList.remove("site-theme-light", "site-theme-dark");
        document.documentElement.classList.add(`site-theme-${saved}`);
      } else {
        document.documentElement.classList.add("site-theme-light");
      }
    }

    let isMounted = true;

    const load = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!user) {
        if (isMounted) {
          setEmail(null);
        }
        return;
      }

      if (isMounted) {
        setEmail(user.email ?? null);
      }
    };

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("site-theme", theme);
    document.documentElement.classList.remove("site-theme-light", "site-theme-dark");
    document.documentElement.classList.add(`site-theme-${theme}`);
  }, [theme]);

  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  const isDark = theme === "dark";
  const headerClass = isDark
    ? "bg-slate-950 text-slate-100 border-slate-800"
    : "bg-[var(--background)] text-[var(--foreground)] border-slate-200";
  const navTextClass = isDark
    ? "text-slate-200 hover:text-white"
    : "text-slate-600 hover:text-slate-900";
  const ghostButtonClass = isDark
    ? "border-slate-700 text-slate-200 hover:bg-slate-800"
    : "border-slate-200 text-slate-700 hover:bg-slate-100";
  const ctaClass = isDark
    ? "bg-[var(--background)] text-[var(--foreground)] hover:bg-slate-100"
    : "bg-slate-900 text-white hover:bg-slate-800";
  const callClass = isDark
    ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
    : "bg-slate-100 text-slate-900 hover:bg-slate-200";

  return (
    <header className={`w-full border-b ${headerClass}`}>
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-5 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          Flowbridge Digital
        </Link>

        <nav className={`hidden md:flex items-center gap-8 text-sm font-medium ${navTextClass}`}>
          <Link href="/services" className="transition">
            Services
          </Link>
          <Link href="/gigs" className="transition">
            Gigs
          </Link>
          <Link href="/portfolio" className="transition">
            Portfolio
          </Link>
          <Link href="/about" className="transition">
            About
          </Link>
          <Link href="/reviews" className="transition">
            Reviews
          </Link>
          <Link href="/contact" className="transition">
            Contact
          </Link>
          {email ? null : (
            <Link href="/login" className="transition">
              Login
            </Link>
          )}
          <button
            type="button"
            onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
            className={`h-9 w-9 rounded-full border flex items-center justify-center ${ghostButtonClass}`}
            title="Toggle theme"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <Link
            href={email ? "/dashboard" : "/login?mode=signup"}
            className={`ml-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${ctaClass}`}
          >
            {email ? "Dashboard" : "Get Started"}
          </Link>
        </nav>

        <a
          href="https://cal.com/flow-bridge-digital-tee44g/systems-strategy-consultation"
          target="_blank"
          rel="noreferrer"
          className={`hidden md:inline-flex px-5 py-2.5 rounded-lg text-sm font-semibold transition ${callClass}`}
        >
          Book Call
        </a>

        <div className="flex items-center gap-3 md:hidden">
          <button
            type="button"
            onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
            className={`h-9 w-9 rounded-full border flex items-center justify-center ${ghostButtonClass}`}
            title="Toggle theme"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className={`px-3 py-2 rounded-full text-sm font-semibold border ${ghostButtonClass}`}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            {mobileOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>
      {mobileOpen ? (
        <div id="mobile-menu" className={`md:hidden border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>
          <nav className={`px-4 py-4 flex flex-col gap-4 text-sm font-medium ${navTextClass}`}>
            <Link href="/services" onClick={() => setMobileOpen(false)}>
              Services
            </Link>
            <Link href="/gigs" onClick={() => setMobileOpen(false)}>
              Gigs
            </Link>
            <Link href="/portfolio" onClick={() => setMobileOpen(false)}>
              Portfolio
            </Link>
            <Link href="/about" onClick={() => setMobileOpen(false)}>
              About
            </Link>
            <Link href="/reviews" onClick={() => setMobileOpen(false)}>
              Reviews
            </Link>
            <Link href="/contact" onClick={() => setMobileOpen(false)}>
              Contact
            </Link>
            {email ? null : (
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                Login
              </Link>
            )}
            <Link
              href={email ? "/dashboard" : "/login?mode=signup"}
              onClick={() => setMobileOpen(false)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${ctaClass} text-center`}
            >
              {email ? "Dashboard" : "Get Started"}
            </Link>
            <a
              href="https://cal.com/flow-bridge-digital-tee44g/systems-strategy-consultation"
              target="_blank"
              rel="noreferrer"
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition text-center ${callClass}`}
              onClick={() => setMobileOpen(false)}
            >
              Book Call
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
