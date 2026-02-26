export default function AutomationPage() {
  return (
    <main className="bg-white text-slate-900">

      {/* HERO */}
      <section className="py-28">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-4xl md:text-6xl font-semibold leading-tight mb-6">
            Business Process Automation &
            <br /> Systems Architecture
          </h1>

          <p className="text-xl text-slate-600 max-w-3xl">
            We design structured automation systems that eliminate manual processes,
            improve operational visibility, and create scalable business infrastructure.
          </p>

          <div className="mt-10">
            <a
              href="https://cal.com/flow-bridge-digital-tee44g/systems-strategy-consultation"
              target="_blank"
              rel="noreferrer"
              className="inline-block bg-slate-900 text-white px-8 py-4 rounded-xl hover:bg-slate-800 transition"
            >
              Book an Automation Systems Call
            </a>
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-semibold mb-12">
            When Operations Start Slowing Growth
          </h2>

          <div className="grid md:grid-cols-2 gap-8 text-slate-700">
            <ul className="space-y-4">
              <li>Manual follow-ups and repetitive admin tasks</li>
              <li>Disconnected tools and fragmented workflows</li>
              <li>Missed leads and unclear pipeline visibility</li>
            </ul>

            <ul className="space-y-4">
              <li>Scaling that feels chaotic instead of controlled</li>
              <li>No structured onboarding process</li>
              <li>Lack of real-time operational clarity</li>
            </ul>
          </div>
        </div>
      </section>

      {/* WHAT WE BUILD */}
      <section className="py-28">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-semibold mb-16 text-center">
            What Automation Looks Like Inside Your Business
          </h2>

          <div className="grid md:grid-cols-2 gap-10">

            <FeatureCard
              title="CRM Workflow Engineering"
              desc="Structured pipelines, tagging logic, lifecycle automation, and revenue tracking visibility."
            />

            <FeatureCard
              title="Lead Routing & Automation Logic"
              desc="Automated assignment, qualification systems, and backend routing architecture."
            />

            <FeatureCard
              title="Onboarding & Client Journey Systems"
              desc="Automated onboarding, follow-up sequencing, and status tracking frameworks."
            />

            <FeatureCard
              title="Cross-Platform Integrations"
              desc="Secure integrations across CRM, email platforms, internal tools, and custom APIs."
            />

          </div>
        </div>
      </section>

      {/* IMPLEMENTATION PROCESS */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold mb-12">
            Our Implementation Process
          </h2>

          <div className="space-y-10 text-slate-700">
            <ProcessStep
              number="01"
              title="Diagnose Operational Bottlenecks"
              desc="We map your workflows and identify structural inefficiencies."
            />
            <ProcessStep
              number="02"
              title="Design Structured Automation Architecture"
              desc="We architect systems aligned with your growth model."
            />
            <ProcessStep
              number="03"
              title="Deploy, Test & Optimize"
              desc="We implement, refine, and ensure long-term scalability."
            />
          </div>
        </div>
      </section>

      {/* OUTCOME SECTION */}
      <section className="py-28 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold mb-10">
            The Result: Operational Clarity & Scalable Infrastructure
          </h2>

          <p className="text-lg text-slate-300 leading-relaxed">
            After implementation, businesses experience reduced manual workload,
            structured lead management, improved execution speed,
            and backend systems built for long-term scale.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-28 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-semibold mb-6">
            Ready to Rebuild Your Operational Systems?
          </h2>

          <a
            href="https://cal.com/flow-bridge-digital-tee44g/systems-strategy-consultation"
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-6 bg-slate-900 text-white px-10 py-4 rounded-xl hover:bg-slate-800 transition"
          >
            Book an Automation Systems Call
          </a>
        </div>
      </section>

    </main>
  )
}

function FeatureCard({ title, desc }) {
  return (
    <div className="p-8 border border-slate-200 rounded-2xl hover:shadow-md transition">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <p className="text-slate-600">{desc}</p>
    </div>
  )
}

function ProcessStep({ number, title, desc }) {
  return (
    <div>
      <div className="text-sm font-medium text-slate-400 mb-2">{number}</div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p>{desc}</p>
    </div>
  )
}
