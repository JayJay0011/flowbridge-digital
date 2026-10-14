import { supabaseAdmin } from "../lib/supabaseAdmin";
import type { ReviewItem } from "../lib/reviewContent";
import ReviewsExplorer from "./ReviewsExplorer";

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
  profiles: Related<{ username: string | null; company_name: string | null; avatar_url: string | null }>;
};

export default async function ReviewsPage() {
  // This is a server component. Use the server-only client so a published
  // review can include the reviewer's public profile identity without making
  // every profile row readable through the anonymous Data API.
  const { data } = await supabaseAdmin
    .from("reviews")
    .select("id,rating,summary,body,video_url,seller_response,created_at,profiles(username,company_name,avatar_url)")
    .eq("status", "published")
    .order("created_at", { ascending: false });
  const dbReviews = (data ?? []) as Review[];
  const reviews: ReviewItem[] = dbReviews.map((review) => ({
        id: review.id,
        name: (Array.isArray(review.profiles) ? review.profiles[0]?.company_name || review.profiles[0]?.username : review.profiles?.company_name || review.profiles?.username) || "Verified client",
        avatarUrl: (Array.isArray(review.profiles) ? review.profiles[0]?.avatar_url : review.profiles?.avatar_url) || null,
        company: "Verified review",
        rating: review.rating || 5,
        summary: review.summary || "Great experience",
        body: review.body || "",
        videoUrl: review.video_url,
        response: review.seller_response,
        date: review.created_at,
      }));

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
          <ReviewsExplorer reviews={reviews} />
        </div>
      </section>
    </main>
  );
}
