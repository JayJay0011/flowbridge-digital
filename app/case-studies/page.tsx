import Link from "next/link";
import { supabasePublic } from "../lib/supabasePublic";

export const revalidate = 0;

const fallbackCases = [
  {
    title: "CRM Rebuild for Medspa Clinic",
    summary:
      "Replacing fragmented lead management with structured pipeline automation.",
    href: "/case-studies/medspa-crm-rebuild",
  },
  {
    title: "Ecommerce Automation Infrastructure",
    summary:
      "Designing backend automation systems to improve operational visibility.",
    href: "/case-studies/ecommerce-automation",
  },
  {
    title: "Internal Operations Dashboard for Agency",
    summary:
      "Building a structured admin portal to centralize reporting and delivery.",
    href: "/case-studies/internal-operations",
  },
];

export default async function CaseStudiesPage() {
  const { data } = await supabasePublic
    .from("case_studies")
    .select("id,title,slug,summary")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const cases =
    data?.length
      ? data.map((item) => ({
          title: item.title,
          summary: item.summary,
          href: `/case-studies/${item.slug}`,
        }))
      : fallbackCases;

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

            {cases.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition"
              >
                <h3 className="text-xl font-semibold mb-3">
                  {item.title}
                </h3>
                <p className="text-slate-600 mb-4">
                  {item.summary}
                </p>
                <span className="text-sm text-slate-500">
                  View case →
                </span>
              </Link>
            ))}

          </div>
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
