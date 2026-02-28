import Image from "next/image";
import Link from "next/link";

export default function InternalOperationsCaseStudy() {
  return (
    <main className="bg-[var(--background)] text-[var(--foreground)]">

      {/* HERO */}
      <section className="py-28 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-16 items-center">

          <div>
            <p className="text-sm uppercase tracking-wide text-slate-500 mb-4">
              Case Study
            </p>

            <h1 className="text-4xl md:text-5xl font-semibold mb-6 leading-tight">
              Internal Operations Dashboard for Scaling Agency
            </h1>

            <p className="text-lg text-slate-600 mb-8">
              Replacing fragmented reporting systems with a centralized operational dashboard,
              structured task management workflows, and real-time performance visibility.
            </p>

            <Link
              href="/strategy-call"
              className="inline-block bg-slate-900 text-white px-8 py-4 rounded-xl hover:bg-slate-800 transition"
            >
              Book a Systems Consultation
            </Link>
          </div>

          <div>
            <Image
              src="/internal-ops-dashboard.png"
              alt="Internal Operations Dashboard Overview"
              width={1000}
              height={800}
              className="rounded-2xl shadow-xl"
            />
          </div>

        </div>
      </section>

      {/* BUSINESS CONTEXT */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-semibold mb-6">
            Business Context
          </h2>

          <p className="text-lg text-slate-600 leading-relaxed">
            The agency was growing quickly but lacked centralized reporting.
            Project tracking was scattered across Slack, spreadsheets, and task tools.
            Leadership had no real-time operational visibility.
          </p>
        </div>
      </section>

      {/* CORE PROBLEMS */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6">

          <h2 className="text-3xl font-semibold mb-12 text-center">
            Core Operational Gaps
          </h2>

          <div className="grid md:grid-cols-3 gap-10 text-slate-600">

            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-3">
                Disconnected Reporting
              </h3>
              <p>
                No single dashboard for revenue, delivery progress,
                or team performance metrics.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-3">
                Task Visibility Issues
              </h3>
              <p>
                Project bottlenecks were discovered too late,
                causing delayed client deliverables.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-3">
                Manual Admin Work
              </h3>
              <p>
                Staff manually updated spreadsheets instead of
                relying on automation-integrated systems.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* SYSTEM ARCHITECTURE */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-6">

          <h2 className="text-3xl font-semibold mb-12 text-center">
            System Architecture Built
          </h2>

          <div className="grid md:grid-cols-2 gap-16 items-center">

            <Image
              src="/internal-ops-tasks.png"
              alt="Task and Workflow Management System"
              width={1000}
              height={800}
              className="rounded-2xl shadow-lg"
            />

            <div className="space-y-6 text-slate-600 text-lg">

              <p>
                <strong className="text-slate-900">
                  Central Operations Dashboard
                </strong>{" "}
                — Revenue tracking, active projects,
                delivery timelines, and performance metrics.
              </p>

              <p>
                <strong className="text-slate-900">
                  Structured Workflow Logic
                </strong>{" "}
                — Automated task assignment,
                project status tracking, and escalation triggers.
              </p>

              <p>
                <strong className="text-slate-900">
                  Real-Time Reporting
                </strong>{" "}
                — Leadership-level visibility with
                live KPI summaries and pipeline forecasting.
              </p>

            </div>

          </div>
        </div>
      </section>

      {/* AUTOMATION LAYER */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-16 items-center">

          <div className="space-y-6 text-slate-600 text-lg">
            <h2 className="text-3xl font-semibold text-slate-900">
              Automation & Data Sync
            </h2>

            <p>
              Integrated CRM systems, task management tools,
              and reporting databases to eliminate manual updates.
            </p>

            <p>
              Automated alerts for overdue deliverables,
              budget thresholds, and performance anomalies.
            </p>

            <p>
              Cross-platform sync ensuring data consistency
              across operations, finance, and leadership dashboards.
            </p>
          </div>

          <Image
            src="/internal-ops-automation.png"
            alt="Automation and Reporting System"
            width={1000}
            height={800}
            className="rounded-2xl shadow-lg"
          />

        </div>
      </section>

      {/* OUTCOMES */}
      <section className="py-28 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6 text-center">

          <h2 className="text-3xl font-semibold mb-12">
            Operational Outcomes
          </h2>

          <div className="grid md:grid-cols-3 gap-10 text-lg">

            <div className="bg-slate-800 p-10 rounded-2xl">
              <p className="text-4xl font-semibold mb-3">+42%</p>
              Improvement in project delivery speed
            </div>

            <div className="bg-slate-800 p-10 rounded-2xl">
              <p className="text-4xl font-semibold mb-3">-55%</p>
              Reduction in manual admin processes
            </div>

            <div className="bg-slate-800 p-10 rounded-2xl">
              <p className="text-4xl font-semibold mb-3">
                Full Visibility
              </p>
              Leadership-level real-time performance tracking
            </div>

          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-28 text-center">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-semibold mb-6">
            Ready to Centralize Your Operations?
          </h2>

          <Link
            href="/strategy-call"
            className="inline-block bg-slate-900 text-white px-10 py-4 rounded-xl hover:bg-slate-800 transition"
          >
            Book a Systems Consultation
          </Link>
        </div>
      </section>

    </main>
  );
}
