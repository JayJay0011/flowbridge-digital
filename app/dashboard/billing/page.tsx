"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

type SavedCard = { saved: boolean; brand: string | null; last4: string | null; expMonth: number | null; expYear: number | null };

function DashboardBillingContent() {
  const searchParams = useSearchParams();
  const [card, setCard] = useState<SavedCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadCard = useCallback(async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) { setLoading(false); return; }
    const response = await fetch("/api/stripe/saved-card", { headers: { Authorization: `Bearer ${token}` } });
    const result = await response.json();
    if (!response.ok) { setError(result.error || "Unable to load billing details."); setLoading(false); return; }
    setCard(result as SavedCard);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadCard();
    const status = searchParams.get("card");
    if (status === "added") setNotice("Secure card setup completed. Your saved card will appear here once Stripe confirms it.");
    if (status === "canceled") setNotice("Card setup was canceled. You can still pay at checkout without saving a card.");
  }, [loadCard, searchParams]);

  const startCardSetup = async () => {
    setBusy(true); setError(null);
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) { setError("Sign in again to manage your saved card."); setBusy(false); return; }
    const response = await fetch("/api/stripe/setup-card", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const result = await response.json();
    if (!response.ok || !result.url) { setError(result.error || "Unable to start secure card setup."); setBusy(false); return; }
    window.location.assign(result.url);
  };

  const removeCard = async () => {
    setBusy(true); setError(null);
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) { setError("Sign in again to manage your saved card."); setBusy(false); return; }
    const response = await fetch("/api/stripe/remove-card", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const result = await response.json();
    if (!response.ok) { setError(result.error || "Unable to remove your saved card."); setBusy(false); return; }
    setCard({ saved: false, brand: null, last4: null, expMonth: null, expYear: null });
    setNotice("Saved card removed."); setBusy(false);
  };

  return (
    <section>
      <h2 className="text-2xl font-semibold">Billing</h2>
      <p className="mt-2 text-[var(--dash-muted)]">Choose whether to save a card for future checkout. Saving a card is optional.</p>

      <div className="mt-8 max-w-2xl rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Saved payment method</h3>
            {loading ? <p className="mt-3 text-sm text-[var(--dash-muted)]">Loading billing details…</p> : card?.saved ? (
              <p className="mt-3 text-sm text-[var(--dash-muted)]">{card.brand} ending in {card.last4} · Expires {String(card.expMonth).padStart(2, "0")}/{card.expYear}</p>
            ) : <p className="mt-3 text-sm text-[var(--dash-muted)]">No saved card. You can enter payment details each time you check out.</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={startCardSetup} disabled={busy || loading} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{card?.saved ? "Update card" : "Add a card"}</button>
            {card?.saved ? <button type="button" onClick={removeCard} disabled={busy} className="rounded-lg border border-[var(--dash-border)] px-4 py-2 text-sm font-semibold disabled:opacity-50">Remove</button> : null}
          </div>
        </div>
        <p className="mt-5 text-sm leading-6 text-[var(--dash-muted)]">Card details are entered on Stripe’s secure page. Flowbridge stores only the card brand, last four digits, and expiration date. You can still pay without saving a card.</p>
        {notice ? <p role="status" className="mt-4 text-sm text-emerald-700">{notice}</p> : null}
        {error ? <p role="alert" className="mt-4 text-sm text-red-600">{error}</p> : null}
      </div>

      <div className="mt-6 max-w-2xl rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6">
        <h3 className="text-lg font-semibold">Order payments</h3>
        <p className="mt-3 text-sm leading-6 text-[var(--dash-muted)]">Pay for a published package at its listed price, or accept a custom offer in your inbox and pay the agreed amount. Payment is processed through Stripe Checkout.</p>
        <Link href="/dashboard/orders" className="mt-5 inline-flex text-sm font-semibold underline">View your orders</Link>
      </div>
    </section>
  );
}

import { Suspense } from "react";

export default function DashboardBillingPage() {
  return <Suspense fallback={<section><h2 className="text-2xl font-semibold">Billing</h2><p className="mt-3 text-[var(--dash-muted)]">Loading billing details…</p></section>}><DashboardBillingContent /></Suspense>;
}
