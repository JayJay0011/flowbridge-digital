import Link from "next/link";
import Image from "next/image";

export default function MedspaCaseStudy() {
  return (
    <main className="bg-white text-slate-900">

      {/* HERO */}
      <section className="py-28 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">

          <div>
            <p className="text-sm uppercase tracking-widest text-slate-500 mb-4">
              Case Study
            </p>

            <h1 className="text-4xl md:text-5xl font-semibold mb-6 leading-tight">
              CRM Rebuild & Automation Architecture for a Scaling MedSpa Clinic
            </h1>

            <p className="text-lg text-slate-600 mb-8">
              Replacing fragmented lead tracking and manual follow-ups with a
              structured CRM system, lifecycle automation, and operational visibility.
            </p>

            <Link
              href="/contact"
              className="inline-block bg-slate-900 text-white px-8 py-4 rounded-xl hover:bg-slate-800 transition"
            >
              Book a Systems Consultation
            </Link>
          </div>

          <div className="relative h-[420px] rounded-2xl overflow-hidden shadow-xl">
            <Image
              src="/medspa-mockup.png"
              alt="Medspa CRM Dashboard Mockup"
              fill
              className="object-cover"
            />
          </div>

        </div>
      </section>


      {/* CONTEXT */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-semibold mb-8">
            Business Context
          </h2>

          <p className="text-slate-600 text-lg mb-6">
            The clinic was experiencing steady lead volume from paid ads and
            referrals but struggled with follow-ups, visibility, and internal coordination.
          </p>

          <p className="text-slate-600 text-lg">
            While revenue demand existed, backend systems lacked structure —
            resulting in missed opportunities and operational bottlenecks.
          </p>
        </div>
      </section>


      {/* THE PROBLEM */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-semibold mb-12">
            The Operational Bottlenecks
          </h2>

          <div className="grid md:grid-cols-2 gap-12 text-slate-600 text-lg">

            <ul className="space-y-4">
              <li>• Leads manually entered into spreadsheets</li>
              <li>• No structured pipeline visibility</li>
              <li>• Inconsistent follow-up processes</li>
              <li>• Booking confirmations handled manually</li>
            </ul>

            <ul className="space-y-4">
              <li>• No lifecycle tagging logic</li>
              <li>• Disconnected booking & CRM systems</li>
              <li>• Limited reporting clarity</li>
              <li>• Team confusion around lead ownership</li>
            </ul>

          </div>
        </div>
      </section>


      {/* ARCHITECTURE SOLUTION */}
   {/* SOLUTION OVERVIEW */}
<section className="py-24 bg-slate-50">
  <div className="max-w-6xl mx-auto px-6">
    <h2 className="text-3xl font-semibold mb-12">
      The Structured Solution
    </h2>

    <div className="grid md:grid-cols-2 gap-12">

      {/* CRM Pipeline */}
      <div>
        <Image
          src="/medspa-crm-pipeline.png"
          alt="MedSpa CRM Pipeline Dashboard"
          width={800}
          height={1000}
          className="rounded-2xl shadow-md mb-6"
        />
        <h3 className="text-xl font-semibold mb-2">
          Structured CRM Pipeline
        </h3>
        <p className="text-slate-600">
          Designed a centralized pipeline tracking new leads,
          consultation bookings, treatments, and post-care stages.
        </p>
      </div>

      {/* Automation System */}
      <div>
        <Image
          src="/medspa-automation-system.png"
          alt="MedSpa Automation System Dashboard"
          width={800}
          height={1000}
          className="rounded-2xl shadow-md mb-6"
        />
        <h3 className="text-xl font-semibold mb-2">
          Lead → Consultation & Lifecycle Automation
        </h3>
        <p className="text-slate-600">
          Automated tagging, SMS reminders, booking workflows,
          post-treatment follow-ups, re-engagement campaigns,
          and retention flows structured for predictable growth.
        </p>
      </div>

    </div>
  </div>
</section>


      {/* IMPLEMENTATION PROCESS */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-semibold mb-10">
            Implementation Process
          </h2>

          <div className="space-y-6 text-slate-600 text-lg">

            <p>
              <strong className="text-slate-900">
                1. Operational Audit
              </strong>{" "}
              — Mapping lead flow, booking process, and staff workflows.
            </p>

            <p>
              <strong className="text-slate-900">
                2. CRM Architecture Design
              </strong>{" "}
              — Structuring pipeline stages, tags, automation triggers,
              and reporting logic.
            </p>

            <p>
              <strong className="text-slate-900">
                3. Automation Deployment
              </strong>{" "}
              — Implementing lifecycle sequences and integration syncing.
            </p>

            <p>
              <strong className="text-slate-900">
                4. Testing & Optimization
              </strong>{" "}
              — Refining triggers, improving timing logic,
              and validating data integrity.
            </p>

          </div>
        </div>
      </section>


      {/* OUTCOMES */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-semibold mb-12">
            Operational Outcomes
          </h2>

          <div className="grid md:grid-cols-2 gap-12 text-slate-300 text-lg">

            <ul className="space-y-4">
              <li>• Improved lead tracking accuracy</li>
              <li>• Reduced manual administrative workload</li>
              <li>• Structured client lifecycle visibility</li>
            </ul>

            <ul className="space-y-4">
              <li>• Increased booking consistency</li>
              <li>• Clear reporting for performance analysis</li>
              <li>• Backend stability supporting scalable growth</li>
            </ul>

          </div>
        </div>
      </section>


      {/* STRATEGIC REFLECTION */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold mb-8">
            Strategic Insight
          </h2>

          <p className="text-slate-600 text-lg">
            Growth constraints were not caused by lack of demand —
            but by operational fragmentation. By rebuilding structured
            systems beneath the surface, the clinic regained clarity,
            efficiency, and scalable infrastructure.
          </p>
        </div>
      </section>


      {/* FINAL CTA */}
      <section className="py-28 text-center bg-slate-50">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-semibold mb-6">
            Ready to Rebuild Your Operational Systems?
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
