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
  const [uniqueVisitors, setUniqueVisitors] = useState(0);
  const [trafficCountries, setTrafficCountries] = useState<{ country: string; count: number }[]>([]);
  const [orderingCountries, setOrderingCountries] = useState<{ country: string; count: number }[]>([]);
  const [notice, setNotice] = useState("Loading analytics...");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      const response = await fetch("/api/admin/analytics", { headers: { Authorization: `Bearer ${data.session?.access_token || ""}` } });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) { setNotice(payload.error || "Unable to load analytics."); return; }
      setCounts(payload.counts || {});
      setUniqueVisitors(payload.uniqueVisitors || 0);
      setTrafficCountries(payload.trafficCountries || []);
      setOrderingCountries(payload.orderingCountries || []);
      setNotice("");
    };
    void load();
  }, []);

  const max = Math.max(1, ...stages.map(([key]) => counts[key] || 0));
  const countryName = (code: string) => {
    try { return new Intl.DisplayNames(["en"], { type: "region" }).of(code) || code; } catch { return code; }
  };
  const flag = (code: string) => code.replace(/./g, (letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)));
  const CountryPanel = ({ title, subtitle, rows }: { title: string; subtitle: string; rows: { country: string; count: number }[] }) => {
    const countryMax = Math.max(1, ...rows.map((row) => row.count));
    return <div className="rounded-2xl border border-slate-200 p-6"><h3 className="text-xl font-semibold">{title}</h3><p className="mt-2 text-sm text-slate-500">{subtitle}</p>{rows.length ? <div className="mt-6 grid gap-3">{rows.map((row) => <div key={row.country} className="grid grid-cols-[1fr_auto] items-center gap-4"><div><div className="flex items-center justify-between gap-3 text-sm"><span>{flag(row.country)} {countryName(row.country)}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-cyan-500" style={{ width: `${Math.max(8, row.count / countryMax * 100)}%` }} /></div></div><span className="text-lg font-semibold">{row.count}</span></div>)}</div> : <p className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Country data will appear as new visits are recorded.</p>}</div>;
  };
  return (
    <section className="p-6 md:p-10">
      <div className="mx-auto max-w-6xl space-y-8">
       <div className="rounded-3xl bg-white p-8 shadow-sm md:p-10">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Admin analytics</p>
        <h2 className="mt-4 text-3xl font-semibold">Customer funnel</h2>
        <p className="mt-3 text-slate-600">Event totals from the last 30 days. This report is visible only inside the admin control center.</p>
        {notice ? <p className="mt-8 rounded-xl bg-slate-100 p-4 text-sm text-slate-600">{notice}</p> : (<>
          <div className="mt-8 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl bg-slate-950 p-5 text-white"><p className="text-sm text-slate-300">Unique visitors</p><p className="mt-2 text-3xl font-semibold">{uniqueVisitors}</p></div><div className="rounded-2xl bg-slate-100 p-5"><p className="text-sm text-slate-500">Tracked events</p><p className="mt-2 text-3xl font-semibold">{Object.values(counts).reduce((sum, count) => sum + count, 0)}</p></div><div className="rounded-2xl bg-slate-100 p-5"><p className="text-sm text-slate-500">Paid orders</p><p className="mt-2 text-3xl font-semibold">{counts.payment_completed || 0}</p></div></div>
          <div className="mt-10 grid gap-4">
            {stages.map(([key, label]) => (
              <div key={key} className="grid gap-3 rounded-2xl border border-slate-200 p-5 md:grid-cols-[190px_1fr_70px] md:items-center">
                <p className="font-semibold">{label}</p>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-cyan-500" style={{ width: `${Math.max(counts[key] ? 4 : 0, ((counts[key] || 0) / max) * 100)}%` }} /></div>
                <p className="text-2xl font-semibold md:text-right">{counts[key] || 0}</p>
              </div>
            ))}
          </div></>)}
       </div>
       {!notice ? <div className="rounded-3xl bg-white p-8 shadow-sm md:p-10"><p className="text-xs uppercase tracking-[0.3em] text-slate-400">Geographic heat map</p><h2 className="mt-4 text-3xl font-semibold">Where visitors and customers come from</h2><p className="mt-3 text-slate-600">Country intensity is based on real activity captured during the last 30 days.</p><div className="mt-8 grid gap-6 lg:grid-cols-2"><CountryPanel title="Most active browsing countries" subtitle="Website views and purchase-intent activity" rows={trafficCountries} /><CountryPanel title="Most ordering countries" subtitle="Countries recorded at successful checkout" rows={orderingCountries} /></div></div> : null}
      </div>
    </section>
  );
}
