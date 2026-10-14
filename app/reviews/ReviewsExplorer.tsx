"use client";

import { useMemo, useState } from "react";
import { getStars, type ReviewItem } from "../lib/reviewContent";

export default function ReviewsExplorer({ reviews }: { reviews: ReviewItem[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"relevant" | "recent">("relevant");
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const rows = term ? reviews.filter((review) => [review.name, review.summary, review.body].some((value) => value.toLowerCase().includes(term))) : [...reviews];
    return rows.sort((a, b) => sort === "recent" ? new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime() : b.rating - a.rating || new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
  }, [query, reviews, sort]);

  return <div>
    <div className="flex flex-col gap-5 border-b border-slate-200 pb-8 md:flex-row md:items-end md:justify-between">
      <label className="block w-full max-w-md"><span className="sr-only">Search reviews</span><div className="flex"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search reviews" className="min-w-0 flex-1 rounded-l-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900" /><span className="flex w-14 items-center justify-center rounded-r-lg bg-slate-950 text-xl text-white" aria-hidden="true">⌕</span></div></label>
      <label className="flex items-center gap-3 text-sm text-slate-500">Sort by<select value={sort} onChange={(event) => setSort(event.target.value as "relevant" | "recent")} className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-900"><option value="relevant">Most relevant</option><option value="recent">Most recent</option></select></label>
    </div>
    <div className="py-8 text-sm text-slate-500">{filtered.length ? `1–${filtered.length} out of ${reviews.length} review${reviews.length === 1 ? "" : "s"}` : `0 out of ${reviews.length} reviews`}</div>
    <div className="space-y-6">
      {!reviews.length ? <p className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">Verified client reviews will appear here after publication.</p> : null}
      {reviews.length && !filtered.length ? <p className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">No reviews match your search.</p> : null}
      {filtered.map((review) => <article key={review.id} className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
        <div className="flex items-center gap-4 border-b border-slate-200 pb-5">
          {review.avatarUrl ? <img src={review.avatarUrl} alt={`${review.name} profile`} className="h-14 w-14 shrink-0 rounded-full object-cover" /> : <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-900 text-lg font-semibold text-white">{review.name.slice(0, 1).toUpperCase()}</div>}
          <div><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-slate-950">{review.name}</p>{review.isReturningClient ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"><span aria-hidden="true">↻</span> Returning client</span> : null}</div><p className="mt-1 text-sm text-slate-500">Verified Flowbridge client</p></div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3"><span className="font-semibold text-slate-950"><span className="text-amber-500">{getStars(review.rating)}</span> {review.rating.toFixed(1)}</span>{review.date ? <><span className="text-slate-300">•</span><span className="text-sm text-slate-500">{new Date(review.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span></> : null}</div>
        <h3 className="mt-4 text-lg font-semibold">{review.summary}</h3><p className="mt-3 whitespace-pre-line leading-7 text-slate-600">{review.body}</p>
        {review.response ? <details className="mt-6 border-t border-slate-200 pt-5"><summary className="cursor-pointer font-semibold text-slate-900">Flowbridge Response</summary><p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{review.response}</p></details> : null}
      </article>)}
    </div>
  </div>;
}
