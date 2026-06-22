"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import AdminImageUpload from "../../_components/AdminImageUpload";

type CaseStudy = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  industry: string | null;
  cover_url: string | null;
  gallery_urls: string[] | null;
  content_sections: unknown[] | null;
  results: string[] | null;
  body: string | null;
  status: "draft" | "published";
};

export default function AdminCaseStudyEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [study, setStudy] = useState<CaseStudy | null>(null);
  const [sectionsText, setSectionsText] = useState("[]");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("case_studies")
        .select("id,title,slug,summary,industry,cover_url,gallery_urls,content_sections,results,body,status")
        .eq("id", params.id)
        .single();
      setStudy(data as CaseStudy);
      setSectionsText(
        JSON.stringify((data as CaseStudy | null)?.content_sections ?? [], null, 2)
      );
    };
    load();
  }, [params.id]);

  const handleSave = async () => {
    if (!study) return;
    setSaving(true);
    setMessage(null);
    let parsedSections: unknown[] | null = null;
    try {
      const parsed = JSON.parse(sectionsText || "[]");
      if (!Array.isArray(parsed)) {
        throw new Error("Case-study sections must be a JSON array.");
      }
      parsedSections = parsed.length ? parsed : null;
    } catch (parseError) {
      setMessage(
        parseError instanceof Error
          ? parseError.message
          : "Case-study sections must be valid JSON."
      );
      setSaving(false);
      return;
    }
    const { error } = await supabase
      .from("case_studies")
      .update({
        title: study.title.trim(),
        slug: study.slug.trim(),
        summary: study.summary?.trim() || null,
        industry: study.industry?.trim() || null,
        cover_url: study.cover_url?.trim() || null,
        gallery_urls: study.gallery_urls?.length ? study.gallery_urls : null,
        content_sections: parsedSections,
        results: study.results ?? null,
        body: study.body?.trim() || null,
        status: study.status,
      })
      .eq("id", study.id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Changes saved.");
    }
    setSaving(false);
  };

  if (!study) {
    return <div className="text-slate-500">Loading case study...</div>;
  }

  return (
    <section className="max-w-3xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Case Studies
          </p>
          <h2 className="text-3xl font-semibold mt-2">Edit case study</h2>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/case-studies/${study.slug}`)}
          className="text-sm font-semibold text-slate-600"
        >
          View live
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <label className="text-sm font-semibold">Title</label>
          <input
            value={study.title}
            onChange={(event) =>
              setStudy({ ...study, title: event.target.value })
            }
            className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Slug</label>
          <input
            value={study.slug}
            onChange={(event) =>
              setStudy({ ...study, slug: event.target.value })
            }
            className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Summary</label>
          <textarea
            value={study.summary ?? ""}
            onChange={(event) =>
              setStudy({ ...study, summary: event.target.value })
            }
            rows={3}
            className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold">Industry</label>
            <input
              value={study.industry ?? ""}
              onChange={(event) =>
                setStudy({ ...study, industry: event.target.value })
              }
              className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
            />
          </div>
          <AdminImageUpload
            label="Cover image"
            section="case-studies/covers"
            watermark
            value={study.cover_url ?? ""}
            helperText="A Flowbridge watermark is added before upload."
            onUploaded={(urls) =>
              setStudy({ ...study, cover_url: urls[0] ?? study.cover_url })
            }
          />
        </div>
        <div>
          <AdminImageUpload
            label="Gallery images"
            section="case-studies/gallery"
            multiple
            watermark
            accept="image"
            helperText={
              study.gallery_urls?.length
                ? `${study.gallery_urls.length} gallery image${
                    study.gallery_urls.length > 1 ? "s" : ""
                  } uploaded.`
                : "Upload supporting case-study images. A Flowbridge watermark is added before upload."
            }
            onUploaded={(urls) =>
              setStudy({
                ...study,
                gallery_urls: [...(study.gallery_urls ?? []), ...urls],
              })
            }
          />
          {study.gallery_urls?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {study.gallery_urls.map((url, index) => (
                <button
                  key={`${url}-${index}`}
                  type="button"
                  onClick={() =>
                    setStudy({
                      ...study,
                      gallery_urls:
                        study.gallery_urls?.filter((entry) => entry !== url) ??
                        [],
                    })
                  }
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                >
                  Remove image {index + 1}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div>
          <label className="text-sm font-semibold">Results (comma)</label>
          <input
            value={(study.results ?? []).join(", ")}
            onChange={(event) =>
              setStudy({
                ...study,
                results: event.target.value
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean),
              })
            }
            className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Body</label>
          <textarea
            value={study.body ?? ""}
            onChange={(event) =>
              setStudy({ ...study, body: event.target.value })
            }
            rows={10}
            className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Detail sections JSON</label>
          <textarea
            value={sectionsText}
            onChange={(event) => setSectionsText(event.target.value)}
            rows={14}
            className="w-full mt-2 font-mono text-sm border border-slate-200 rounded-xl px-4 py-3"
          />
          <p className="mt-2 text-xs text-slate-500">
            These sections power the detailed public case-study page.
          </p>
        </div>
        <div>
          <label className="text-sm font-semibold">Status</label>
          <select
            value={study.status}
            onChange={(event) =>
              setStudy({
                ...study,
                status: event.target.value as CaseStudy["status"],
              })
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
            onClick={() => router.push("/admin/case-studies")}
            className="text-sm font-semibold text-slate-600"
          >
            Back to case studies
          </button>
        </div>
      </div>
    </section>
  );
}
