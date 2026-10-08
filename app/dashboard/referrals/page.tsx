"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Referral = { id: string; joinedAt: string; status: "joined" | "paid" };
type ReferralData = { referralCode: string; referralUrl: string; referrals: Referral[] };

export default function DashboardReferralsPage() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) { setError("Sign in again to view your referral link."); setLoading(false); return; }
    const response = await fetch("/api/referrals", { headers: { Authorization: `Bearer ${token}` } });
    const result = await response.json();
    if (!response.ok) { setError(result.error || "Unable to load your referral details."); setLoading(false); return; }
    setData(result as ReferralData);
    setLoading(false);
  }, []);

  useEffect(() => {
    const initialize = async () => { await load(); };
    void initialize();
  }, [load]);

  const copyLink = async () => {
    if (!data?.referralUrl) return;
    try {
      await navigator.clipboard.writeText(data.referralUrl);
      setCopyMessage("Referral link copied.");
    } catch {
      setCopyMessage("Copy is unavailable in this browser. Select and copy the link above.");
    }
  };

  const paidCount = data?.referrals.filter((referral) => referral.status === "paid").length ?? 0;

  return (
    <section>
      <h2 className="text-2xl font-semibold">Refer a business</h2>
      <p className="mt-2 text-[var(--dash-muted)]">Share Flowbridge with someone who may need help with CRM, automation, or business systems.</p>

      <div className="mt-8 max-w-3xl rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface-2)] p-6">
        <h3 className="text-lg font-semibold">Your referral link</h3>
        <p className="mt-2 text-sm text-[var(--dash-muted)]">Referrals are attributed when a new account signs up through this link. We show signup and paid-order activity here; no service credit is promised until referral reward terms are announced.</p>
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
          <input type="text" value={loading ? "Loading your link…" : data?.referralUrl ?? ""} readOnly aria-label="Your referral link" className="w-full min-w-0 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-4 py-3 text-sm" />
          <button type="button" onClick={copyLink} disabled={!data?.referralUrl} className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50">Copy link</button>
        </div>
        {copyMessage ? <p role="status" className="mt-3 text-sm text-[var(--dash-muted)]">{copyMessage}</p> : null}
        {error ? <p role="alert" className="mt-3 text-sm text-red-600">{error}</p> : null}
        {data ? <p className="mt-3 text-xs text-[var(--dash-muted)]">Referral code: {data.referralCode}</p> : null}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5"><p className="text-sm text-[var(--dash-muted)]">Joined</p><p className="mt-2 text-2xl font-semibold">{data?.referrals.length ?? 0}</p></div>
        <div className="rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5"><p className="text-sm text-[var(--dash-muted)]">Paid order</p><p className="mt-2 text-2xl font-semibold">{paidCount}</p></div>
        <div className="rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5"><p className="text-sm text-[var(--dash-muted)]">Reward</p><p className="mt-2 text-sm text-[var(--dash-muted)]">No reward program announced</p></div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)]">
        <div className="border-b border-[var(--dash-border)] px-5 py-4"><h3 className="font-semibold">Referral activity</h3></div>
        {loading ? <p className="p-5 text-sm text-[var(--dash-muted)]">Loading referral activity…</p> : data?.referrals.length ? (
          <ul className="divide-y divide-[var(--dash-border)]">{data.referrals.map((referral) => <li key={referral.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm"><span>Account joined {new Date(referral.joinedAt).toLocaleDateString()}</span><span className={`rounded-full px-3 py-1 text-xs font-semibold ${referral.status === "paid" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{referral.status === "paid" ? "Paid order" : "Signed up"}</span></li>)}</ul>
        ) : <p className="p-5 text-sm text-[var(--dash-muted)]">No signups through your link yet.</p>}
      </div>
    </section>
  );
}
