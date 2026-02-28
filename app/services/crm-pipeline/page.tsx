export default function CRMPipelinePage() {
  return (
    <main className="bg-[var(--background)] text-[var(--foreground)]">

      {/* HERO */}
      <section className="py-28 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <h1 className="text-4xl md:text-5xl font-semibold mb-6">
            CRM & Pipeline Engineering
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl">
            We design structured CRM systems that create visibility, automate lead
            management, and bring revenue clarity to your operations.
          </p>

          <div className="mt-8">
            <a
              href="https://cal.com/flow-bridge-digital-tee44g/systems-strategy-consultation"
              target="_blank"
              rel="noreferrer"
              className="inline-block bg-slate-900 text-white px-8 py-4 rounded-xl hover:bg-slate-800 transition"
            >
              Book a CRM Systems Call
            </a>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-semibold mb-10">
            When Revenue Feels Unpredictable
          </h2>

          <ul className="space-y-4 text-slate-600 text-lg">
            <li>• Leads falling through the cracks</li>
            <li>• No clear visibility into sales stages</li>
            <li>• Manual follow-ups draining your team</li>
            <li>• Disconnected marketing and sales systems</li>
            <li>• No structured pipeline reporting</li>
            <li>• Scaling without operational clarity</li>
          </ul>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-semibold mb-10">
            What CRM Engineering Looks Like
          </h2>

          <div className="grid md:grid-cols-2 gap-8 text-slate-600">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Lifecycle Workflow Automation
              </h3>
              <p>
                Automated lead capture, tagging, routing, and stage progression
                to eliminate manual bottlenecks.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Pipeline Visibility Systems
              </h3>
              <p>
                Structured deal stages, revenue tracking dashboards, and
                reporting clarity for founders.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Sales Process Engineering
              </h3>
              <p>
                Defined follow-up logic, automation triggers, and systematic
                opportunity management.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Cross-Platform Integration
              </h3>
              <p>
                Connecting CRM with email systems, booking tools, payment
                platforms, and internal dashboards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* IMPLEMENTATION */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-semibold mb-10">
            Our Implementation Process
          </h2>

          <div className="space-y-6 text-slate-600">
            <p>
              <strong className="text-slate-900">
                1. Audit & Diagnose
              </strong>{" "}
              — We assess your existing tools, revenue process, and workflow gaps.
            </p>

            <p>
              <strong className="text-slate-900">
                2. Architect & Design
              </strong>{" "}
              — We build structured pipeline logic and automation flows.
            </p>

            <p>
              <strong className="text-slate-900">
                3. Deploy & Optimize
              </strong>{" "}
              — We implement, test, refine, and ensure operational alignment.
            </p>
          </div>
        </div>
      </section>

      {/* TOOLS */}
      <section className="py-24 bg-slate-50">
  <div className="max-w-6xl mx-auto px-4 md:px-6">
    <h2 className="text-3xl font-semibold mb-10">
      Platforms We Engineer On
    </h2>

    <div className="grid md:grid-cols-4 gap-8 text-slate-600 text-lg">
      <p>HubSpot</p>
      <p>GoHighLevel</p>
      <p>Pipedrive</p>
      <p>Bitrix24</p>
      <p>Airtable</p>
      <p>Zapier</p>
      <p>Make</p>
      <p>n8n</p>
    </div>
  </div>
</section>

      {/* WHO THIS IS FOR */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-semibold mb-10">
            This Is Designed For
          </h2>

          <ul className="space-y-4 text-slate-600 text-lg">
            <li>• Scaling ecommerce brands</li>
            <li>• Service businesses with consistent lead flow</li>
            <li>• Clinics & medspas needing pipeline clarity</li>
            <li>• Agencies managing multiple deal stages</li>
            <li>• Founders ready for operational structure</li>
          </ul>
        </div>
      </section>

      {/* OUTCOMES */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-semibold mb-10">
            Expected Outcomes
          </h2>

          <ul className="space-y-4 text-slate-300 text-lg">
            <li>• Clear revenue visibility</li>
            <li>• Automated lead management</li>
            <li>• Structured sales progression</li>
            <li>• Reduced manual oversight</li>
            <li>• Scalable backend growth systems</li>
          </ul>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-28 text-center">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-semibold mb-6">
            Ready to Engineer Your Revenue Pipeline?
          </h2>

          <a
            href="https://cal.com/flow-bridge-digital-tee44g/systems-strategy-consultation"
            target="_blank"
            rel="noreferrer"
            className="inline-block bg-slate-900 text-white px-10 py-4 rounded-xl hover:bg-slate-800 transition"
          >
            Book a CRM Systems Call
          </a>
        </div>
      </section>

    </main>
  );
}
