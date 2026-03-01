"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

type ServiceItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
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
      const { data } = await supabase
        .from("services")
        .select("id,title,slug,description,status")
        .eq("id", params.id)
        .single();
      setService(data as ServiceItem);
    };
    load();
  }, [params.id]);

  const handleSave = async () => {
    if (!service) return;
    setSaving(true);
    setMessage(null);
    const { error } = await supabase
      .from("services")
      .update({
        title: service.title.trim(),
        slug: service.slug.trim(),
        description: service.description?.trim() || null,
        status: service.status,
      })
      .eq("id", service.id);

    if (error) {
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
