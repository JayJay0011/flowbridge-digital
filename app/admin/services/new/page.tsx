"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import AdminImageUpload from "../../_components/AdminImageUpload";
import ServiceSectionBuilder, {
  sanitizeServiceSections,
  type EditableServiceSection,
} from "../ServiceSectionBuilder";
import { useAdminDraft } from "../../_components/useAdminDraft";

export default function AdminServiceNewPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    cover_url: "",
    cta_label: "",
    cta_url: "",
    status: "draft",
    content_sections: [] as EditableServiceSection[],
  });
  const { clearDraft, status: draftStatus } = useAdminDraft({
    storageKey: "flowbridge-admin-draft-service-new",
    value: form,
    onRestore: setForm,
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

    const payload = {
      title: form.title.trim(),
      slug,
      description: form.description.trim() || null,
      cover_url: form.cover_url.trim() || null,
      cta_label: form.cta_label.trim() || null,
      cta_url: form.cta_url.trim() || null,
      content_sections: sanitizeServiceSections(form.content_sections),
      status: form.status,
    };

    const { data, error } = await supabase
      .from("services")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      if (
        ["cover_url", "cta_label", "cta_url", "content_sections"].some((field) =>
          error.message.includes(field)
        )
      ) {
        const payloadWithoutCover = {
          title: payload.title,
          slug: payload.slug,
          description: payload.description,
          status: payload.status,
        };
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("services")
          .insert(payloadWithoutCover)
          .select("id")
          .single();

        if (!fallbackError) {
          clearDraft();
          router.push(`/admin/services/${fallbackData.id}`);
          return;
        }
      }
      setMessage(error.message);
      setSaving(false);
      return;
    }

    clearDraft();
    router.push(`/admin/services/${data.id}`);
  };

  return (
    <section className="max-w-5xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Services
        </p>
        <h2 className="text-3xl font-semibold mt-2">New service</h2>
        {draftStatus !== "idle" ? (
          <p className="mt-2 text-xs font-semibold text-slate-500">
            {draftStatus === "restored" ? "Autosaved draft restored." : "Draft autosaved."}
          </p>
        ) : null}
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
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold">CTA label</label>
            <input
              value={form.cta_label}
              onChange={(event) =>
                setForm({ ...form, cta_label: event.target.value })
              }
              className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
              placeholder="Book a Strategy Call"
            />
          </div>
          <div>
            <label className="text-sm font-semibold">CTA URL</label>
            <input
              value={form.cta_url}
              onChange={(event) =>
                setForm({ ...form, cta_url: event.target.value })
              }
              className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
              placeholder="https://cal.com/..."
            />
          </div>
        </div>
        <div>
          <AdminImageUpload
            label="Service image"
            section="services/covers"
            value={form.cover_url}
            helperText="Upload a JPG, PNG, or WebP image instead of pasting a URL."
            onUploaded={(urls) =>
              setForm({ ...form, cover_url: urls[0] ?? "" })
            }
          />
        </div>
        <ServiceSectionBuilder
          value={form.content_sections}
          onChange={(content_sections) =>
            setForm({ ...form, content_sections })
          }
        />
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
