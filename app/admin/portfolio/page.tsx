"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type PortfolioItem = {
  id: string;
  title: string;
  status: string;
  created_at: string;
};

export default function AdminPortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const { data, error } = await supabase
        .from("portfolio")
        .select("id,title,status,created_at")
        .order("created_at", { ascending: false });

      if (isMounted) {
        setItems(error ? [] : (data ?? []));
        setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleStatus = async (item: PortfolioItem) => {
    const nextStatus = item.status === "published" ? "draft" : "published";
    setUpdating(item.id);
    await supabase
      .from("portfolio")
      .update({ status: nextStatus })
      .eq("id", item.id);
    setItems((prev) =>
      prev.map((row) =>
        row.id === item.id ? { ...row, status: nextStatus } : row
      )
    );
    setUpdating(null);
  };

  return (
    <main className="bg-[var(--background)] text-[var(--foreground)]">
      <section className="py-16 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 md:px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold">Portfolio</h1>
            <p className="text-slate-600 mt-2">
              Publish proof of work, outcomes, and case highlights.
            </p>
          </div>
          <Link
            href="/admin/portfolio/new"
            className="inline-flex items-center justify-center px-5 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition"
          >
            Add Portfolio Item
          </Link>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-8">
          {loading ? (
            <div className="border border-slate-200 rounded-2xl p-6 text-slate-500">
              Loading portfolio...
            </div>
          ) : items.length === 0 ? (
            <div className="border border-slate-200 rounded-2xl p-6 text-slate-500">
              No portfolio items yet. Create your first one.
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="border border-slate-200 rounded-2xl p-6 bg-white"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{item.title}</h2>
                  <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                    {item.status}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-500">
                  Updated {new Date(item.created_at).toLocaleDateString()}
                </p>
              <div className="mt-6 text-sm font-medium text-slate-900">
                <button
                  onClick={() => toggleStatus(item)}
                  className="text-slate-900 hover:text-slate-700 transition"
                  disabled={updating === item.id}
                >
                  {item.status === "published" ? "Unpublish" : "Publish"}
                </button>
              </div>
            </div>
          ))
          )}
        </div>
      </section>
    </main>
  );
}
