"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import OrderAction from "./[slug]/order-action";

type Offer = {
  id: string;
  title: string | null;
  description: string | null;
  price: string | null;
  delivery_date: string | null;
  revisions: number | null;
  deliverables: string | null;
  status: string;
};

export default function OfferCheckoutSummary({ offerId }: { offerId: string }) {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        if (active) { setError("Sign in to review this accepted offer."); setLoading(false); }
        return;
      }
      const response = await fetch(`/api/offers/checkout-summary?id=${encodeURIComponent(offerId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json().catch(() => ({}));
      if (!active) return;
      if (!response.ok || !payload.offer) setError(payload.error || "Unable to load this offer.");
      else setOffer(payload.offer as Offer);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [offerId]);

  if (loading) return <p className="mt-8 text-sm text-slate-500">Loading your accepted offer…</p>;
  if (error || !offer) return <p className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error || "Offer unavailable."} Return to your inbox for help.</p>;

  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Custom offer · agreed scope</p>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <h2 className="text-xl font-semibold">{offer.title || "Custom project"}</h2>
        <p className="text-xl font-semibold">{offer.price || "Amount not set"}</p>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{offer.description || "No scope description provided."}</p>
      {offer.deliverables ? <div className="mt-4"><h3 className="text-sm font-semibold">Deliverables</h3><p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{offer.deliverables}</p></div> : null}
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-600">
        {offer.delivery_date ? <span className="rounded-full bg-white px-3 py-1">Delivery: {offer.delivery_date}</span> : null}
        {offer.revisions != null ? <span className="rounded-full bg-white px-3 py-1">Revisions: {offer.revisions}</span> : null}
      </div>
      {offer.status === "paid" ? <p className="mt-5 rounded-xl bg-emerald-100 p-3 text-sm text-emerald-800">This offer has already been paid.</p> : <div className="mt-6"><OrderAction offerId={offer.id} label="Pay agreed amount" /></div>}
    </div>
  );
}
