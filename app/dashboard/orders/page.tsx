"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

type Related<T> = T | T[] | null;

type Order = {
  id: string;
  status: string;
  payment_status: string | null;
  stripe_session_id: string | null;
  revision_request: string | null;
  amount_cents: number | null;
  currency: string | null;
  package_tier: string | null;
  created_at: string;
  gigs: Related<{ title: string | null; delivery_days: number | null; package_basic: { delivery_days?: number } | null; package_standard: { delivery_days?: number } | null; package_premium: { delivery_days?: number } | null }>;
};

type OrderSection = "active" | "in_progress" | "review" | "completed";

const statusLabel = (status: string) => {
  if (status === "complete") return "Completed";
  if (status === "delivered") return "Delivered";
  if (status === "revision_requested") return "Revision requested";
  if (status === "in_progress") return "In progress";
  if (status === "cancelled") return "Cancelled";
  return "New";
};

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export default function DashboardOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<OrderSection>("active");
  const [reviewedOrders, setReviewedOrders] = useState<Set<string>>(new Set());
  const [revisionReason, setRevisionReason] = useState("");
  const [acting, setActing] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") !== "success") return;
    setActionMessage("Confirming your payment and loading the order…");
    const timeout = window.setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.delete("payment");
      url.searchParams.delete("session_id");
      window.history.replaceState({}, "", url.toString());
    }, 8000);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;
    const subscribe = async () => {
      const { data } = await supabase.auth.getSession();
      const clientId = data.session?.user.id;
      if (!clientId || cancelled) return;
      channel = supabase.channel(`orders-dashboard-${clientId}`).on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "orders", filter: `client_id=eq.${clientId}`,
      }, (payload) => {
        const updated = payload.new as Order;
        setOrders((current) => current.map((order) => order.id === updated.id ? { ...order, status: updated.status, revision_request: updated.revision_request } : order));
      }).subscribe();
    };
    void subscribe();
    return () => { cancelled = true; if (channel) void supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("id,status,payment_status,stripe_session_id,revision_request,amount_cents,currency,package_tier,created_at,gigs(title,delivery_days,package_basic,package_standard,package_premium)")
        .order("created_at", { ascending: false });
      return data ?? [];
    };
    const load = async () => {
      const [{ data: reviews }, initialOrders] = await Promise.all([
        supabase.from("reviews").select("order_id"),
        fetchOrders(),
      ]);
      if (isMounted) {
        setOrders(initialOrders);
        setReviewedOrders(
          new Set(
            (reviews ?? [])
              .map((review) => review.order_id as string | null)
              .filter((id): id is string => Boolean(id))
          )
        );
        const orderFromQuery = new URLSearchParams(window.location.search).get("order");
        setSelectedId((prev) => orderFromQuery && initialOrders.some((order) => order.id === orderFromQuery) ? orderFromQuery : prev ?? initialOrders[0]?.id ?? null);
        setLoading(false);
        const sessionId = new URLSearchParams(window.location.search).get("session_id");
        if (sessionId && !initialOrders.some((order) => order.stripe_session_id === sessionId)) {
          for (let attempt = 0; attempt < 8 && isMounted; attempt += 1) {
            await new Promise((resolve) => window.setTimeout(resolve, 2500));
            const updatedOrders = await fetchOrders();
            if (!isMounted) return;
            setOrders(updatedOrders);
            const paidOrder = updatedOrders.find((order) => order.stripe_session_id === sessionId && order.payment_status === "paid");
            if (paidOrder) {
              setSelectedId(paidOrder.id);
              setActionMessage("Payment confirmed. Your order is ready in Active orders.");
              return;
            }
          }
          if (isMounted) setActionMessage("Payment was completed, but order confirmation is taking longer than usual. Refresh this page shortly or contact Flowbridge if it does not appear.");
        } else if (sessionId) {
          const paidOrder = initialOrders.find((order) => order.stripe_session_id === sessionId && order.payment_status === "paid");
          if (paidOrder) setActionMessage("Payment confirmed. Your order is ready in Active orders.");
        }
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedId) ?? orders.find((order) => ["new", "in_progress"].includes(order.status)) ?? orders[0],
    [orders, selectedId]
  );

  const selectedGig = useMemo(() => {
    if (!selectedOrder) return null;
    return Array.isArray(selectedOrder.gigs)
      ? selectedOrder.gigs[0]
      : selectedOrder.gigs;
  }, [selectedOrder]);

  const amountLabel = selectedOrder?.amount_cents
    ? new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: (selectedOrder.currency || "usd").toUpperCase(),
      }).format(selectedOrder.amount_cents / 100)
    : "To be confirmed";

  const selectedPackage = selectedOrder?.package_tier && selectedGig
    ? selectedGig[`package_${selectedOrder.package_tier}` as "package_basic" | "package_standard" | "package_premium"]
    : null;
  const expectedDelivery = selectedOrder
    ? selectedOrder.package_tier === "custom_offer"
      ? "See your agreed offer in Messages"
      : addDays(new Date(selectedOrder.created_at), selectedPackage?.delivery_days || selectedGig?.delivery_days || 7).toLocaleDateString()
    : "";

  const sectionOrders = useMemo(() => {
    switch (activeSection) {
      case "active":
      case "in_progress":
        return orders.filter((order) => order.payment_status === "paid" && ["new", "in_progress"].includes(order.status));
      case "review":
        return orders.filter((order) => order.payment_status === "paid" && ["delivered", "revision_requested"].includes(order.status));
      case "completed":
        return orders.filter((order) => order.payment_status === "paid" && ["complete", "cancelled"].includes(order.status));
    }
  }, [activeSection, orders]);

  const sectionCards: { id: OrderSection; title: string; description: string; count: number }[] = [
    { id: "active", title: "Active orders", description: "Orders you’ve placed", count: orders.filter((order) => order.payment_status === "paid" && ["new", "in_progress"].includes(order.status)).length },
    { id: "in_progress", title: "In progress", description: "Work underway", count: orders.filter((order) => order.payment_status === "paid" && ["new", "in_progress"].includes(order.status)).length },
    { id: "review", title: "In review", description: "Delivery or revisions", count: orders.filter((order) => order.payment_status === "paid" && ["delivered", "revision_requested"].includes(order.status)).length },
    { id: "completed", title: "Completed", description: "Finished orders", count: orders.filter((order) => order.payment_status === "paid" && ["complete", "cancelled"].includes(order.status)).length },
  ];

  useEffect(() => {
    const orderFromQuery = new URLSearchParams(window.location.search).get("order");
    const order = orderFromQuery ? orders.find((item) => item.id === orderFromQuery) : null;
    if (!order) return;
    setSelectedId(order.id);
    if (["delivered", "revision_requested"].includes(order.status)) setActiveSection("review");
    else if (["complete", "cancelled"].includes(order.status)) setActiveSection("completed");
    else setActiveSection("active");
  }, [orders]);

  useEffect(() => {
    if (sectionOrders.length && !sectionOrders.some((order) => order.id === selectedId)) {
      setSelectedId(sectionOrders[0].id);
    }
  }, [sectionOrders, selectedId]);

  const updateDeliveryStatus = async (nextStatus: "revision_requested" | "complete") => {
    if (!selectedOrder) return;
    if (nextStatus === "revision_requested" && !revisionReason.trim()) {
      setActionMessage("Please tell us what needs revision before submitting.");
      return;
    }

    setActing(true);
    setActionMessage(null);
    const { data: session } = await supabase.auth.getSession();
    const token = session.session?.access_token;
    if (!token) {
      setActionMessage("Please sign in again to update this order.");
      setActing(false);
      return;
    }
    const response = await fetch("/api/orders/decision", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ orderId: selectedOrder.id, decision: nextStatus, revisionReason }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setActionMessage(payload.error || "Unable to update this order.");
      setActing(false);
      return;
    }

    setOrders((current) =>
      current.map((order) =>
        order.id === selectedOrder.id
          ? {
              ...order,
              status: nextStatus,
              revision_request:
                nextStatus === "revision_requested" ? revisionReason.trim() : null,
            }
          : order
      )
    );
    setRevisionReason("");
    setActionMessage(payload.activityRecorded === false
      ? "Order updated, but the conversation could not be updated. Please message Flowbridge with this decision."
      : nextStatus === "complete"
        ? "Delivery accepted. You can now leave a review."
        : "Revision request sent to Flowbridge.");
    setActing(false);
    if (nextStatus === "complete") {
      router.push(`/dashboard/reviews?order=${selectedOrder.id}`);
    }
  };

  return (
    <section>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Orders</h2>
          <p className="text-[var(--dash-muted)] mt-2">
            Track active orders and delivery status.
          </p>
        </div>
        <Link href="/gigs" className="text-sm font-semibold text-[var(--dash-strong)]">
          Browse gigs →
        </Link>
      </div>

      <div className="mt-8 border border-[var(--dash-border)] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-6 text-slate-500">Loading orders...</div>
        ) : (
          <div className="p-5 md:p-7 bg-[var(--dash-surface-2)]">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {sectionCards.map((card) => (
                <button key={card.id} type="button" onClick={() => setActiveSection(card.id)} aria-pressed={activeSection === card.id}
                  className={`rounded-2xl border p-5 text-left transition ${activeSection === card.id ? "border-slate-900 bg-slate-900 text-white shadow-md" : "border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text)] hover:border-slate-400"}`}>
                  <span className="text-2xl font-semibold">{card.count}</span>
                  <span className="mt-2 block font-semibold">{card.title}</span>
                  <span className={`mt-1 block text-sm ${activeSection === card.id ? "text-slate-300" : "text-[var(--dash-muted)]"}`}>{card.description}</span>
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              <h3 className="text-lg font-semibold">{sectionCards.find((card) => card.id === activeSection)?.title}</h3>
              {sectionOrders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[var(--dash-border)] bg-[var(--dash-surface)] p-8 text-center">
                  <p className="font-medium">No {sectionCards.find((card) => card.id === activeSection)?.title.toLowerCase()} yet</p>
                  <p className="mt-1 text-sm text-[var(--dash-muted)]">Your orders will appear here as their status changes.</p>
                  {orders.length === 0 ? <Link href="/gigs" className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Browse gigs</Link> : null}
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {sectionOrders.map((order) => {
                    const gig = Array.isArray(order.gigs) ? order.gigs[0] : order.gigs;
                    return <article key={order.id} className={`rounded-2xl border p-4 transition ${selectedId === order.id ? "border-slate-900 bg-[var(--dash-surface)] ring-1 ring-slate-900" : "border-[var(--dash-border)] bg-[var(--dash-surface)] hover:border-slate-400"}`}>
                      <button type="button" onClick={() => setSelectedId(order.id)} className="w-full text-left">
                        <div className="flex items-start justify-between gap-3"><span className="font-semibold">{gig?.title || (order.package_tier === "custom_offer" ? "Custom offer" : "Custom project")}</span><span className="shrink-0 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-700">{statusLabel(order.status)}</span></div>
                        <p className="mt-2 text-sm text-[var(--dash-muted)]">Order {order.id.slice(0, 8)} · {order.amount_cents != null ? new Intl.NumberFormat(undefined, { style: "currency", currency: (order.currency || "usd").toUpperCase() }).format(order.amount_cents / 100) : "Amount pending"}</p>
                      </button>
                      {order.payment_status === "paid" ? <Link href={`/dashboard/orders/${encodeURIComponent(order.id)}`} className="mt-3 inline-flex text-sm font-semibold underline">View order</Link> : null}
                    </article>;
                  })}
                </div>
              )}
            </div>
            {selectedOrder && sectionOrders.some((order) => order.id === selectedOrder.id) ? <div className="mt-6 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
            <div className="space-y-6">
              <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl p-6">
                <h3 className="text-lg font-semibold">Order activity</h3>
                <p className="text-[var(--dash-muted)] mt-2">
                  Follow the latest updates on this order.
                </p>
                <div className="mt-6 space-y-4">
                  {[
                    {
                      title: "You placed the order",
                      active: true,
                    },
                    {
                      title: "Work in progress",
                      active: selectedOrder.status !== "new",
                    },
                    {
                      title:
                        selectedOrder.status === "revision_requested"
                          ? "Revision requested"
                          : "Delivery submitted",
                      active: ["delivered", "revision_requested", "complete"].includes(
                        selectedOrder.status
                      ),
                    },
                    {
                      title: "Order completed",
                      active: selectedOrder.status === "complete",
                    },
                  ].map((item, index) => (
                    <div key={item.title} className="flex items-start gap-3">
                      <div className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full text-xs ${
                        item.active
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="mt-1 text-xs text-[var(--dash-muted)]">
                          {item.active ? "Reached" : "Pending"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.status === "delivered" ? (
                <div className="rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6">
                  <h3 className="text-lg font-semibold">Review delivery</h3>
                  <p className="mt-2 text-[var(--dash-muted)]">
                    Accept the delivered work, or request a revision with the
                    changes needed.
                  </p>
                  <textarea
                    value={revisionReason}
                    onChange={(event) => setRevisionReason(event.target.value)}
                    rows={3}
                    className="mt-5 w-full rounded-xl border border-[var(--dash-border)] bg-transparent px-4 py-3"
                    placeholder="Describe any revision needed..."
                  />
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      disabled={acting}
                      onClick={() => updateDeliveryStatus("revision_requested")}
                      className="rounded-xl border border-[var(--dash-border)] px-4 py-3 text-sm font-semibold"
                    >
                      Request revision
                    </button>
                    <button
                      type="button"
                      disabled={acting}
                      onClick={() => updateDeliveryStatus("complete")}
                      className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
                    >
                      Approve delivery
                    </button>
                  </div>
                </div>
              ) : selectedOrder.status === "revision_requested" ? (
                <div className="rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6">
                  <h3 className="text-lg font-semibold">Revision requested</h3>
                  <p className="mt-2 text-[var(--dash-muted)]">
                    Your requested changes have been shared with Flowbridge.
                  </p>
                  {selectedOrder.revision_request ? (
                    <p className="mt-4 rounded-xl bg-[var(--dash-surface-2)] p-4 text-sm">
                      {selectedOrder.revision_request}
                    </p>
                  ) : null}
                </div>
              ) : selectedOrder.status === "complete" &&
                !reviewedOrders.has(selectedOrder.id) ? (
                <div className="rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6">
                  <h3 className="text-lg font-semibold">Share your experience</h3>
                  <p className="mt-2 text-[var(--dash-muted)]">
                    This order is complete. Your feedback helps us improve the
                    work and helps others make informed decisions.
                  </p>
                  <Link
                    href={`/dashboard/reviews?order=${selectedOrder.id}`}
                    className="mt-5 inline-flex rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
                  >
                    Leave a review
                  </Link>
                </div>
              ) : null}
              {actionMessage ? (
                <p className="text-sm text-[var(--dash-muted)]">{actionMessage}</p>
              ) : null}
            </div>

            <aside className="space-y-6">
              <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Order details</h3>
                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600">
                    {statusLabel(selectedOrder.status)}
                  </span>
                </div>
                <div className="mt-4 space-y-3 text-sm text-[var(--dash-muted)]">
                  <div className="flex items-center justify-between">
                    <span>Order</span>
                    <span className="font-medium text-[var(--dash-strong)]">
                      {selectedOrder.id.slice(0, 8)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Gig</span>
                    <span className="font-medium text-[var(--dash-strong)]">
                      {selectedGig?.title || "Custom project"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Expected delivery</span>
                    <span className="font-medium text-[var(--dash-strong)]">
                      {expectedDelivery}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total price</span>
                    <span className="font-medium text-[var(--dash-strong)]">
                      {amountLabel}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/dashboard/messages?order=${encodeURIComponent(selectedOrder.id)}`}
                  className="mt-5 w-full inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
                >
                  View conversation
                </Link>
                <Link href={`/dashboard/orders/${encodeURIComponent(selectedOrder.id)}`} className="mt-3 inline-flex text-sm font-semibold underline">View full order</Link>
              </div>

              <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl p-6">
                <h4 className="text-sm font-semibold">Track order</h4>
                <div className="mt-4 space-y-3 text-sm text-[var(--dash-muted)]">
                  <div className="flex items-center gap-3">
                    <span className={`h-2 w-2 rounded-full ${
                      ["delivered", "revision_requested", "complete"].includes(selectedOrder.status)
                        ? "bg-emerald-500"
                        : "bg-slate-300"
                    }`} />
                    Delivery submitted
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`h-2 w-2 rounded-full ${
                      selectedOrder.status === "complete"
                        ? "bg-emerald-500"
                        : "bg-slate-300"
                    }`} />
                    Order completed
                  </div>
                </div>
              </div>
            </aside>
            </div> : null}
          </div>
        )}
      </div>
    </section>
  );
}
