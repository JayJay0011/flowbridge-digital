"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function AdminServiceNewPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
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
      .from("services")
      .insert({
        title: form.title.trim(),
        slug,
        description: form.description.trim() || null,
        status: form.status,
      })
      .select("id")
      .single();

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    router.push(`/admin/services/${data.id}`);
  };

  return (
    <section className="max-w-3xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Services
        </p>
        <h2 className="text-3xl font-semibold mt-2">New service</h2>
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
            placeholder="crm-pipeline"
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Description</label>
          <textarea
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
            rows={4}
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
            {saving ? "Saving..." : "Create service"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/services")}
            className="text-sm font-semibold text-slate-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
