"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

type CaseStudy = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  created_at: string;
};

export default function AdminCaseStudiesPage() {
  const [items, setItems] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    const { data } = await supabase
      .from("case_studies")
      .select("id,title,slug,status,created_at")
      .order("created_at", { ascending: false });
    setItems((data ?? []) as CaseStudy[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.slug.toLowerCase().includes(query)
    );
  }, [items, search]);

  return (
    <section className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold">Case Studies</h2>
          <p className="text-slate-600 mt-2">
            Publish deep-dive results and structured outcomes.
          </p>
        </div>
        <Link
          href="/admin/case-studies/new"
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold"
        >
          New case study
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search case studies"
          className="w-full md:max-w-sm border border-slate-200 rounded-xl px-4 py-3 text-sm"
        />
        <Link
          href="/case-studies"
          className="text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          Preview live case studies →
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-6 text-slate-500">Loading case studies...</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-slate-500">No case studies yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    {item.status}
                  </p>
                  <h3 className="text-lg font-semibold mt-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">/{item.slug}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/admin/case-studies/${item.id}`}
                    className="text-sm font-semibold text-slate-600"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/case-studies/${item.slug}`}
                    className="text-sm font-semibold text-slate-600"
                  >
                    Preview
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
