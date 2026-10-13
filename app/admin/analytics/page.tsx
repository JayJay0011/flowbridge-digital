"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const stages = [
  ["gig_viewed", "Gig viewed"], ["checkout_started", "Checkout started"],
  ["offer_accepted", "Offer accepted"], ["payment_completed", "Payment completed"],
  ["delivery_submitted", "Delivery submitted"], ["revision_requested", "Revision requested"],
  ["order_completed", "Order completed"], ["review_submitted", "Review submitted"],
] as const;

export default function AdminAnalyticsPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [notice, setNotice] = useState("Loading analytics...");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      const response = await fetch("/api/admin/analytics", { headers: { Authorization: `Bearer ${data.session?.access_token || ""}` } });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) { setNotice(payload.error || "Unable to load analytics."); return; }
      setCounts(payload.counts || {});
      setNotice("");
    };
    void load();
  }, []);

  const max = Math.max(1, ...stages.map(([key]) => counts[key] || 0));
  return (
    <section className="p-6 md:p-10">
      <div className="mx-auto max-w-6xl rounded-3xl bg-white p-8 shadow-sm md:p-10">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Admin analytics</p>
        <h2 className="mt-4 text-3xl font-semibold">Customer funnel</h2>
        <p className="mt-3 text-slate-600">Event totals from the last 30 days. This report is visible only inside the admin control center.</p>
        {notice ? <p className="mt-8 rounded-xl bg-slate-100 p-4 text-sm text-slate-600">{notice}</p> : (
          <div className="mt-10 grid gap-4">
            {stages.map(([key, label]) => (
              <div key={key} className="grid gap-3 rounded-2xl border border-slate-200 p-5 md:grid-cols-[190px_1fr_70px] md:items-center">
                <p className="font-semibold">{label}</p>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-cyan-500" style={{ width: `${Math.max(counts[key] ? 4 : 0, ((counts[key] || 0) / max) * 100)}%` }} /></div>
                <p className="text-2xl font-semibold md:text-right">{counts[key] || 0}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
