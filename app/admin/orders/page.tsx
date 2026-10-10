"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

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
  gigs: Related<{ title: string | null }>;
  profiles: Related<{ email: string | null }>;
};

export default function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const focusedOrderId = searchParams.get("order");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [deliveryOrderId, setDeliveryOrderId] = useState<string | null>(null);
  const [deliveryNote, setDeliveryNote] = useState("");
  const [deliveryFiles, setDeliveryFiles] = useState<File[]>([]);
  const [submittingDelivery, setSubmittingDelivery] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id,client_id,status,payment_status,amount_cents,currency,package_tier,revision_request,created_at,gigs(title),profiles(email)")
        .order("created_at", { ascending: false });

      if (isMounted) {
        setOrders(error ? [] : (data ?? []));
        setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("admin-orders-lifecycle")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, (payload) => {
        const updated = payload.new as Partial<Order> & { id: string };
        setOrders((current) => current.map((order) => order.id === updated.id ? { ...order, ...updated } : order));
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, []);

  const submitDelivery = async (orderId: string) => {
    setSubmittingDelivery(true);
    setMessage(null);
    const { data: session } = await supabase.auth.getSession();
    const token = session.session?.access_token;
    if (!token) {
      setMessage("Please sign in again to submit delivery.");
      setSubmittingDelivery(false);
      return;
    }
    const uploadedAttachments: { path: string; name: string }[] = [];
    for (const file of deliveryFiles) {
      const form = new FormData();
      form.set("file", file);
      const order = orders.find((item) => item.id === orderId);
      if (!order) {
        setMessage("Order not found. Refresh and try again.");
        setSubmittingDelivery(false);
        return;
      }
      if (!order.client_id) {
        setMessage("Unable to identify the client for this delivery.");
        setSubmittingDelivery(false);
        return;
      }
      form.set("clientId", order.client_id);
      const uploadResponse = await fetch("/api/messages/attachment", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const uploaded = await uploadResponse.json().catch(() => ({}));
      if (!uploadResponse.ok || !uploaded.path) {
        setMessage(uploaded.error || `Could not upload ${file.name}. Delivery was not submitted.`);
        setSubmittingDelivery(false);
        return;
      }
      uploadedAttachments.push({ path: uploaded.path, name: file.name });
    }
    const response = await fetch("/api/admin/orders/delivery", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ orderId, note: deliveryNote, attachments: uploadedAttachments }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(result.error || "Unable to submit delivery.");
      setSubmittingDelivery(false);
      return;
    }
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId ? { ...order, status: "delivered" } : order
      )
    );
    setDeliveryOrderId(null);
    setDeliveryNote("");
    setDeliveryFiles([]);
    setMessage(result.notificationSent === false ? "Delivery submitted. Client activity message could not be added." : "Delivery submitted and sent to the client for approval.");
    setSubmittingDelivery(false);
  };

  const statusLabel = (status: string) => status === "in_progress" ? "In progress" : status === "revision_requested" ? "Revision requested" : status === "delivered" ? "Awaiting client approval" : status === "complete" ? "Completed" : status === "cancelled" ? "Cancelled" : status;

  return (
    <main className="bg-white text-slate-900">
      <section className="py-16 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <h1 className="text-3xl font-semibold">Orders</h1>
          <p className="text-slate-600 mt-2">
            Track orders, submit delivery, and manage completion status.
          </p>
          {message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-6 py-4 font-medium">Order</th>
                  <th className="px-6 py-4 font-medium">Account</th>
                  <th className="px-6 py-4 font-medium">Gig</th>
                  <th className="px-6 py-4 font-medium">Amount / payment</th>
                  <th className="px-6 py-4 font-medium">Package</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Revision note</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr className="border-t border-slate-200">
                    <td className="px-6 py-6 text-slate-500" colSpan={8}>
                      Loading orders...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr className="border-t border-slate-200">
                    <td className="px-6 py-6 text-slate-500" colSpan={8}>
                      No orders yet.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const profile = Array.isArray(order.profiles)
                      ? order.profiles[0]
                      : order.profiles;
                    const gig = Array.isArray(order.gigs) ? order.gigs[0] : order.gigs;

                    return (
                      <tr key={order.id} className={`border-t border-slate-200 ${focusedOrderId === order.id ? "bg-amber-50 ring-2 ring-inset ring-amber-400" : ""}`}>
                        <td className="px-6 py-4 font-medium">
                          {order.id.slice(0, 8)}
                        </td>
                        <td className="px-6 py-4">
                          {profile?.email || "—"}
                        </td>
                        <td className="px-6 py-4">
                          {gig?.title || "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>{order.amount_cents != null ? new Intl.NumberFormat(undefined, { style: "currency", currency: (order.currency || "usd").toUpperCase() }).format(order.amount_cents / 100) : "—"}</div>
                          <div className={`mt-1 text-xs font-semibold ${order.payment_status === "paid" ? "text-emerald-700" : "text-amber-700"}`}>{order.payment_status || "unpaid"}</div>
                        </td>
                        <td className="px-6 py-4 capitalize">{order.package_tier === "custom_offer" ? "Custom offer" : order.package_tier || "—"}</td>
                        <td className="px-6 py-4">
                          <span className="block text-xs font-semibold text-slate-700">{statusLabel(order.status)}</span>
                          {order.payment_status === "paid" && ["in_progress", "revision_requested"].includes(order.status) ? (
                            deliveryOrderId === order.id ? (
                              <div className="mt-2 min-w-52 space-y-2">
                                <textarea value={deliveryNote} onChange={(event) => setDeliveryNote(event.target.value)} rows={3} placeholder="Add an optional delivery note" className="w-full rounded-lg border border-slate-200 p-2 text-xs" />
                                <input type="file" multiple onChange={(event) => setDeliveryFiles(Array.from(event.target.files ?? []))} className="block w-full text-xs" aria-label="Attach delivered files" />
                                {deliveryFiles.length ? <p className="text-xs text-slate-500">{deliveryFiles.map((file) => file.name).join(", ")}</p> : null}
                                <div className="flex gap-2"><button type="button" disabled={submittingDelivery} onClick={() => void submitDelivery(order.id)} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{submittingDelivery ? "Submitting…" : "Submit delivery"}</button><button type="button" onClick={() => { setDeliveryOrderId(null); setDeliveryNote(""); setDeliveryFiles([]); }} className="rounded-lg border border-slate-200 px-3 py-2 text-xs">Cancel</button></div>
                              </div>
                            ) : <button type="button" onClick={() => setDeliveryOrderId(order.id)} className="mt-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold">{order.status === "revision_requested" ? "Submit revision" : "Submit delivery"}</button>
                          ) : null}
                        </td>
                        <td className="max-w-xs px-6 py-4 text-slate-600">
                          {order.revision_request || "—"}
                        </td>
                        <td className="px-6 py-4">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
