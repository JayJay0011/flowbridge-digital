"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import AdminImageUpload from "../../_components/AdminImageUpload";

type CaseStudyOption = {
  id: string;
  title: string;
  slug: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function AdminPortfolioNewPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [caseStudies, setCaseStudies] = useState<CaseStudyOption[]>([]);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    summary: "",
    cover_url: "",
    gallery_urls: [] as string[],
    video_urls: [] as string[],
    outcomes: "",
    case_study_slug: "",
    status: "draft",
  });

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("case_studies")
        .select("id,title,slug")
        .order("created_at", { ascending: false });
      setCaseStudies((data ?? []) as CaseStudyOption[]);
    };
    load();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const slug = form.slug.trim() || slugify(form.title);
    const outcomesList = form.outcomes
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const { data, error } = await supabase
      .from("portfolio")
      .insert({
        title: form.title.trim(),
        slug,
        summary: form.summary.trim() || null,
        cover_url: form.cover_url.trim() || null,
        gallery_urls: form.gallery_urls.length ? form.gallery_urls : null,
        video_urls: form.video_urls.length ? form.video_urls : null,
        outcomes: outcomesList.length ? outcomesList : null,
        case_study_slug: form.case_study_slug.trim() || null,
        status: form.status,
      })
      .select("id")
      .single();

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    router.push(`/admin/portfolio/${data.id}`);
  };

  return (
    <section className="max-w-3xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Portfolio
        </p>
        <h2 className="text-3xl font-semibold mt-2">New portfolio item</h2>
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
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Summary</label>
          <textarea
            value={form.summary}
            onChange={(event) => setForm({ ...form, summary: event.target.value })}
            rows={3}
            className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
          />
        </div>
        <div>
          <AdminImageUpload
            label="Cover image"
            section="portfolio/covers"
            watermark
            value={form.cover_url}
            helperText="A Flowbridge watermark is added before upload."
            onUploaded={(urls) =>
              setForm({ ...form, cover_url: urls[0] ?? "" })
            }
          />
        </div>
        <div>
          <AdminImageUpload
            label="Gallery images"
            section="portfolio/gallery"
            multiple
            watermark
            accept="image"
            helperText={
              form.gallery_urls.length
                ? `${form.gallery_urls.length} gallery image${
                    form.gallery_urls.length > 1 ? "s" : ""
                  } uploaded.`
                : "Upload extra portfolio images. A Flowbridge watermark is added before upload."
            }
            onUploaded={(urls) =>
              setForm({
                ...form,
                gallery_urls: [...form.gallery_urls, ...urls],
              })
            }
          />
        </div>
        <div>
          <AdminImageUpload
            label="Portfolio videos"
            section="portfolio/videos"
            multiple
            accept="video"
            helperText={
              form.video_urls.length
                ? `${form.video_urls.length} video file${
                    form.video_urls.length > 1 ? "s" : ""
                  } uploaded.`
                : "Upload MP4, WebM, or MOV portfolio videos. Public playback includes a Flowbridge overlay."
            }
            onUploaded={(urls) =>
              setForm({
                ...form,
                video_urls: [...form.video_urls, ...urls],
              })
            }
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Key outcomes (comma)</label>
          <input
            value={form.outcomes}
            onChange={(event) =>
              setForm({ ...form, outcomes: event.target.value })
            }
            className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Linked case study</label>
          <select
            value={form.case_study_slug}
            onChange={(event) =>
              setForm({ ...form, case_study_slug: event.target.value })
            }
            className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
          >
            <option value="">No linked case study</option>
            {caseStudies.map((item) => (
              <option key={item.id} value={item.slug}>
                {item.title}
              </option>
            ))}
          </select>
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
            <option value="published">Published</option>
          </select>
        </div>
        {message && <p className="text-sm text-red-600">{message}</p>}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold"
          >
            {saving ? "Saving..." : "Create portfolio item"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/portfolio")}
            className="text-sm font-semibold text-slate-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
