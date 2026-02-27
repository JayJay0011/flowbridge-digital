"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Related<T> = T | T[] | null;

type Order = {
  id: string;
  status: string;
  created_at: string;
  gigs: Related<{ title: string | null }>;
  profiles: Related<{ email: string | null }>;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id,status,created_at,gigs(title),profiles(email)")
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

  return (
    <main className="bg-white text-slate-900">
      <section className="py-16 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-3xl font-semibold">Orders</h1>
          <p className="text-slate-600 mt-2">
            Track incoming client requests and order status.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-6 py-4 font-medium">Order</th>
                  <th className="px-6 py-4 font-medium">Client</th>
                  <th className="px-6 py-4 font-medium">Gig</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr className="border-t border-slate-200">
                    <td className="px-6 py-6 text-slate-500" colSpan={5}>
                      Loading orders...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr className="border-t border-slate-200">
                    <td className="px-6 py-6 text-slate-500" colSpan={5}>
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
                        <span className="px-3 py-1 rounded-full text-xs bg-slate-100 text-slate-700">
                          {order.status}
                        </span>
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
