import Link from "next/link";

export default function CaseStudiesPage() {
  return (
    <main className="bg-[var(--background)] text-[var(--foreground)]">

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

            {/* CASE 1 */}
            <Link
              href="/case-studies/medspa-crm-rebuild"
              className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition"
            >
              <h3 className="text-xl font-semibold mb-3">
                CRM Rebuild for Medspa Clinic
              </h3>
              <p className="text-slate-600 mb-4">
                Replacing fragmented lead management with structured pipeline
                automation and lifecycle workflows.
              </p>
              <span className="text-sm text-slate-500">
                CRM & Pipeline Engineering →
              </span>
            </Link>

            {/* CASE 2 */}
            <Link
              href="/case-studies/ecommerce-automation"
              className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition"
            >
              <h3 className="text-xl font-semibold mb-3">
                Ecommerce Automation Infrastructure
              </h3>
              <p className="text-slate-600 mb-4">
                Designing backend automation systems to improve order tracking,
                onboarding, and operational visibility.
              </p>
              <span className="text-sm text-slate-500">
                Automation & Systems Architecture →
              </span>
            </Link>

            {/* CASE 3 */}
            <Link
              href="/case-studies/agency-dashboard"
              className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition"
            >
              <h3 className="text-xl font-semibold mb-3">
                Internal Operations Dashboard for Agency
              </h3>
              <p className="text-slate-600 mb-4">
                Building a structured admin portal to centralize reporting,
                task visibility, and team coordination.
              </p>
              <span className="text-sm text-slate-500">
                Platform Development →
              </span>
            </Link>

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
