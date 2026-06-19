import Link from "next/link";
import { supabasePublic } from "../lib/supabasePublic";

export const revalidate = 0;
type PageProps = {
  searchParams?: { page?: string };
};

const CASES_PER_PAGE = 6;

const fallbackCases = [
  {
    title: "CRM Rebuild for Medspa Clinic",
    summary:
      "Replacing fragmented lead management with structured pipeline automation.",
    href: "/case-studies/medspa-crm-rebuild",
    cover_url: null,
  },
  {
    title: "Ecommerce Automation Infrastructure",
    summary:
      "Designing backend automation systems to improve operational visibility.",
    href: "/case-studies/ecommerce-automation",
    cover_url: null,
  },
  {
    title: "Internal Operations Dashboard for Agency",
    summary:
      "Building a structured admin portal to centralize reporting and delivery.",
    href: "/case-studies/internal-operations",
    cover_url: null,
  },
];

function createCasePageHref(page: number) {
  return page > 1 ? `/case-studies?page=${page}` : "/case-studies";
}

export default async function CaseStudiesPage({ searchParams }: PageProps) {
  const requestedPage = Number(searchParams?.page ?? "1");
  const { data } = await supabasePublic
    .from("case_studies")
    .select("id,title,slug,summary,cover_url")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const cases =
    data?.length
      ? data.map((item) => ({
          title: item.title,
          summary: item.summary,
          href: `/case-studies/${item.slug}`,
          cover_url: item.cover_url,
        }))
      : fallbackCases;
  const totalPages = Math.max(1, Math.ceil(cases.length / CASES_PER_PAGE));
  const currentPage = Number.isFinite(requestedPage)
    ? Math.min(Math.max(1, requestedPage), totalPages)
    : 1;
  const pageStart = (currentPage - 1) * CASES_PER_PAGE;
  const visibleCases = cases.slice(pageStart, pageStart + CASES_PER_PAGE);

  return (
    <main className="bg-white text-slate-900">

      {/* HERO */}
      <section className="py-24 bg-slate-950 text-white">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <p className="uppercase tracking-[0.3em] text-xs text-slate-300">
            Case Studies
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold mb-6 mt-6">
            Proof of structured transformation.
          </h1>

          <p className="text-xl text-slate-200 max-w-3xl">
            Structured system transformations designed to eliminate operational chaos
            and create scalable digital infrastructure.
          </p>
        </div>
      </section>

      {/* INTRO */}
      <section className="py-20 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <h2 className="text-2xl font-semibold mb-6">
            How We Approach Transformation
          </h2>

          <p className="text-slate-600 text-lg">
            Every engagement begins with diagnosing operational bottlenecks,
            designing structured systems, and implementing automation architecture
            tailored to the client’s business model.
          </p>
        </div>
      </section>

      {/* CASE GRID */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-3 gap-8">

            {visibleCases.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="overflow-hidden bg-white rounded-2xl shadow-sm hover:shadow-md transition"
              >
                <div className="aspect-[16/10] bg-slate-100">
                  {item.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.cover_url}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                      Case study
                    </div>
                  )}
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-semibold mb-3">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 mb-4">
                    {item.summary}
                  </p>
                  <span className="text-sm text-slate-500">
                    View case →
                  </span>
                </div>
              </Link>
            ))}

          </div>
          {cases.length > CASES_PER_PAGE ? (
            <div className="mt-10 flex items-center justify-center gap-2">
              <Link
                href={createCasePageHref(Math.max(1, currentPage - 1))}
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
                    href={createCasePageHref(page)}
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
                href={createCasePageHref(Math.min(totalPages, currentPage + 1))}
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
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 text-center">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-semibold mb-6">
            Ready to Transform Your Operational Systems?
          </h2>

          <Link
            href="/contact"
            className="inline-block bg-slate-900 text-white px-10 py-4 rounded-xl hover:bg-slate-800 transition"
          >
            Book a Systems Consultation
          </Link>
        </div>
      </section>

    </main>
  );
}
