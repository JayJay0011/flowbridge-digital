"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

export default function Header() {
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

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

  return (
    <header className="w-full bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold text-slate-900 tracking-tight">
          Flowbridge Digital
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="/services" className="hover:text-slate-900 transition">
            Services
          </Link>
          <Link href="/gigs" className="hover:text-slate-900 transition">
            Gigs
          </Link>
          <Link href="/portfolio" className="hover:text-slate-900 transition">
            Portfolio
          </Link>
          <Link href="/about" className="hover:text-slate-900 transition">
            About
          </Link>
          <Link href="/reviews" className="hover:text-slate-900 transition">
            Reviews
          </Link>
          <Link href="/contact" className="hover:text-slate-900 transition">
            Contact
          </Link>
          {email ? null : (
            <Link href="/login" className="hover:text-slate-900 transition">
              Login
            </Link>
          )}
          <button
            type="button"
            onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
            className="h-9 w-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100"
            title="Toggle theme"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <Link
            href={email ? "/dashboard" : "/login?mode=signup"}
            className="ml-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition"
          >
            {email ? "Dashboard" : "Get Started"}
          </Link>
        </nav>

        <a
          href="https://cal.com/flow-bridge-digital-tee44g/systems-strategy-consultation"
          target="_blank"
          rel="noreferrer"
          className="hidden md:inline-flex bg-slate-100 text-slate-900 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-200 transition"
        >
          Book Call
        </a>
      </div>
    </header>
  );
}
