"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

type Order = {
  id: string;
  status: string;
  created_at: string;
  gigs: { title: string } | null;
};

const statusLabel = (status: string) => {
  if (status === "complete") return "Completed";
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

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const { data } = await supabase
        .from("orders")
        .select("id,status,created_at,gigs(title)")
        .order("created_at", { ascending: false });
      if (isMounted) {
        setOrders(data ?? []);
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
          <div className="flex gap-4 text-sm font-medium text-[var(--dash-muted)]">
            <button className="text-[var(--dash-strong)] border-b-2 border-[var(--dash-strong)] pb-2">
              Activity
            </button>
            <button className="hover:text-[var(--dash-strong)]">Details</button>
            <button className="hover:text-[var(--dash-strong)]">Requirements</button>
            <button className="hover:text-[var(--dash-strong)]">Delivery</button>
          </div>
          {orders.length > 1 ? (
            <select
              value={selectedId ?? ""}
              onChange={(event) => setSelectedId(event.target.value)}
              className="ml-auto text-sm border border-[var(--dash-border)] bg-[var(--dash-surface)] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.gigs?.title || "Order"} · {order.id.slice(0, 6)}
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
                      date: new Date(selectedOrder.created_at),
                    },
                    {
                      title: "Requirements submitted",
                      date: addDays(new Date(selectedOrder.created_at), 1),
                    },
                    {
                      title: "Work in progress",
                      date: addDays(new Date(selectedOrder.created_at), 2),
                    },
                    {
                      title: "Delivery review",
                      date: addDays(new Date(selectedOrder.created_at), 5),
                    },
                  ].map((item, index) => (
                    <div key={item.title} className="flex items-start gap-3">
                      <div className="mt-1 h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-[var(--dash-muted)] mt-1">
                          {item.date.toLocaleDateString()} ·{" "}
                          {item.date.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl p-6">
                <h3 className="text-lg font-semibold">
                  Keep working together
                </h3>
                <p className="text-[var(--dash-muted)] mt-2">
                  Start a long-term project with Flowbridge and keep momentum
                  strong across automation, CRM, and growth.
                </p>
                <button className="mt-5 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition">
                  Request follow-up →
                </button>
              </div>
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
                      {selectedOrder.gigs?.title || "Custom project"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Delivery date</span>
                    <span className="font-medium text-[var(--dash-strong)]">
                      {addDays(new Date(selectedOrder.created_at), 7).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total price</span>
                    <span className="font-medium text-[var(--dash-strong)]">—</span>
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
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Delivery reviewed
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-slate-300" />
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
