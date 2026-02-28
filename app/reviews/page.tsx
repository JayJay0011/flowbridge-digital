import { supabasePublic } from "../lib/supabasePublic";

export const metadata = {
  title: "Reviews",
  description:
    "Client reviews and outcomes from Flowbridge Digital engagements.",
};

export const revalidate = 0;

type Related<T> = T | T[] | null;

type Review = {
  id: string;
  rating: number | null;
  summary: string | null;
  body: string | null;
  created_at: string;
  profiles: Related<{ username: string | null }>;
};

export default async function ReviewsPage() {
  const { data } = await supabasePublic
    .from("reviews")
    .select("id,rating,summary,body,created_at,profiles(username)")
    .order("created_at", { ascending: false });
  const reviews = (data ?? []) as Review[];

  return (
    <main className="bg-[var(--background)] text-[var(--foreground)]">
      <section className="py-24 bg-slate-950 text-white">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <p className="uppercase tracking-[0.3em] text-xs text-slate-300">
            Reviews
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold mt-6">
            Client feedback, real outcomes.
          </h1>
          <p className="text-xl text-slate-200 mt-6 max-w-3xl">
            Proof of execution quality, clarity, and communication.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-8">
          {reviews?.length ? (
            reviews.map((review) => (
              <div
                key={review.id}
                className="border border-slate-200 rounded-2xl p-6 bg-white"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-500">
                    {(Array.isArray(review.profiles)
                      ? review.profiles[0]?.username
                      : review.profiles?.username) || "Client"}
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {"★".repeat(review.rating || 0)}
                  </div>
                </div>
                <h3 className="text-lg font-semibold mt-4">
                  {review.summary}
                </h3>
                <p className="text-slate-600 mt-3">{review.body}</p>
              </div>
            ))
          ) : (
            <div className="border border-slate-200 rounded-2xl p-6 text-slate-500">
              Reviews will appear here after completed projects.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
