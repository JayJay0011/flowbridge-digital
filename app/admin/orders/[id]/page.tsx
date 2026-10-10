"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import MessageAttachment from "../../../components/MessageAttachment";

type Related<T> = T | T[] | null;
type Order = {
  id: string;
  client_id: string;
  status: string;
  payment_status: string | null;
  amount_cents: number | null;
  currency: string | null;
  package_tier: string | null;
  revision_request: string | null;
  created_at: string;
  offer_id: string | null;
  gigs: Related<{ title: string | null }>;
  profiles: Related<{ email: string | null; username: string | null }>;
};
type Offer = { title: string | null; description: string | null; delivery_date: string | null; revisions: number | null; deliverables: string | null };
type Activity = { id: string; subject: string | null; body: string; created_at: string };

const statusLabel = (status: string) => ({ in_progress: "In progress", delivered: "Awaiting client approval", revision_requested: "Revision requested", complete: "Completed", cancelled: "Cancelled", new: "New" }[status] || status);

function readableActivityBody(body: string) {
  if (!body.startsWith("__order__:")) return body;
  try {
    const order = JSON.parse(body.slice("__order__:".length)) as { title?: string };
    return `Payment confirmed. The order for ${order.title || "this service"} is now in progress.`;
  } catch {
    return "Payment confirmed. The order is now in progress.";
  }
}

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;
  const [order, setOrder] = useState<Order | null>(null);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data, error } = await supabase.from("orders")
        .select("id,client_id,status,payment_status,amount_cents,currency,package_tier,revision_request,created_at,offer_id,gigs(title),profiles(email,username)")
        .eq("id", orderId).maybeSingle();
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

  const gig = Array.isArray(order?.gigs) ? order.gigs[0] : order?.gigs;
  const profile = Array.isArray(order?.profiles) ? order.profiles[0] : order?.profiles;
  const title = offer?.title || gig?.title || "Custom project";
  const amount = order?.amount_cents != null ? new Intl.NumberFormat(undefined, { style: "currency", currency: (order.currency || "usd").toUpperCase() }).format(order.amount_cents / 100) : "To be confirmed";

  if (loading) return <main className="mx-auto max-w-5xl p-8 text-slate-500">Loading order…</main>;
  if (!order) return <main className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-8"><h1 className="text-2xl font-semibold">Order not found</h1><p className="mt-2 text-slate-600">The order could not be loaded.</p><Link href="/admin/orders" className="mt-5 inline-flex underline">Back to orders</Link></main>;
  if (order.payment_status !== "paid") return <main className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-8"><h1 className="text-2xl font-semibold">Payment is not complete</h1><p className="mt-2 text-slate-600">Order details and activity are available after payment is confirmed.</p><Link href="/admin/orders" className="mt-5 inline-flex underline">Back to orders</Link></main>;

  return <main className="mx-auto max-w-5xl space-y-6 px-4 py-10 text-slate-900 md:px-6">
    <Link href="/admin/orders" className="text-sm font-semibold underline">← All orders</Link>
    <header className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Order {order.id.slice(0, 8)}</p><h1 className="mt-2 text-2xl font-semibold md:text-3xl">{title}</h1></div><span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold">{statusLabel(order.status)}</span></div>
      <div className="mt-6 grid gap-4 border-t border-slate-200 pt-5 sm:grid-cols-2 lg:grid-cols-4"><div><p className="text-xs text-slate-500">Client</p><p className="mt-1 font-semibold">{profile?.username || profile?.email || "—"}</p>{profile?.username && profile.email ? <p className="text-sm text-slate-500">{profile.email}</p> : null}</div><div><p className="text-xs text-slate-500">Amount paid</p><p className="mt-1 font-semibold">{amount}</p></div><div><p className="text-xs text-slate-500">Package</p><p className="mt-1 font-semibold capitalize">{order.package_tier === "custom_offer" ? "Custom offer" : order.package_tier || "—"}</p></div><div><p className="text-xs text-slate-500">Order date</p><p className="mt-1 font-semibold">{new Date(order.created_at).toLocaleDateString()}</p></div></div>
      <Link href={`/admin/messages?client=${encodeURIComponent(order.client_id)}`} className="mt-5 inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">Open conversation</Link>
    </header>
    {offer ? <article className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-lg font-semibold">Agreed offer</h2><p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">{offer.description || "Scope agreed in the conversation."}</p><dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2"><div><dt className="text-slate-500">Delivery date</dt><dd className="mt-1 font-medium">{offer.delivery_date ? new Date(`${offer.delivery_date}T00:00:00`).toLocaleDateString() : "As agreed"}</dd></div><div><dt className="text-slate-500">Revisions</dt><dd className="mt-1 font-medium">{offer.revisions ?? "As agreed"}</dd></div><div className="sm:col-span-2"><dt className="text-slate-500">Deliverables</dt><dd className="mt-1 whitespace-pre-wrap font-medium">{offer.deliverables || "See agreed scope in the conversation."}</dd></div></dl></article> : null}
    {order.status === "revision_requested" && order.revision_request ? <article className="rounded-2xl border border-amber-200 bg-amber-50 p-6"><h2 className="font-semibold">Client revision request</h2><p className="mt-2 whitespace-pre-wrap text-sm">{order.revision_request}</p></article> : null}
    <article className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-lg font-semibold">Order activity</h2><p className="mt-1 text-sm text-slate-500">Payment, delivery notes, client decisions, and delivered files appear here in time order.</p><div className="mt-5 space-y-4">{activity.length ? activity.map((item) => <div key={item.id} className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">{item.subject || "Order update"} · {new Date(item.created_at).toLocaleString()}</p><div className="mt-2 space-y-2">{readableActivityBody(item.body).split("\n").map((line, index) => { const match = line.trim().match(/^Attachment:\s*storage:\/\/(\S+)/i); return match ? <p key={index} className="text-sm"><MessageAttachment path={match[1]} label="Open delivered file" /></p> : <p key={index} className="whitespace-pre-wrap text-sm">{line}</p>; })}</div></div>) : <p className="text-sm text-slate-500">Order updates and delivered files will appear here.</p>}</div></article>
  </main>;
}
