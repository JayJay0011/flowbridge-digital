"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Related<T> = T | T[] | null;

type Order = {
  id: string;
  status: string;
  revision_request: string | null;
  created_at: string;
  gigs: Related<{ title: string | null }>;
  profiles: Related<{ email: string | null }>;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id,status,revision_request,created_at,gigs(title),profiles(email)")
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

  const updateStatus = async (orderId: string, status: string) => {
    setMessage(null);
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setOrders((current) =>
      current.map((order) =>
        order.id === orderId ? { ...order, status } : order
      )
    );
    setMessage("Order status updated.");
  };

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
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Revision note</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr className="border-t border-slate-200">
                    <td className="px-6 py-6 text-slate-500" colSpan={6}>
                      Loading orders...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr className="border-t border-slate-200">
                    <td className="px-6 py-6 text-slate-500" colSpan={6}>
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
                      <tr key={order.id} className="border-t border-slate-200">
                        <td className="px-6 py-4 font-medium">
                          {order.id.slice(0, 8)}
                        </td>
                        <td className="px-6 py-4">
                          {profile?.email || "—"}
                        </td>
                        <td className="px-6 py-4">
                          {gig?.title || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(event) =>
                              updateStatus(order.id, event.target.value)
                            }
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                          >
                            <option value="new">New</option>
                            <option value="in_progress">In progress</option>
                            <option value="delivered">Delivered</option>
                            <option value="revision_requested">Revision requested</option>
                            <option value="complete">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
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
