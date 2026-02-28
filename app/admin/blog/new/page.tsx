"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function AdminBlogNewPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    cover_url: "",
    body: "",
    status: "draft",
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const slug =
      form.slug.trim() ||
      form.title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const { data, error } = await supabase
      .from("blog_posts")
      .insert({
        title: form.title.trim(),
        slug,
        excerpt: form.excerpt.trim() || null,
        cover_url: form.cover_url.trim() || null,
        body: form.body.trim() || null,
        status: form.status,
        published_at: form.status === "published" ? new Date().toISOString() : null,
      })
      .select("id")
      .single();

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    router.push(`/admin/blog/${data.id}`);
  };

  return (
    <section className="max-w-3xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Blog
        </p>
        <h2 className="text-3xl font-semibold mt-2">New post</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-sm font-semibold">Title</label>
          <input
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
            required
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Slug (optional)</label>
          <input
            value={form.slug}
            onChange={(event) => setForm({ ...form, slug: event.target.value })}
            className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
            placeholder="automation-playbook"
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Excerpt</label>
          <textarea
            value={form.excerpt}
            onChange={(event) => setForm({ ...form, excerpt: event.target.value })}
            rows={3}
            className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Cover image URL</label>
          <input
            value={form.cover_url}
            onChange={(event) => setForm({ ...form, cover_url: event.target.value })}
            className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Body</label>
          <textarea
            value={form.body}
            onChange={(event) => setForm({ ...form, body: event.target.value })}
            rows={10}
            className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Status</label>
          <select
            value={form.status}
            onChange={(event) =>
              setForm({ ...form, status: event.target.value })
            }
            className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
          >
            <option value="draft">Draft</option>
            <option value="published">Publish now</option>
          </select>
        </div>
        {message && <p className="text-sm text-red-600">{message}</p>}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold"
          >
            {saving ? "Saving..." : "Create post"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/blog")}
            className="text-sm font-semibold text-slate-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
