import Link from "next/link";
import { supabasePublic } from "../lib/supabasePublic";

export const revalidate = 0;
export const metadata = {
  title: "Service Gigs",
  description:
    "Explore Flowbridge Digital service gigs for automation, CRM, growth infrastructure, and operations.",
};

type PageProps = {
  searchParams?: { q?: string };
};

export default async function GigsPage({ searchParams }: PageProps) {
  const query = searchParams?.q?.trim() || "";

  let request = supabasePublic
    .from("gigs")
    .select("id,title,slug,summary,price_text")
    .order("created_at", { ascending: false });

  if (query) {
    request = request.or(
      `title.ilike.%${query}%,summary.ilike.%${query}%`
    );
  }

  const { data: gigs } = await request;

  return (
    <main className="bg-[var(--background)] text-[var(--foreground)]">
      <section className="py-20 bg-slate-950 text-white">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <p className="uppercase tracking-[0.3em] text-xs text-slate-300">
            Service Gigs
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold mt-6">
            Pick a structured engagement and move with clarity.
          </h1>
          <p className="text-xl text-slate-200 max-w-3xl mt-6">
            Choose a structured engagement designed to rebuild your systems,
            automation, or growth infrastructure.
          </p>
        </div>
      </section>

      <section className="py-10 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <form action="/gigs" method="get" className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search for a service or keyword..."
              className="flex-1 border border-slate-300 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
            >
              Search
            </button>
          </form>
          {query ? (
            <p className="mt-4 text-sm text-slate-600">
              Showing results for “{query}”
            </p>
          ) : null}
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 md:px-6 grid md:grid-cols-3 gap-6">
          {gigs?.length ? (
            gigs.map((gig) => (
            <Link
              key={gig.id}
              href={`/gigs/${gig.slug}`}
              className="border border-slate-200 rounded-2xl p-6 bg-white hover:shadow-md transition"
            >
              <h2 className="text-xl font-semibold">{gig.title}</h2>
              <p className="mt-4 text-slate-600">{gig.summary}</p>
              <p className="mt-6 text-sm font-medium text-slate-900">
                {gig.price_text || "Starting at custom scope"}
              </p>
              <div className="mt-6 text-sm font-medium text-slate-900">
                View Details →
              </div>
            </Link>
            ))
          ) : (
            <div className="border border-slate-200 rounded-2xl p-6 bg-white text-slate-600">
              Gigs will appear here once published.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
