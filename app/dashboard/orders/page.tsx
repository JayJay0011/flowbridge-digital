"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

type Related<T> = T | T[] | null;

type Order = {
  id: string;
  status: string;
  revision_request: string | null;
  amount_cents: number | null;
  currency: string | null;
  created_at: string;
  gigs: Related<{ title: string | null; delivery_days: number | null }>;
};

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reviewedOrders, setReviewedOrders] = useState<Set<string>>(new Set());
  const [revisionReason, setRevisionReason] = useState("");
  const [acting, setActing] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const [{ data }, { data: reviews }] = await Promise.all([
        supabase
          .from("orders")
          .select("id,status,revision_request,amount_cents,currency,created_at,gigs(title,delivery_days)")
          .order("created_at", { ascending: false }),
        supabase.from("reviews").select("order_id"),
      ]);
      if (isMounted) {
        setOrders(data ?? []);
        setReviewedOrders(
          new Set(
            (reviews ?? [])
              .map((review) => review.order_id as string | null)
              .filter((id): id is string => Boolean(id))
          )
        );
        setSelectedId((prev) => prev ?? data?.[0]?.id ?? null);
        setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedId) ?? orders[0],
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

  const expectedDelivery = selectedOrder
    ? addDays(
        new Date(selectedOrder.created_at),
        selectedGig?.delivery_days || 7
      ).toLocaleDateString()
    : "";

  const updateDeliveryStatus = async (nextStatus: "revision_requested" | "complete") => {
    if (!selectedOrder) return;
    if (nextStatus === "revision_requested" && !revisionReason.trim()) {
      setActionMessage("Please tell us what needs revision before submitting.");
      return;
    }

    setActing(true);
    setActionMessage(null);
    const { error } = await supabase
      .from("orders")
      .update({
        status: nextStatus,
        revision_request:
          nextStatus === "revision_requested" ? revisionReason.trim() : null,
      })
      .eq("id", selectedOrder.id)
      .eq("status", "delivered");

    if (error) {
      setActionMessage(error.message);
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
    setActionMessage(
      nextStatus === "complete"
        ? "Delivery accepted. You can now leave a review."
        : "Revision request sent to Flowbridge."
    );
    setActing(false);
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
        <div className="flex flex-wrap items-center gap-4 px-6 py-4 border-b border-[var(--dash-border)] bg-[var(--dash-surface)]">
          <p className="text-sm font-semibold text-[var(--dash-strong)]">
            Order timeline and delivery actions
          </p>
          {orders.length > 1 ? (
            <select
              value={selectedId ?? ""}
              onChange={(event) => setSelectedId(event.target.value)}
              className="ml-auto text-sm border border-[var(--dash-border)] bg-[var(--dash-surface)] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  {(Array.isArray(order.gigs) ? order.gigs[0]?.title : order.gigs?.title) ||
                    "Order"}{" "}
                  · {order.id.slice(0, 6)}
                </option>
              ))}
            </select>
          ) : null}
        </div>

        {loading ? (
          <div className="p-6 text-slate-500">Loading orders...</div>
        ) : !selectedOrder ? (
          <div className="p-6 text-slate-500">No orders yet.</div>
        ) : (
          <div className="grid lg:grid-cols-[1.7fr_1fr] gap-8 p-6 bg-[var(--dash-surface-2)]">
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
                      Accept delivery
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
                  href="/dashboard/messages"
                  className="mt-5 w-full inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
                >
                  View conversation
                </Link>
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
          </div>
        )}
      </div>
    </section>
  );
}
