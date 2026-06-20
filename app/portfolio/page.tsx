import Link from "next/link";
import { supabasePublic } from "../lib/supabasePublic";

export const metadata = {
  title: "Portfolio",
  description:
    "Explore Flowbridge Digital portfolio highlights and systems transformations.",
};

export const revalidate = 0;

type PageProps = {
  searchParams?: Promise<{ page?: string }>;
};

const PORTFOLIO_PER_PAGE = 9;

function createPortfolioPageHref(page: number) {
  return page > 1 ? `/portfolio?page=${page}` : "/portfolio";
}

export default async function PortfolioPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const requestedPage = Number(resolvedSearchParams?.page ?? "1");
  const { data: items } = await supabasePublic
    .from("portfolio")
    .select("id,title,slug,summary,cover_url,case_study_slug")
    .eq("status", "published")
    .order("created_at", { ascending: false });
  const allItems = items ?? [];
  const totalPages = Math.max(1, Math.ceil(allItems.length / PORTFOLIO_PER_PAGE));
  const currentPage = Number.isFinite(requestedPage)
    ? Math.min(Math.max(1, requestedPage), totalPages)
    : 1;
  const pageStart = (currentPage - 1) * PORTFOLIO_PER_PAGE;
  const visibleItems = allItems.slice(
    pageStart,
    pageStart + PORTFOLIO_PER_PAGE
  );

  return (
    <main className="bg-white text-slate-900">
      <section className="py-24 bg-slate-950 text-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <p className="uppercase tracking-[0.3em] text-xs text-slate-300">
            Portfolio
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold mt-6">
            Proof of systems that scale.
          </h1>
          <p className="text-lg text-slate-200 max-w-3xl mt-6">
            Real projects that show how structured operations and automation
            drive clarity, control, and growth.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6 grid md:grid-cols-3 gap-8">
          {visibleItems.length ? (
            visibleItems.map((item) => {
              const href = item.case_study_slug
                ? `/case-studies/${item.case_study_slug}`
                : `/portfolio/${item.slug}`;
              return (
                <Link
                  key={item.id}
                  href={href}
                  className="border border-slate-200 rounded-2xl overflow-hidden bg-white hover:shadow-md transition"
                >
                  <div className="aspect-[4/3] bg-slate-100">
                    {item.cover_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.cover_url}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">
                        Cover image
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="text-slate-600 mt-2">{item.summary}</p>
                    <div className="mt-4 text-sm font-semibold text-slate-900">
                      {item.case_study_slug
                        ? "View case study →"
                        : "View case →"}
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="border border-slate-200 rounded-2xl p-6 text-slate-500">
              Portfolio items will appear here once published.
            </div>
          )}
        </div>
        {allItems.length > PORTFOLIO_PER_PAGE ? (
          <div className="max-w-6xl mx-auto px-4 md:px-6 mt-10 flex items-center justify-center gap-2">
            <Link
              href={createPortfolioPageHref(Math.max(1, currentPage - 1))}
              aria-disabled={currentPage === 1}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold ${
                currentPage === 1
                  ? "pointer-events-none border-slate-200 text-slate-300"
                  : "border-slate-300 text-slate-700 hover:border-slate-900"
              }`}
            >
              ←
            </Link>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <Link
                  key={page}
                  href={createPortfolioPageHref(page)}
                  className={`inline-flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm font-semibold ${
                    page === currentPage
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 text-slate-700 hover:border-slate-900"
                  }`}
                >
                  {page}
                </Link>
              )
            )}
            <Link
              href={createPortfolioPageHref(Math.min(totalPages, currentPage + 1))}
              aria-disabled={currentPage === totalPages}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold ${
                currentPage === totalPages
                  ? "pointer-events-none border-slate-200 text-slate-300"
                  : "border-slate-300 text-slate-700 hover:border-slate-900"
              }`}
            >
              →
            </Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}
