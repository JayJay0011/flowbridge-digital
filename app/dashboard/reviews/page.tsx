"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { supabase } from "../../lib/supabaseClient";

type Related<T> = T | T[] | null;

type CompletedOrder = {
  id: string;
  created_at: string;
  gigs: Related<{ title: string | null }>;
};

type SubmittedReview = {
  order_id: string | null;
  status: string;
};

export default function DashboardReviewsPage() {
  const [orders, setOrders] = useState<CompletedOrder[]>([]);
  const [submittedReviews, setSubmittedReviews] = useState<SubmittedReview[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [improvementFeedback, setImprovementFeedback] = useState("");
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const { data: authData } = await supabase.auth.getSession();
      const userId = authData.session?.user.id;
      if (!userId) {
        if (isMounted) {
          setMessage("Please sign in again to view review requests.");
          setLoading(false);
        }
        return;
      }

      const [{ data: completedOrders }, { data: reviews }] = await Promise.all([
        supabase
          .from("orders")
          .select("id,created_at,gigs(title)")
          .eq("status", "complete")
          .order("created_at", { ascending: false }),
        supabase
          .from("reviews")
          .select("order_id,status")
          .eq("client_id", userId),
      ]);

      if (!isMounted) return;

      const orderRows = (completedOrders ?? []) as CompletedOrder[];
      const reviewRows = (reviews ?? []) as SubmittedReview[];
      const reviewedOrderIds = new Set(
        reviewRows.map((review) => review.order_id).filter(Boolean)
      );
      const availableOrders = orderRows.filter(
        (order) => !reviewedOrderIds.has(order.id)
      );
      const requestedOrderId =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("order")
          : null;

      setOrders(availableOrders);
      setSubmittedReviews(reviewRows);
      setSelectedOrderId(
        availableOrders.some((order) => order.id === requestedOrderId)
          ? requestedOrderId || ""
          : availableOrders[0]?.id || ""
      );
      setLoading(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId),
    [orders, selectedOrderId]
  );

  const handleRatingChange = (nextRating: number) => {
    setRating(nextRating);
    if (nextRating < 4) {
      setFeedbackOpen(true);
    } else {
      setImprovementFeedback("");
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedOrderId) return;
    if (rating < 4 && !improvementFeedback.trim()) {
      setFeedbackOpen(true);
      return;
    }

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
      order_id: selectedOrderId,
      rating,
      summary: summary.trim(),
      body: body.trim(),
      video_url: videoUrl.trim() || null,
      improvement_feedback:
        rating < 4 ? improvementFeedback.trim() : null,
      status: "pending",
    });

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    setOrders((current) =>
      current.filter((order) => order.id !== selectedOrderId)
    );
    setSubmittedReviews((current) => [
      ...current,
      { order_id: selectedOrderId, status: "pending" },
    ]);
    setSelectedOrderId("");
    setSummary("");
    setBody("");
    setVideoUrl("");
    setImprovementFeedback("");
    setRating(5);
    setMessage("Review submitted for approval. Thank you for the feedback.");
    setSaving(false);
  };

  if (loading) {
    return <div className="text-[var(--dash-muted)]">Loading reviews...</div>;
  }

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold">Reviews</h2>
        <p className="mt-2 text-[var(--dash-muted)]">
          After an order is completed, you can share a rating and feedback here.
        </p>
      </div>

      {message ? (
        <p className="rounded-xl bg-[var(--dash-surface-2)] px-4 py-3 text-sm text-[var(--dash-muted)]">
          {message}
        </p>
      ) : null}

      {orders.length === 0 ? (
        <div className="max-w-2xl rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface-2)] p-6">
          <h3 className="text-lg font-semibold">No review request available</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--dash-muted)]">
            A review option appears after your order has been marked completed.
            {submittedReviews.length
              ? " Your submitted feedback is already recorded."
              : ""}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid max-w-2xl gap-6">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Completed order</label>
            <select
              value={selectedOrderId}
              onChange={(event) => setSelectedOrderId(event.target.value)}
              className="rounded-xl border border-[var(--dash-border)] bg-transparent px-4 py-3"
            >
              {orders.map((order) => {
                const gig = Array.isArray(order.gigs) ? order.gigs[0] : order.gigs;
                return (
                  <option key={order.id} value={order.id}>
                    {gig?.title || "Project"} - {order.id.slice(0, 8)}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="rounded-2xl border border-[var(--dash-border)] p-5">
            <p className="text-sm font-medium">Your rating</p>
            <div className="mt-3 flex gap-2" aria-label="Choose a rating">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleRatingChange(value)}
                  className={`text-3xl transition ${
                    value <= rating ? "text-amber-500" : "text-slate-300"
                  }`}
                  aria-label={`${value} star${value === 1 ? "" : "s"}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Short headline</label>
            <input
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              required
              className="rounded-xl border border-[var(--dash-border)] bg-transparent px-4 py-3"
              placeholder="What stood out?"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Your feedback</label>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              required
              rows={6}
              className="rounded-xl border border-[var(--dash-border)] bg-transparent px-4 py-3"
              placeholder="Tell us about the delivery and your experience."
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Video review link (optional)</label>
            <input
              value={videoUrl}
              onChange={(event) => setVideoUrl(event.target.value)}
              className="rounded-xl border border-[var(--dash-border)] bg-transparent px-4 py-3"
              placeholder="YouTube or Loom link"
            />
          </div>

          <button
            type="submit"
            disabled={saving || !selectedOrder}
            className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? "Submitting..." : "Submit review"}
          </button>
        </form>
      )}

      {feedbackOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 text-slate-900 shadow-xl"
          >
            <h3 id="feedback-title" className="text-xl font-semibold">
              What could we improve?
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              We are sorry the delivery missed the mark. Please tell us what
              went wrong and what would make this right.
            </p>
            <textarea
              value={improvementFeedback}
              onChange={(event) => setImprovementFeedback(event.target.value)}
              rows={5}
              className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3"
              placeholder="Share the issue and the improvement you need."
            />
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setRating(5);
                  setImprovementFeedback("");
                  setFeedbackOpen(false);
                }}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!improvementFeedback.trim()}
                onClick={() => setFeedbackOpen(false)}
                className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
