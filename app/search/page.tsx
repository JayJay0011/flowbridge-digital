import Link from "next/link";
import { supabasePublic } from "../lib/supabasePublic";

export const metadata = {
  title: "Search",
  description:
    "Search gigs, services, portfolio work, and case studies at Flowbridge Digital.",
};

type PageProps = {
  searchParams?: { q?: string };
};

export default async function SearchPage({ searchParams }: PageProps) {
  const query = searchParams?.q?.trim() || "";

  let gigsRequest = supabasePublic
    .from("gigs")
    .select("id,title,slug,summary,price_text");
  let servicesRequest = supabasePublic
    .from("services")
    .select("id,title,slug,description");
  let portfolioRequest = supabasePublic
    .from("portfolio")
    .select("id,title,slug,summary,cover_url");
  let caseStudiesRequest = supabasePublic
    .from("case_studies")
    .select("id,title,slug,summary");

  if (query) {
    const filter = `title.ilike.%${query}%,summary.ilike.%${query}%,description.ilike.%${query}%`;
    gigsRequest = gigsRequest.or(filter);
    servicesRequest = servicesRequest.or(filter);
    portfolioRequest = portfolioRequest.or(filter);
    caseStudiesRequest = caseStudiesRequest.or(filter);
  }

  const [
    { data: gigs },
    { data: services },
    { data: portfolio },
    { data: caseStudies },
  ] = await Promise.all([
    gigsRequest,
    servicesRequest,
    portfolioRequest,
    caseStudiesRequest,
  ]);

  return (
    <main className="bg-white text-slate-900">
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <h1 className="text-3xl md:text-4xl font-semibold">Search</h1>
          <p className="text-slate-600 mt-3">
            Find gigs, services, portfolio work, and case studies.
          </p>

          <form action="/search" method="get" className="mt-8 flex flex-col md:flex-row gap-4">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search across everything..."
              className="flex-1 border border-slate-300 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-12">
          <ResultSection title="Gigs">
            {gigs?.length ? (
              gigs.map((gig) => (
                <ResultCard
                  key={gig.id}
                  title={gig.title}
                  description={gig.summary}
                  href={`/gigs/${gig.slug}`}
                  meta={gig.price_text || "Custom scope"}
                />
              ))
            ) : (
              <EmptyState label="No gigs found." />
            )}
          </ResultSection>

          <ResultSection title="Services">
            {services?.length ? (
              services.map((service) => (
                <ResultCard
                  key={service.id}
                  title={service.title}
                  description={service.description}
                  href={`/services/${service.slug}`}
                />
              ))
            ) : (
              <EmptyState label="No services found." />
            )}
          </ResultSection>

          <ResultSection title="Portfolio">
            {portfolio?.length ? (
              portfolio.map((item) => (
                <ResultCard
                  key={item.id}
                  title={item.title}
                  description={item.summary}
                  href={`/portfolio/${item.slug}`}
                />
              ))
            ) : (
              <EmptyState label="No portfolio items found." />
            )}
          </ResultSection>

          <ResultSection title="Case Studies">
            {caseStudies?.length ? (
              caseStudies.map((item) => (
                <ResultCard
                  key={item.id}
                  title={item.title}
                  description={item.summary}
                  href={`/case-studies/${item.slug}`}
                />
              ))
            ) : (
              <EmptyState label="No case studies found." />
            )}
          </ResultSection>
        </div>
      </section>
    </main>
  );
}

function ResultSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">{title}</h2>
      <div className="grid md:grid-cols-2 gap-6">{children}</div>
    </div>
  );
}

function ResultCard({
  title,
  description,
  href,
  meta,
}: {
  title: string;
  description?: string | null;
  href: string;
  meta?: string;
}) {
  return (
    <Link
      href={href}
      className="border border-slate-200 rounded-2xl p-6 bg-white hover:shadow-md transition"
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      {description ? <p className="text-slate-600 mt-2">{description}</p> : null}
      {meta ? (
        <p className="text-sm font-medium text-slate-900 mt-4">{meta}</p>
      ) : null}
      <div className="mt-4 text-sm font-semibold text-slate-900">
        View details →
      </div>
    </Link>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="border border-slate-200 rounded-2xl p-6 text-slate-500">
      {label}
    </div>
  );
}
