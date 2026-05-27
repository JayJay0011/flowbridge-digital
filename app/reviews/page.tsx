import { supabasePublic } from "../lib/supabasePublic";
import { fallbackReviews, getStars, type ReviewItem } from "../lib/reviewContent";

export const metadata = {
  title: "Reviews",
  description:
    "Reviews and outcomes from Flowbridge Digital engagements.",
};

export const revalidate = 0;

type Related<T> = T | T[] | null;

type Review = {
  id: string;
  rating: number | null;
  summary: string | null;
  body: string | null;
  video_url: string | null;
  seller_response: string | null;
  created_at: string;
  profiles: Related<{ username: string | null }>;
};

export default async function ReviewsPage() {
  const { data } = await supabasePublic
    .from("reviews")
    .select("id,rating,summary,body,video_url,seller_response,created_at,profiles(username)")
    .order("created_at", { ascending: false });
  const dbReviews = (data ?? []) as Review[];
  const reviews: ReviewItem[] = dbReviews.length
    ? dbReviews.map((review) => ({
        id: review.id,
        name:
          (Array.isArray(review.profiles)
            ? review.profiles[0]?.username
            : review.profiles?.username) || "Flowbridge customer",
        company: "Verified review",
        rating: review.rating || 5,
        summary: review.summary || "Great experience",
        body: review.body || "",
        videoUrl: review.video_url,
        response: review.seller_response,
      }))
    : fallbackReviews;

  return (
    <main className="bg-white text-slate-900">
      <section className="py-24 bg-slate-950 text-white">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <p className="uppercase tracking-[0.3em] text-xs text-slate-300">
            Reviews
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold mt-6">
            Feedback, outcomes, and proof of clear execution.
          </h1>
          <p className="text-xl text-slate-200 mt-6 max-w-3xl">
            Written and video feedback from people who trusted Flowbridge with
            their systems, CRM, and operations.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                {review.videoUrl ? (
                  <div className="mb-6 aspect-video overflow-hidden rounded-xl bg-slate-100">
                    <iframe
                      src={review.videoUrl}
                      className="h-full w-full"
                      allowFullScreen
                    />
                  </div>
                ) : null}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold">{review.name}</p>
                    <p className="text-xs text-slate-500">{review.company}</p>
                  </div>
                  <div className="text-sm text-amber-500">
                    {getStars(review.rating)}
                  </div>
                </div>
                <h3 className="mt-5 text-xl font-semibold">{review.summary}</h3>
                <p className="mt-3 leading-7 text-slate-600">{review.body}</p>
                {review.response ? (
                  <div className="mt-5 rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Response from Flowbridge
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {review.response}
                    </p>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
