"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Related<T> = T | T[] | null;

type Review = {
  id: string;
  rating: number;
  summary: string | null;
  body: string | null;
  improvement_feedback: string | null;
  seller_response: string | null;
  status: "pending" | "published" | "hidden";
  created_at: string;
  profiles: Related<{ username: string | null; email: string | null }>;
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select(
          "id,rating,summary,body,improvement_feedback,seller_response,status,created_at,profiles(username,email)"
        )
        .order("created_at", { ascending: false });

      if (!isMounted) return;
      if (error) {
        setMessage(error.message);
      } else {
        const rows = (data ?? []) as Review[];
        setReviews(rows);
        setResponses(
          Object.fromEntries(
            rows.map((review) => [review.id, review.seller_response || ""])
          )
        );
      }
      setLoading(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const saveReview = async (
    reviewId: string,
    status: "pending" | "published" | "hidden"
  ) => {
    setMessage(null);
    const sellerResponse = responses[reviewId]?.trim() || null;
    const { error } = await supabase
      .from("reviews")
      .update({ status, seller_response: sellerResponse })
      .eq("id", reviewId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setReviews((current) =>
      current.map((review) =>
        review.id === reviewId
          ? { ...review, status, seller_response: sellerResponse }
          : review
      )
    );
    setMessage("Review updated.");
  };

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Reviews</h1>
        <p className="mt-2 text-slate-600">
          Approve submitted feedback and publish a Flowbridge response.
        </p>
      </div>

      {message ? <p className="text-sm text-slate-600">{message}</p> : null}

      {loading ? (
        <p className="text-slate-500">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
          No reviews submitted yet.
        </p>
      ) : (
        <div className="grid gap-6">
          {reviews.map((review) => {
            const profile = Array.isArray(review.profiles)
              ? review.profiles[0]
              : review.profiles;

            return (
              <article
                key={review.id}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {profile?.username || profile?.email || "Account"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(review.created_at).toLocaleDateString()} ·{" "}
                      {review.rating}/5 stars
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {review.status}
                  </span>
                </div>
                <h2 className="mt-5 text-lg font-semibold">
                  {review.summary || "Review"}
                </h2>
                <p className="mt-2 leading-7 text-slate-600">{review.body}</p>
                {review.improvement_feedback ? (
                  <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-950">
                    <p className="font-semibold">Private improvement request</p>
                    <p className="mt-2 leading-6">{review.improvement_feedback}</p>
                  </div>
                ) : null}
                <label className="mt-5 block text-sm font-semibold">
                  Public response
                </label>
                <textarea
                  rows={3}
                  value={responses[review.id] || ""}
                  onChange={(event) =>
                    setResponses((current) => ({
                      ...current,
                      [review.id]: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
                  placeholder="Reply to this review..."
                />
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => saveReview(review.id, "published")}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Publish
                  </button>
                  <button
                    type="button"
                    onClick={() => saveReview(review.id, "hidden")}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold"
                  >
                    Hide
                  </button>
                  <button
                    type="button"
                    onClick={() => saveReview(review.id, "pending")}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold"
                  >
                    Keep pending
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
