"use client";

import { useState, type FormEvent } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function DashboardReviewsPage() {
  const [rating, setRating] = useState(5);
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user.id;
    if (!userId) {
      setMessage("Please sign in again to submit a review.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("reviews").insert({
      client_id: userId,
      rating,
      summary: summary.trim(),
      body: body.trim(),
      video_url: videoUrl.trim() || null,
      status: "pending",
    });

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    setSummary("");
    setBody("");
    setVideoUrl("");
    setRating(5);
    setMessage("Review submitted. Thank you.");
    setSaving(false);
  };

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold">Write a review</h2>
        <p className="mt-2 text-[var(--dash-muted)]">
          Share written feedback or add a video review link. Reviews are checked
          before they appear publicly.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid max-w-2xl gap-6">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Rating</label>
          <select
            value={rating}
            onChange={(event) => setRating(Number(event.target.value))}
            className="rounded-xl border border-[var(--dash-border)] bg-transparent px-4 py-3"
          >
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {value} star{value === 1 ? "" : "s"}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Short headline</label>
          <input
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            required
            className="rounded-xl border border-[var(--dash-border)] bg-transparent px-4 py-3"
            placeholder="What changed after working together?"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Review</label>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            required
            rows={6}
            className="rounded-xl border border-[var(--dash-border)] bg-transparent px-4 py-3"
            placeholder="Tell us what worked well, what improved, and what stood out."
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Video review link</label>
          <input
            value={videoUrl}
            onChange={(event) => setVideoUrl(event.target.value)}
            className="rounded-xl border border-[var(--dash-border)] bg-transparent px-4 py-3"
            placeholder="YouTube, Loom, Google Drive, or testimonial video URL"
          />
          <p className="text-xs text-[var(--dash-muted)]">
            For uploaded videos, send them to Flowbridge and they can be added
            from admin later.
          </p>
        </div>

        {message ? (
          <p className="text-sm text-[var(--dash-muted)]">{message}</p>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          {saving ? "Submitting..." : "Submit review"}
        </button>
      </form>
    </section>
  );
}
