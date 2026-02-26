import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How We Work | Flowbridge Digital",
  description:
    "Discover how Flowbridge Digital designs CRM systems, automation architecture, and operational infrastructure to help businesses regain control and clarity.",
  keywords: [
    "CRM system implementation",
    "workflow automation consulting",
    "business automation systems",
    "pipeline engineering services",
    "operational infrastructure design",
  ],
};

export default function HowWeWorkPage() {
  return (
    <main className="bg-white text-slate-900">

      {/* HERO */}
      <section className="py-24 bg-slate-950 text-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="uppercase tracking-[0.3em] text-xs text-slate-300">
            Process
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold mb-6 mt-6">
            How We Rebuild Operational Infrastructure
          </h1>
          <p className="text-xl text-slate-200 max-w-3xl mx-auto mb-10">
            Flowbridge Digital designs structured CRM systems, automation architecture,
            and growth infrastructure that eliminate operational chaos and create
            scalable business clarity.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://cal.com/flow-bridge-digital-tee44g/systems-strategy-consultation"
              target="_blank"
              rel="noreferrer"
              className="px-8 py-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition"
            >
              Book a Strategy Call
            </a>

            <Link
              href="/case-studies"
              className="px-8 py-4 border border-slate-300 rounded-xl hover:bg-white hover:shadow-sm transition"
            >
              View Case Studies
            </Link>
          </div>
        </div>
      </section>

      {/* 5 FLAGSHIP FRAMEWORK */}
      <section className="py-20 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-semibold mb-16 text-center">
            The Flowbridge 5-Stage Systems Framework
          </h2>

          <div className="grid md:grid-cols-2 gap-12">

            {/* 01 */}
            <div className="space-y-4">
              <span className="text-sm text-slate-500">01</span>
              <h3 className="text-xl font-semibold">
                Automation & Systems Architecture
              </h3>
              <p className="text-slate-600">
                We map business processes, eliminate redundancy, and design structured
                backend workflows that support operational scalability.
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>Workflow engineering</li>
                <li>Process optimization</li>
                <li>Backend structuring</li>
              </ul>
            </div>

            {/* 02 */}
            <div className="space-y-4">
              <span className="text-sm text-slate-500">02</span>
              <h3 className="text-xl font-semibold">
                CRM & Pipeline Engineering
              </h3>
              <p className="text-slate-600">
                We implement structured CRM systems with lifecycle automation,
                pipeline visibility, and revenue tracking clarity.
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>Pipeline design</li>
                <li>Lifecycle triggers</li>
                <li>Revenue visibility systems</li>
              </ul>
            </div>

            {/* 03 */}
            <div className="space-y-4">
              <span className="text-sm text-slate-500">03</span>
              <h3 className="text-xl font-semibold">
                Growth Infrastructure
              </h3>
              <p className="text-slate-600">
                We build lead capture, nurturing automation, and conversion systems
                that transform interest into structured growth.
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>Email marketing systems</li>
                <li>Lead nurturing automation</li>
                <li>Conversion infrastructure</li>
              </ul>
            </div>

            {/* 04 */}
            <div className="space-y-4">
              <span className="text-sm text-slate-500">04</span>
              <h3 className="text-xl font-semibold">
                Platform Development
              </h3>
              <p className="text-slate-600">
                We build modern web applications, dashboards, and internal tools
                engineered for operational scalability.
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>Internal tools</li>
                <li>Operational dashboards</li>
                <li>Custom web applications</li>
              </ul>
            </div>

            {/* 05 */}
            <div className="space-y-4 md:col-span-2">
              <span className="text-sm text-slate-500">05</span>
              <h3 className="text-xl font-semibold">
                Operational Support & Structuring
              </h3>
              <p className="text-slate-600">
                We document systems, implement execution frameworks, and ensure
                backend clarity so growth remains controlled and structured.
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>System documentation</li>
                <li>Execution frameworks</li>
                <li>Backend operational clarity</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ARCHITECTURE FLOW */}
      <section className="py-20 bg-slate-50 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold mb-12">
            Our Implementation Architecture
          </h2>

          <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-slate-600 font-medium">
            <span>Strategy</span>
            <span>→</span>
            <span>System Design</span>
            <span>→</span>
            <span>Build</span>
            <span>→</span>
            <span>Integrate</span>
            <span>→</span>
            <span>Optimize</span>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold mb-6">
            Ready to Rebuild Your Systems the Right Way?
          </h2>
          <p className="text-slate-600 mb-8">
            If your business feels scattered, disconnected, or manually intensive,
            it's time to implement structured infrastructure.
          </p>

          <a
            href="https://cal.com/flow-bridge-digital-tee44g/systems-strategy-consultation"
            target="_blank"
            rel="noreferrer"
            className="px-10 py-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition"
          >
            Book a Strategy Call
          </a>
        </div>
      </section>

    </main>
  );
}
