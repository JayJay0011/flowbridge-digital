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

export default function NewPortfolioPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState("draft");
  const [outcomes, setOutcomes] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const slug = slugify(title);
    const outcomesList = outcomes
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const { error: insertError } = await supabase.from("portfolio").insert({
      title,
      slug,
      summary,
      status,
      cover_url: coverUrl || null,
      outcomes: outcomesList.length ? outcomesList : null,
    });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    router.push("/admin/portfolio");
  };

  return (
    <main className="bg-[var(--background)] text-[var(--foreground)]">
      <section className="py-16 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <h1 className="text-3xl font-semibold">Create Portfolio Item</h1>
          <p className="text-slate-600 mt-2">
            Add a case highlight with outcomes and a cover image.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <form className="grid gap-8" onSubmit={onSubmit}>
            <div className="grid gap-4">
              <label className="text-sm font-medium">Title</label>
              <input
                type="text"
                placeholder="Medspa CRM Rebuild"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </div>

            <div className="grid gap-4">
              <label className="text-sm font-medium">Summary</label>
              <textarea
                rows={4}
                placeholder="Explain the system change and impact."
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
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
              <div className="grid gap-4">
                <label className="text-sm font-medium">Cover Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  value={coverUrl}
                  onChange={(event) => setCoverUrl(event.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4">
              <label className="text-sm font-medium">Outcomes</label>
              <input
                type="text"
                placeholder="Add 3-5 outcomes separated by commas"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                value={outcomes}
                onChange={(event) => setOutcomes(event.target.value)}
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

            {error && <div className="text-sm text-red-600">{error}</div>}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Portfolio"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
