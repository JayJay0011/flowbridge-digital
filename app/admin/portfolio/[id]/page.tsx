"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

type CaseStudyOption = {
  id: string;
  title: string;
  slug: string;
};

type PortfolioRecord = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  cover_url: string | null;
  outcomes: string[] | null;
  case_study_slug: string | null;
  status: "draft" | "published";
};

export default function AdminPortfolioEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [item, setItem] = useState<PortfolioRecord | null>(null);
  const [caseStudies, setCaseStudies] = useState<CaseStudyOption[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("portfolio")
        .select("id,title,slug,summary,cover_url,outcomes,case_study_slug,status")
        .eq("id", params.id)
        .single();
      setItem(data as PortfolioRecord);

      const { data: caseData } = await supabase
        .from("case_studies")
        .select("id,title,slug")
        .order("created_at", { ascending: false });
      setCaseStudies((caseData ?? []) as CaseStudyOption[]);
    };
    load();
  }, [params.id]);

  const outcomesText = useMemo(
    () => item?.outcomes?.join(", ") || "",
    [item?.outcomes]
  );

  const handleSave = async () => {
    if (!item) return;
    setSaving(true);
    setMessage(null);

    const payload = {
      title: item.title.trim(),
      slug: item.slug.trim(),
      summary: item.summary?.trim() || null,
      cover_url: item.cover_url?.trim() || null,
      outcomes: outcomesText
        ? outcomesText
            .split(",")
            .map((entry) => entry.trim())
            .filter(Boolean)
        : null,
      case_study_slug: item.case_study_slug?.trim() || null,
      status: item.status,
    };

    const { error } = await supabase
      .from("portfolio")
      .update(payload)
      .eq("id", item.id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Changes saved.");
    }
    setSaving(false);
  };

  if (!item) {
    return <div className="text-slate-500">Loading portfolio...</div>;
  }

  return (
    <section className="space-y-8 max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Portfolio
          </p>
          <h2 className="text-3xl font-semibold mt-2">{item.title}</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(`/portfolio/${item.slug}`)}
            className="text-sm font-semibold text-slate-600"
          >
            Preview
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/portfolio")}
            className="text-sm font-semibold text-slate-600"
          >
            Back to portfolio
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
        <div>
          <label className="text-sm font-semibold">Title</label>
          <input
            value={item.title}
            onChange={(event) => setItem({ ...item, title: event.target.value })}
            className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Slug</label>
          <input
            value={item.slug}
            onChange={(event) => setItem({ ...item, slug: event.target.value })}
            className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Summary</label>
          <textarea
            value={item.summary ?? ""}
            onChange={(event) => setItem({ ...item, summary: event.target.value })}
            rows={3}
            className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Cover image URL</label>
          <input
            value={item.cover_url ?? ""}
            onChange={(event) =>
              setItem({ ...item, cover_url: event.target.value })
            }
            className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Key outcomes (comma)</label>
          <input
            value={outcomesText}
            onChange={(event) =>
              setItem({
                ...item,
                outcomes: event.target.value
                  .split(",")
                  .map((entry) => entry.trim()),
              })
            }
            className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Linked case study</label>
          <select
            value={item.case_study_slug ?? ""}
            onChange={(event) =>
              setItem({ ...item, case_study_slug: event.target.value || null })
            }
            className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
          >
            <option value="">No linked case study</option>
            {caseStudies.map((caseStudy) => (
              <option key={caseStudy.id} value={caseStudy.slug}>
                {caseStudy.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold">Status</label>
          <select
            value={item.status}
            onChange={(event) =>
              setItem({
                ...item,
                status: event.target.value as PortfolioRecord["status"],
              })
            }
            className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
        {message && <p className="text-sm text-emerald-600">{message}</p>}
      </div>
    </section>
  );
}
