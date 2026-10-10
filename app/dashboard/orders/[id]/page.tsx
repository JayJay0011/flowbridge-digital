"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import MessageAttachment from "../../../components/MessageAttachment";

type Order = {
  id: string; status: string; payment_status: string | null; amount_cents: number | null;
  currency: string | null; package_tier: string | null; revision_request: string | null;
  created_at: string; offer_id: string | null; gigs: { title: string | null } | { title: string | null }[] | null;
};
type Offer = { title: string | null; description: string | null; delivery_date: string | null; revisions: number | null; deliverables: string | null };
type Activity = { id: string; subject: string | null; body: string; created_at: string };
const statusLabel = (status: string) => ({ in_progress: "In progress", delivered: "Awaiting your review", revision_requested: "Revision requested", complete: "Completed", cancelled: "Cancelled", new: "New" }[status] || status);

function readableActivityBody(body: string) {
  if (!body.startsWith("__order__:")) return body;
  try {
    const order = JSON.parse(body.slice("__order__:".length)) as { title?: string };
    return `Payment confirmed. Your order for ${order.title || "this service"} is now in progress.`;
  } catch {
    return "Payment confirmed. Your order is now in progress.";
  }
}

export default function ClientOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = params.id;
  const [order, setOrder] = useState<Order | null>(null);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [revisionReason, setRevisionReason] = useState("");
  const [acting, setActing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data, error } = await supabase.from("orders").select("id,status,payment_status,amount_cents,currency,package_tier,revision_request,created_at,offer_id,gigs(title)").eq("id", orderId).maybeSingle();
      if (cancelled) return;
      if (error || !data) { setLoading(false); return; }
      setOrder(data as Order);
      const [offerResult, activityResult] = await Promise.all([
        data.offer_id ? supabase.from("offers").select("title,description,delivery_date,revisions,deliverables").eq("id", data.offer_id).maybeSingle() : Promise.resolve({ data: null }),
        supabase.from("messages").select("id,subject,body,created_at").eq("order_id", orderId).order("created_at", { ascending: true }),
      ]);
      if (cancelled) return;
      setOffer(offerResult.data as Offer | null);
      setActivity((activityResult.data ?? []) as Activity[]);
      setLoading(false);
    };
    void load();
    return () => { cancelled = true; };
  }, [orderId]);

  const decide = async (decision: "complete" | "revision_requested") => {
    if (!order) return;
    if (decision === "revision_requested" && !revisionReason.trim()) { setNotice("Describe what needs to be revised first."); return; }
    setActing(true); setNotice(null);
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) { setNotice("Please sign in again to update this order."); setActing(false); return; }
    const response = await fetch("/api/orders/decision", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ orderId, decision, revisionReason }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) { setNotice(result.error || "Unable to update this order."); setActing(false); return; }
    setOrder({ ...order, status: decision, revision_request: decision === "revision_requested" ? revisionReason.trim() : null });
    setRevisionReason("");
    if (decision === "complete") router.push(`/dashboard/reviews?order=${encodeURIComponent(order.id)}`);
    else setNotice("Revision request sent to Flowbridge.");
    setActing(false);
  };

  const gig = Array.isArray(order?.gigs) ? order.gigs[0] : order?.gigs;
  const title = offer?.title || gig?.title || "Custom project";
  const amount = order?.amount_cents != null ? new Intl.NumberFormat(undefined, { style: "currency", currency: (order.currency || "usd").toUpperCase() }).format(order.amount_cents / 100) : "To be confirmed";

  if (loading) return <div className="p-8 text-slate-500">Loading order…</div>;
  if (!order) return <section className="rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-8"><h1 className="text-2xl font-semibold">Order not found</h1><p className="mt-2 text-[var(--dash-muted)]">This order may not belong to your account.</p><Link href="/dashboard/orders" className="mt-5 inline-flex underline">Back to orders</Link></section>;
  if (order.payment_status !== "paid") return <section className="rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-8"><h1 className="text-2xl font-semibold">Payment is not complete</h1><p className="mt-2 text-[var(--dash-muted)]">The order page will be available after payment is confirmed.</p><Link href="/dashboard/messages" className="mt-5 inline-flex underline">Return to messages</Link></section>;

  return <section className="space-y-6">
    <Link href="/dashboard/orders" className="text-sm font-semibold underline">← All orders</Link>
    <header className="rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--dash-muted)]">Order {order.id.slice(0, 8)}</p><h1 className="mt-2 text-2xl font-semibold md:text-3xl">{title}</h1></div><span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold">{statusLabel(order.status)}</span></div>
      <div className="mt-6 grid gap-4 border-t border-[var(--dash-border)] pt-5 sm:grid-cols-2 lg:grid-cols-4"><div><p className="text-xs text-[var(--dash-muted)]">Total paid</p><p className="mt-1 font-semibold">{amount}</p></div><div><p className="text-xs text-[var(--dash-muted)]">Package</p><p className="mt-1 font-semibold capitalize">{order.package_tier === "custom_offer" ? "Custom offer" : order.package_tier || "—"}</p></div><div><p className="text-xs text-[var(--dash-muted)]">Order date</p><p className="mt-1 font-semibold">{new Date(order.created_at).toLocaleDateString()}</p></div><div><Link href={`/dashboard/messages?order=${encodeURIComponent(order.id)}`} className="inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">Open conversation</Link></div></div>
    </header>
    {offer ? <article className="rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6"><h2 className="text-lg font-semibold">Agreed offer</h2><p className="mt-3 whitespace-pre-wrap text-sm text-[var(--dash-muted)]">{offer.description || "Scope agreed in your conversation."}</p><dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2"><div><dt className="text-[var(--dash-muted)]">Delivery date</dt><dd className="mt-1 font-medium">{offer.delivery_date ? new Date(`${offer.delivery_date}T00:00:00`).toLocaleDateString() : "As agreed"}</dd></div><div><dt className="text-[var(--dash-muted)]">Revisions</dt><dd className="mt-1 font-medium">{offer.revisions ?? "As agreed"}</dd></div><div className="sm:col-span-2"><dt className="text-[var(--dash-muted)]">Deliverables</dt><dd className="mt-1 whitespace-pre-wrap font-medium">{offer.deliverables || "See agreed scope in Messages."}</dd></div></dl></article> : null}
    {order.status === "delivered" ? <article className="rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6"><h2 className="text-lg font-semibold">Review the delivery</h2><p className="mt-2 text-sm text-[var(--dash-muted)]">Open the delivery files in the activity below, then approve the work or request a revision.</p><textarea value={revisionReason} onChange={(event) => setRevisionReason(event.target.value)} rows={3} placeholder="Describe any changes needed for a revision" className="mt-4 w-full rounded-xl border border-[var(--dash-border)] bg-transparent px-4 py-3"/><div className="mt-4 flex flex-wrap gap-3"><button type="button" disabled={acting} onClick={() => void decide("revision_requested")} className="rounded-xl border border-[var(--dash-border)] px-4 py-3 text-sm font-semibold disabled:opacity-50">Request revision</button><button type="button" disabled={acting} onClick={() => void decide("complete")} className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">Approve delivery</button></div></article> : null}
    {order.status === "complete" ? <article className="rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6"><h2 className="text-lg font-semibold">Order completed</h2><Link href={`/dashboard/reviews?order=${encodeURIComponent(order.id)}`} className="mt-3 inline-flex underline">Leave a review</Link></article> : null}
    {order.status === "revision_requested" && order.revision_request ? <article className="rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6"><h2 className="font-semibold">Your revision request</h2><p className="mt-2 whitespace-pre-wrap text-sm text-[var(--dash-muted)]">{order.revision_request}</p></article> : null}
    <article className="rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6"><h2 className="text-lg font-semibold">Order activity</h2><div className="mt-5 space-y-4">{activity.length ? activity.map((item) => <div key={item.id} className="rounded-xl bg-[var(--dash-surface-2)] p-4"><p className="text-xs text-[var(--dash-muted)]">{item.subject || "Order update"} · {new Date(item.created_at).toLocaleString()}</p><div className="mt-2 space-y-2">{readableActivityBody(item.body).split("\n").map((line, index) => { const match = line.trim().match(/^Attachment:\s*storage:\/\/(\S+)/i); return match ? <p key={index} className="text-sm"><MessageAttachment path={match[1]} label="Open delivered file" /></p> : <p key={index} className="whitespace-pre-wrap text-sm">{line}</p>; })}</div></div>) : <p className="text-sm text-[var(--dash-muted)]">Order updates and delivered files will appear here.</p>}</div></article>
    {notice ? <p role="status" className="text-sm text-[var(--dash-muted)]">{notice}</p> : null}
  </section>;
}
