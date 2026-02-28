"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

export default function Header() {
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
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

  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="w-full border-b bg-white text-slate-900 border-slate-200">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-5 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          Flowbridge Digital
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="/services" className="transition">
            Services
          </Link>
          <Link href="/gigs" className="transition">
            Gigs
          </Link>
          <Link href="/portfolio" className="transition">
            Portfolio
          </Link>
          <Link href="/blog" className="transition">
            Blog
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
          <Link
            href={email ? "/dashboard" : "/login?mode=signup"}
            className="ml-2 px-4 py-2 rounded-lg text-sm font-semibold transition bg-slate-900 text-white hover:bg-slate-800"
          >
            {email ? "Dashboard" : "Get Started"}
          </Link>
        </nav>

        <a
          href="https://cal.com/flow-bridge-digital-tee44g/systems-strategy-consultation"
          target="_blank"
          rel="noreferrer"
          className="hidden md:inline-flex px-5 py-2.5 rounded-lg text-sm font-semibold transition bg-slate-100 text-slate-900 hover:bg-slate-200"
        >
          Book Call
        </a>

        <div className="flex items-center gap-3 md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="px-3 py-2 rounded-full text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-100"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            {mobileOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>
      {mobileOpen ? (
        <div id="mobile-menu" className="md:hidden border-t border-slate-200">
          <nav className="px-4 py-4 flex flex-col gap-4 text-sm font-medium text-slate-600">
            <Link href="/services" onClick={() => setMobileOpen(false)}>
              Services
            </Link>
            <Link href="/gigs" onClick={() => setMobileOpen(false)}>
              Gigs
            </Link>
            <Link href="/portfolio" onClick={() => setMobileOpen(false)}>
              Portfolio
            </Link>
            <Link href="/blog" onClick={() => setMobileOpen(false)}>
              Blog
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
              className="px-4 py-2 rounded-lg text-sm font-semibold transition bg-slate-900 text-white hover:bg-slate-800 text-center"
            >
              {email ? "Dashboard" : "Get Started"}
            </Link>
            <a
              href="https://cal.com/flow-bridge-digital-tee44g/systems-strategy-consultation"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-lg text-sm font-semibold transition text-center bg-slate-100 text-slate-900 hover:bg-slate-200"
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
