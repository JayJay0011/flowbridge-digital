import Link from "next/link";
import { fallbackReviews, getStars, type ReviewItem } from "../lib/reviewContent";

export default function ReviewsPreview({
  reviews = fallbackReviews,
}: {
  reviews?: ReviewItem[];
}) {
  const visibleReviews = reviews.length ? reviews.slice(0, 5) : fallbackReviews;

  return (
    <section className="overflow-hidden bg-slate-950 py-24 text-white">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold md:text-4xl">
              What people say about the work
            </h2>
            <p className="mt-4 max-w-2xl text-slate-300">
              Feedback on structure, communication, and the systems that make
              operations easier to manage.
            </p>
          </div>
          <Link
            href="/reviews"
            className="inline-flex w-fit rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            See more reviews
          </Link>
        </div>

        <div className="mt-12 flex gap-5 overflow-hidden">
          <div className="flex min-w-full animate-review-scroll gap-5">
            {[...visibleReviews, ...visibleReviews].map((review, index) => (
              <article
                key={`${review.id}-${index}`}
                className="w-[320px] shrink-0 rounded-2xl border border-white/10 bg-white/10 p-6"
              >
                <div className="text-sm text-amber-300">
                  {getStars(review.rating)}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{review.summary}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {review.body}
                </p>
                <div className="mt-5 border-t border-white/10 pt-4">
                  <p className="text-sm font-semibold">{review.name}</p>
                  <p className="text-xs text-slate-400">{review.company}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
