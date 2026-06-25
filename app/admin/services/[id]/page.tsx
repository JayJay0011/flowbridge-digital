"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import AdminImageUpload from "../../_components/AdminImageUpload";

type ServiceItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
  status: "draft" | "published";
};

export default function AdminServiceEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [service, setService] = useState<ServiceItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("services")
        .select("id,title,slug,description,cover_url,cta_label,cta_url,status")
        .eq("id", params.id)
        .single();

      if (error) {
        const { data: fallbackData } = await supabase
          .from("services")
          .select("id,title,slug,description,status")
          .eq("id", params.id)
          .single();

        const fallbackService = fallbackData
          ? ({
              ...fallbackData,
              cover_url: null,
              cta_label: null,
              cta_url: null,
            } as ServiceItem)
          : null;
        setService(fallbackService);
        return;
      }

      setService(data as ServiceItem);
    };
    load();
  }, [params.id]);

  const handleSave = async () => {
    if (!service) return;
    setSaving(true);
    setMessage(null);

    const payload = {
      title: service.title.trim(),
      slug: service.slug.trim(),
      description: service.description?.trim() || null,
      cover_url: service.cover_url?.trim() || null,
      cta_label: service.cta_label?.trim() || null,
      cta_url: service.cta_url?.trim() || null,
      status: service.status,
    };

    const { error } = await supabase
      .from("services")
      .update(payload)
      .eq("id", service.id);

    if (error) {
      if (error.message.includes("cover_url")) {
        const payloadWithoutCover = {
          title: payload.title,
          slug: payload.slug,
          description: payload.description,
          status: payload.status,
        };
        const { error: fallbackError } = await supabase
          .from("services")
          .update(payloadWithoutCover)
          .eq("id", service.id);

        if (!fallbackError) {
          setMessage(
            "Changes saved. Run the service image migration before saving service images."
          );
          setSaving(false);
          return;
        }
      }
      setMessage(error.message);
    } else {
      setMessage("Changes saved.");
    }
    setSaving(false);
  };

  if (!service) {
    return <div className="text-slate-500">Loading service...</div>;
  }

  return (
    <section className="max-w-3xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Services
          </p>
          <h2 className="text-3xl font-semibold mt-2">Edit service</h2>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/services/${service.slug}`)}
          className="text-sm font-semibold text-slate-600"
        >
          View live
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <label className="text-sm font-semibold">Title</label>
          <input
            value={service.title}
            onChange={(event) =>
              setService({ ...service, title: event.target.value })
            }
            className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Slug</label>
          <input
            value={service.slug}
            onChange={(event) =>
              setService({ ...service, slug: event.target.value })
            }
            className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Description</label>
          <textarea
            value={service.description ?? ""}
            onChange={(event) =>
              setService({ ...service, description: event.target.value })
            }
            rows={4}
            className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold">CTA label</label>
            <input
              value={service.cta_label ?? ""}
              onChange={(event) =>
                setService({ ...service, cta_label: event.target.value })
              }
              placeholder="Book a Strategy Call"
              className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
            />
          </div>
          <div>
            <label className="text-sm font-semibold">CTA URL</label>
            <input
              value={service.cta_url ?? ""}
              onChange={(event) =>
                setService({ ...service, cta_url: event.target.value })
              }
              placeholder="https://cal.com/..."
              className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
            />
          </div>
        </div>
        <div>
          <AdminImageUpload
            label="Service image"
            section="services/covers"
            value={service.cover_url}
            helperText="Upload a JPG, PNG, or WebP image instead of pasting a URL."
            onUploaded={(urls) =>
              setService({
                ...service,
                cover_url: urls[0] ?? service.cover_url,
              })
            }
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Status</label>
          <select
            value={service.status}
            onChange={(event) =>
              setService({ ...service, status: event.target.value as ServiceItem["status"] })
            }
            className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        {message && <p className="text-sm text-emerald-600">{message}</p>}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/services")}
            className="text-sm font-semibold text-slate-600"
          >
            Back to services
          </button>
        </div>
      </div>
    </section>
  );
}
