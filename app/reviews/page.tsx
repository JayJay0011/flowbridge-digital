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
  client_id: string;
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
    .select("id,client_id,rating,summary,body,video_url,seller_response,created_at,profiles(username,company_name,avatar_url)")
    .eq("status", "published")
    .order("created_at", { ascending: false });
  const dbReviews = (data ?? []) as Review[];
  const clientIds = [...new Set(dbReviews.map((review) => review.client_id).filter(Boolean))];
  const { data: paidOrders } = clientIds.length
    ? await supabaseAdmin.from("orders").select("client_id").in("client_id", clientIds).eq("payment_status", "paid")
    : { data: [] as { client_id: string | null }[] };
  const paidOrderCounts = new Map<string, number>();
  for (const order of paidOrders ?? []) {
    if (order.client_id) paidOrderCounts.set(order.client_id, (paidOrderCounts.get(order.client_id) || 0) + 1);
  }
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
        isReturningClient: (paidOrderCounts.get(review.client_id) || 0) >= 2,
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
