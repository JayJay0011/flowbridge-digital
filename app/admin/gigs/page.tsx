"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Gig = {
  id: string;
  title: string;
  status: string;
  price_text: string | null;
  created_at: string;
};

export default function AdminGigsPage() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const { data, error } = await supabase
        .from("gigs")
        .select("id,title,status,price_text,created_at")
        .order("created_at", { ascending: false });

      if (isMounted) {
        setGigs(error ? [] : (data ?? []));
        setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleStatus = async (gig: Gig) => {
    const nextStatus = gig.status === "published" ? "draft" : "published";
    setUpdating(gig.id);
    await supabase
      .from("gigs")
      .update({ status: nextStatus })
      .eq("id", gig.id);
    setGigs((prev) =>
      prev.map((item) =>
        item.id === gig.id ? { ...item, status: nextStatus } : item
      )
    );
    setUpdating(null);
  };

  return (
    <main className="bg-white text-slate-900">
      <section className="py-16 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 md:px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold">Gigs</h1>
            <p className="text-slate-600 mt-2">
              Manage how clients order and where they are routed.
            </p>
          </div>
          <Link
            href="/admin/gigs/new"
            className="inline-flex items-center justify-center px-5 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition"
          >
            Add New Gig
          </Link>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-6 py-4 font-medium">Gig</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Starting Price</th>
                  <th className="px-6 py-4 font-medium">Updated</th>
                  <th className="px-6 py-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr className="border-t border-slate-200">
                    <td className="px-6 py-6 text-slate-500" colSpan={5}>
                      Loading gigs...
                    </td>
                  </tr>
                ) : gigs.length === 0 ? (
                  <tr className="border-t border-slate-200">
                    <td className="px-6 py-6 text-slate-500" colSpan={5}>
                      No gigs yet. Create your first gig.
                    </td>
                  </tr>
                ) : (
                  gigs.map((gig) => (
                  <tr key={gig.id} className="border-t border-slate-200">
                    <td className="px-6 py-4 font-medium">{gig.title}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs bg-slate-100 text-slate-700">
                        {gig.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{gig.price_text || "—"}</td>
                    <td className="px-6 py-4">
                      {new Date(gig.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/gigs/${gig.id}`}
                          className="text-slate-600 hover:text-slate-900 transition"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => toggleStatus(gig)}
                          className="text-slate-900 hover:text-slate-700 transition"
                          disabled={updating === gig.id}
                        >
                          {gig.status === "published" ? "Unpublish" : "Publish"}
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
