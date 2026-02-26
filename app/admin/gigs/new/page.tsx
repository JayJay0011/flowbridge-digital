"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function NewGigPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [priceText, setPriceText] = useState("");
  const [status, setStatus] = useState("draft");
  const [orderHereUrl, setOrderHereUrl] = useState("");
  const [orderFiverrUrl, setOrderFiverrUrl] = useState("");
  const [highlights, setHighlights] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const slug = slugify(title);
    const highlightList = highlights
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const { error: insertError } = await supabase.from("gigs").insert({
      title,
      slug,
      summary,
      price_text: priceText || null,
      status,
      order_here_url: orderHereUrl || null,
      order_fiverr_url: orderFiverrUrl || null,
      highlights: highlightList.length ? highlightList : null,
    });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    router.push("/admin/gigs");
  };

  return (
    <main className="bg-white text-slate-900">
      <section className="py-16 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl font-semibold">Create New Gig</h1>
          <p className="text-slate-600 mt-2">
            Draft a listing and choose where the order should route.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6">
          <form className="grid gap-8" onSubmit={onSubmit}>
            <div className="grid gap-4">
              <label className="text-sm font-medium">Gig Name</label>
              <input
                type="text"
                placeholder="Automation Systems Blueprint"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </div>

            <div className="grid gap-4">
              <label className="text-sm font-medium">Short Description</label>
              <textarea
                rows={4}
                placeholder="Explain what the client gets and the outcomes."
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="grid gap-4">
                <label className="text-sm font-medium">Starting Price</label>
                <input
                  type="text"
                  placeholder="$1,200+"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  value={priceText}
                  onChange={(event) => setPriceText(event.target.value)}
                />
              </div>
              <div className="grid gap-4">
                <label className="text-sm font-medium">Status</label>
                <select
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="grid gap-4">
                <label className="text-sm font-medium">Order Here URL</label>
                <input
                  type="url"
                  placeholder="https://flowbridge.io/checkout/automation-blueprint"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  value={orderHereUrl}
                  onChange={(event) => setOrderHereUrl(event.target.value)}
                />
              </div>
              <div className="grid gap-4">
                <label className="text-sm font-medium">Order on Fiverr URL</label>
                <input
                  type="url"
                  placeholder="https://fiverr.com/your-gig-link"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  value={orderFiverrUrl}
                  onChange={(event) => setOrderFiverrUrl(event.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4">
              <label className="text-sm font-medium">Highlights</label>
              <input
                type="text"
                placeholder="Add 3-5 outcome bullets separated by commas"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                value={highlights}
                onChange={(event) => setHighlights(event.target.value)}
              />
            </div>

            <div className="grid gap-4">
              <label className="text-sm font-medium">Slug (auto)</label>
              <input
                type="text"
                value={slugify(title)}
                readOnly
                className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-slate-50 text-slate-500"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Gig"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
