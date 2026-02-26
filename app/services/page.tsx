import Link from "next/link"

export const metadata = {
  title: "Services",
  description:
    "Automation, CRM, growth infrastructure, platform development, and operational support services.",
};

export default function ServicesPage() {
  return (
    <main className="bg-white text-slate-900">

      {/* HERO */}
      <section className="py-20 bg-slate-950 text-white">
        <div className="max-w-5xl mx-auto px-6">
          <p className="uppercase tracking-[0.3em] text-xs text-slate-300">
            Services
          </p>
          <h1 className="text-4xl md:text-6xl font-semibold mt-6">
            Structured digital infrastructure for serious operators.
          </h1>

          <p className="text-xl text-slate-200 max-w-3xl mt-6">
            Flowbridge Digital designs automation systems, CRM architectures,
            growth infrastructure, and operational frameworks that help
            ambitious businesses scale with clarity.
          </p>
        </div>
      </section>

      {/* POSITIONING COPY */}
      <section className="py-16 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-base text-slate-600 leading-relaxed">
            Most businesses don’t struggle because of lack of ambition.
            They struggle because their backend systems are fragmented.
            Tools are disconnected. Processes are manual. Visibility is unclear.
            <br /><br />
            Our services are structured to rebuild your operational foundation —
            not just execute tasks, but architect scalable digital systems.
          </p>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section className="py-20 bg-slate-50 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-10">

            <ServiceCard
              title="Automation & Systems Architecture"
              desc="Business process automation, workflow engineering, and backend operational structuring."
              href="/services/automation-systems-architecture"
            />

            <ServiceCard
              title="CRM & Pipeline Engineering"
              desc="Structured CRM design, lifecycle workflows, and revenue visibility systems."
              href="/services/crm-pipeline"
            />

            <ServiceCard
              title="Growth Infrastructure"
              desc="Email marketing systems, lead nurturing automation, and conversion infrastructure."
              href="/services/growth-infrastructure"
            />

            <ServiceCard
              title="Platform Development"
              desc="Modern web applications and internal tools built for operational scalability."
              href="/services/platform-development"
            />

            <ServiceCard
              title="Operational Support"
              desc="Structured VA systems, backend documentation, and execution support frameworks."
              href="/services/operational-support"
            />

          </div>
        </div>
      </section>

      {/* CONNECTIVE STRATEGY SECTION */}
      <section className="py-28">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold mb-8">
            Designed as One Unified System
          </h2>

          <p className="text-lg text-slate-600 leading-relaxed">
            While each service can stand independently, they are architected
            to function together as a cohesive operational ecosystem.
            <br /><br />
            Automation connects to CRM.
            CRM connects to growth.
            Growth connects to infrastructure.
            Infrastructure supports execution.
            <br /><br />
            That is how scalable companies are built.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-28 bg-slate-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-semibold mb-6">
            Ready to Build Structured Infrastructure?
          </h2>

          <a
            href="https://cal.com/flow-bridge-digital-tee44g/systems-strategy-consultation"
            target="_blank"
            rel="noreferrer"
            className="inline-block bg-white text-slate-900 px-10 py-4 rounded-xl font-medium hover:bg-slate-200 transition"
          >
            Book a Strategy Call
          </a>
        </div>
      </section>

    </main>
  )
}

function ServiceCard({ title, desc, href }) {
  return (
    <Link
      href={href}
      className="p-8 bg-white border border-slate-200 rounded-2xl hover:shadow-md transition block"
    >
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <p className="text-slate-600">{desc}</p>
      <div className="mt-6 text-sm font-medium text-slate-900">
        Learn More →
      </div>
    </Link>
  )
}
