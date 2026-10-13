"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const STORAGE_KEY = "flowbridge-launch-offer-seen";

export default function LaunchOfferPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (pathname !== "/" || window.localStorage.getItem(STORAGE_KEY)) return;
    const timer = window.setTimeout(() => setOpen(true), 1200);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  const dismiss = () => {
    window.localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 p-4" role="dialog" aria-modal="true" aria-labelledby="launch-offer-title">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white p-8 shadow-2xl md:p-10">
        <button type="button" onClick={dismiss} aria-label="Close launch offer" className="absolute right-5 top-5 h-10 w-10 rounded-full bg-slate-100 text-xl text-slate-700">×</button>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-700">Launching gift</p>
        <h2 id="launch-offer-title" className="mt-4 max-w-md text-3xl font-semibold text-slate-950 md:text-4xl">Get 10% off your first order</h2>
        <p className="mt-4 leading-7 text-slate-600">Start with a structured Flowbridge service and receive 10% off your first completed checkout during our launch offer.</p>
        <div className="mt-6 rounded-2xl bg-slate-100 p-4 text-sm text-slate-700">
          <p><strong>Launch date:</strong> Coming soon</p>
          <p className="mt-1">Valid for one month from the official launch date. First orders only.</p>
        </div>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link href="/services" onClick={dismiss} className="inline-flex justify-center rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white">Explore services</Link>
          <button type="button" onClick={dismiss} className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700">Maybe later</button>
        </div>
      </div>
    </div>
  );
}
