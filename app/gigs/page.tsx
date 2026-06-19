import Link from "next/link";
import { supabasePublic } from "../lib/supabasePublic";
import { gigCategories, getGigCategoryLabel } from "../lib/gigCategories";

export const revalidate = 0;
export const metadata = {
  title: "Service Gigs",
  description:
    "Explore Flowbridge Digital service gigs for automation, CRM, growth infrastructure, and operations.",
};

type PageProps = {
  searchParams?: { q?: string; category?: string; page?: string };
};

const GIGS_PER_PAGE = 9;

export default async function GigsPage({ searchParams }: PageProps) {
  const query = searchParams?.q?.trim() || "";
  const selectedCategory = searchParams?.category?.trim() || "";
  const requestedPage = Number(searchParams?.page ?? "1");

  const baseColumns =
    "id,title,slug,summary,price_text,package_basic,cover_url,status";
  const { data, error } = await supabasePublic
    .from("gigs")
    .select(`${baseColumns},category_slugs`)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const { data: fallbackData } = error?.message.includes("category_slugs")
    ? await supabasePublic
        .from("gigs")
        .select(baseColumns)
        .eq("status", "published")
        .order("created_at", { ascending: false })
    : { data: null };

  const rawGigs = data ?? fallbackData ?? [];
  const normalizedQuery = query.toLowerCase();
  const selectedCategoryConfig = gigCategories.find(
    (category) => category.slug === selectedCategory
  );
  const gigs = rawGigs.filter((gig) => {
    const categorySlugs =
      "category_slugs" in gig && Array.isArray(gig.category_slugs)
        ? gig.category_slugs
        : [];
    const matchesCategory =
      !selectedCategory || categorySlugs.includes(selectedCategory);

    if (!matchesCategory) return false;
    if (!normalizedQuery) return true;

    const packageBasic = gig.package_basic as
      | { title?: string; description?: string; features?: string[] }
      | null;
    const categoryKeywords = categorySlugs
      .flatMap(
        (slug) =>
          gigCategories.find((category) => category.slug === slug)?.keywords ??
          []
      )
      .join(" ");
    const searchText = [
      gig.title,
      gig.summary,
      gig.price_text,
      packageBasic?.title,
      packageBasic?.description,
      ...(packageBasic?.features ?? []),
      categorySlugs.map(getGigCategoryLabel).join(" "),
      categoryKeywords,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      searchText.includes(normalizedQuery) ||
      selectedCategoryConfig?.keywords.some((keyword) =>
        keyword.includes(normalizedQuery)
      )
    );
  });
  const totalPages = Math.max(1, Math.ceil(gigs.length / GIGS_PER_PAGE));
  const currentPage = Number.isFinite(requestedPage)
    ? Math.min(Math.max(1, requestedPage), totalPages)
    : 1;
  const pageStart = (currentPage - 1) * GIGS_PER_PAGE;
  const visibleGigs = gigs.slice(pageStart, pageStart + GIGS_PER_PAGE);
  const createPageHref = (page: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (selectedCategory) params.set("category", selectedCategory);
    if (page > 1) params.set("page", String(page));
    const queryString = params.toString();
    return queryString ? `/gigs?${queryString}` : "/gigs";
  };

  return (
    <main className="bg-white text-slate-900">
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
              placeholder="Search by keyword, platform, or service..."
              className="flex-1 border border-slate-300 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <select
              name="category"
              defaultValue={selectedCategory}
              className="md:w-64 border border-slate-300 rounded-xl px-5 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="">All categories</option>
              {gigCategories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.label}
                </option>
              ))}
            </select>
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
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href={query ? `/gigs?q=${encodeURIComponent(query)}` : "/gigs"}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                selectedCategory
                  ? "border-slate-200 text-slate-600 hover:border-slate-400"
                  : "border-slate-900 bg-slate-900 text-white"
              }`}
            >
              All
            </Link>
            {gigCategories.map((category) => {
              const params = new URLSearchParams();
              if (query) params.set("q", query);
              params.set("category", category.slug);
              return (
                <Link
                  key={category.slug}
                  href={`/gigs?${params.toString()}`}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    selectedCategory === category.slug
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 text-slate-600 hover:border-slate-400"
                  }`}
                >
                  {category.label}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 md:px-6 grid md:grid-cols-3 gap-6">
          {visibleGigs.length ? (
            visibleGigs.map((gig) => {
              const description = gig.summary
                ? gig.summary.length > 180
                  ? `${gig.summary.slice(0, 180)}...`
                  : gig.summary
                : "Details will be shared after discovery.";
              const rawPrice =
                gig.package_basic?.price || gig.price_text || "Custom scope";
              const startingPrice =
                typeof rawPrice === "string" &&
                rawPrice.toLowerCase().includes("starting")
                  ? rawPrice
                  : `Starting at ${rawPrice}`;
              return (
                <Link
                  key={gig.id}
                  href={`/gigs/${gig.slug}?id=${gig.id}`}
                  className="border border-slate-200 rounded-2xl p-6 bg-white hover:shadow-md transition flex flex-col"
                >
                  <div className="aspect-[16/10] rounded-xl bg-slate-100 overflow-hidden">
                    {gig.cover_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={gig.cover_url}
                        alt={gig.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">
                        Gig cover
                      </div>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold mt-6">{gig.title}</h2>
                  <p className="mt-3 text-slate-600">{description}</p>
                  <p className="mt-6 text-sm font-semibold text-slate-900">
                    {startingPrice}
                  </p>
                  <div className="mt-4 text-sm font-medium text-slate-900">
                    View Details →
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="border border-slate-200 rounded-2xl p-6 bg-white text-slate-600">
              Gigs will appear here once published.
            </div>
          )}
        </div>
        {gigs.length > GIGS_PER_PAGE ? (
          <div className="max-w-5xl mx-auto px-4 md:px-6 mt-10 flex items-center justify-center gap-2">
            <Link
              href={createPageHref(Math.max(1, currentPage - 1))}
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
                  href={createPageHref(page)}
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
              href={createPageHref(Math.min(totalPages, currentPage + 1))}
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
