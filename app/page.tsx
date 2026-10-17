
import Link from "next/link"
import FAQSection from "./components/FAQSection";
import OutcomeSlider from "./components/OutcomeSlider";

export const revalidate = 0;

const popularServices = [
  { title: "Automation Systems", desc: "Workflow mapping, integrations, and backend architecture.", href: "/services/automation-systems-architecture" },
  { title: "CRM Pipeline Design", desc: "Lifecycle automation and revenue visibility.", href: "/services/crm-pipeline" },
  { title: "Growth Infrastructure", desc: "Lead capture, nurturing, and conversion systems.", href: "/services/growth-infrastructure" },
  { title: "Platform Development", desc: "Custom dashboards and internal tools.", href: "/services/platform-development" },
  { title: "Operational Support", desc: "Execution frameworks and support systems.", href: "/services/operational-support" },
  { title: "Email Marketing", desc: "Segmentation, campaigns, and lifecycle automations.", href: "/services/email-marketing" },
];

export default function Home() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://flowbridgedigital.org";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/#homepage`,
        url: siteUrl,
        name: "Flowbridge Digital | Automation & CRM Systems",
        description:
          "Automation systems, CRM pipelines, and growth infrastructure for modern operators.",
        isPartOf: {
          "@id": `${siteUrl}/#website`,
        },
        about: {
          "@id": `${siteUrl}/#organization`,
        },
      },
      {
        "@type": "ItemList",
        "@id": `${siteUrl}/#core-services`,
        name: "Flowbridge Digital core services",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            item: {
              "@type": "Service",
              name: "Automation Systems",
              url: `${siteUrl}/services/automation-systems-architecture`,
            },
          },
          {
            "@type": "ListItem",
            position: 2,
            item: {
              "@type": "Service",
              name: "CRM Pipeline Engineering",
              url: `${siteUrl}/services/crm-pipeline`,
            },
          },
          {
            "@type": "ListItem",
            position: 3,
            item: {
              "@type": "Service",
              name: "Growth Infrastructure",
              url: `${siteUrl}/services/growth-infrastructure`,
            },
          },
          {
            "@type": "ListItem",
            position: 4,
            item: {
              "@type": "Service",
              name: "Platform Development",
              url: `${siteUrl}/services/platform-development`,
            },
          },
          {
            "@type": "ListItem",
            position: 5,
            item: {
              "@type": "Service",
              name: "Operational Support",
              url: `${siteUrl}/services/operational-support`,
            },
          },
          {
            "@type": "ListItem",
            position: 6,
            item: {
              "@type": "Service",
              name: "Email Marketing",
              url: `${siteUrl}/services/email-marketing`,
            },
          },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,_rgba(14,116,144,0.35),_transparent_50%)]" />
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(120deg,_rgba(255,255,255,0.08),_transparent_60%)]" />

        <div className="relative max-w-5xl mx-auto px-4 md:px-6 py-24">
          <div className="max-w-2xl">
            <p className="uppercase tracking-[0.3em] text-xs text-slate-300">
              Flowbridge Digital
            </p>
            <h1 className="text-4xl md:text-6xl font-semibold leading-tight mt-6">
              Systems that give operators control, clarity, and growth.
            </h1>
            <p className="text-xl text-slate-200 mt-6 leading-relaxed">
              We rebuild automation, CRM, and execution layers so your business
              scales without chaos. One structured system. Built to last.
            </p>

            <form
              action="/search"
              method="get"
              className="mt-8 flex flex-col sm:flex-row gap-4"
            >
              <input
                type="text"
                name="q"
                placeholder="Search for a service..."
                className="flex-1 rounded-xl px-5 py-4 bg-white text-slate-900 placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center px-6 py-4 rounded-xl bg-white text-slate-900 font-semibold hover:bg-slate-100 transition"
              >
                Search
              </button>
              <a
                href="https://cal.com/flow-bridge-digital-tee44g/systems-strategy-consultation"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-cyan-400 px-6 py-4 font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Book a Strategy Call
              </a>
            </form>

            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              {[
                "Automation Systems",
                "CRM Pipeline",
                "Email Marketing",
                "Virtual Assistant Ops",
                "Project Management",
                "App & Web Development",
              ].map((label) => (
                <span
                  key={label}
                  className="px-4 py-2 border border-slate-700 rounded-full text-slate-200"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-12 border-y border-slate-800 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Platforms and technologies we build with
            </p>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-4 text-sm">
              {[
                "n8n",
                "Pipedrive",
                "Zoho CRM",
                "HubSpot",
                "Salesforce",
                "GoHighLevel",
                "Bitrix24",
                "Odoo",
                "Zapier",
                "Make",
                "Supabase",
                "Airtable",
                "Brevo",
                "Klaviyo",
                "ActiveCampaign",
                "JavaScript",
                "TypeScript",
                "Python",
                "React",
                "Next.js",
                "APIs & Webhooks",
              ].map((platform) => (
                <span key={platform} className="font-semibold text-slate-200">
                  {platform}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-slate-800 bg-slate-800 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Registered US company",
              "Secure Stripe checkout",
              "Track your project online",
              "Clear delivery and revision process",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 bg-slate-950 px-5 py-4 text-sm text-slate-200">
                <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-cyan-400" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= POPULAR CATEGORIES ================= */}
      <section className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold">
                Popular Services
              </h2>
              <p className="text-slate-600 mt-3">
                Pick a structured lane and move faster with clarity.
              </p>
            </div>
            <Link
              href="/services"
              className="text-sm font-semibold text-slate-900"
            >
              View all services →
            </Link>
          </div>

          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularServices.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group border border-slate-200 rounded-2xl p-6 bg-slate-50 hover:-translate-y-0.5 hover:shadow-md transition"
              >
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-slate-600 mt-3 text-sm leading-relaxed">
                  {item.desc}
                </p>
                <span className="mt-6 inline-block text-sm font-semibold text-slate-900 group-hover:underline">
                  View options →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="border-b border-slate-100 bg-slate-50 py-20">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Ordering with Flowbridge</p>
            <h2 className="mt-4 text-3xl font-semibold md:text-4xl">From agreed scope to approved delivery</h2>
            <p className="mt-4 text-slate-600">
              Every order follows a visible process, whether you choose a listed service or receive a custom offer in your inbox.
            </p>
          </div>
          <ol className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              ["01", "Choose or agree", "Choose a service or agree on a custom offer."],
              ["02", "Pay securely", "Confirm the agreed amount through secure checkout."],
              ["03", "Track the work", "Follow progress, messages, and delivery in your account."],
              ["04", "Review delivery", "Approve the work or request an included revision."],
            ].map(([number, title, body]) => (
              <li key={number} className="rounded-2xl border border-slate-200 bg-white p-6">
                <span className="text-sm font-semibold text-cyan-700">{number}</span>
                <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <OutcomeSlider />

      {/* ================= PROBLEM SECTION ================= */}
      <section className="py-24 bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 md:px-6 text-center space-y-12">

          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Does Your Business Feel Like This?
          </h2>

          <div className="grid md:grid-cols-2 gap-12 text-left text-slate-600 leading-relaxed max-w-4xl mx-auto text-base">

            <ul className="space-y-6">
              <li>Leads are missed or not followed up properly</li>
              <li>Your tools don’t connect with each other</li>
              <li>Processes feel manual and repetitive</li>
            </ul>

            <ul className="space-y-6">
              <li>Team members lack clear structure</li>
              <li>Operations feel scattered</li>
              <li>Growth feels stressful instead of structured</li>
            </ul>

          </div>

        </div>
      </section>

      {/* ================= SOLUTION SECTION ================= */}
      <section className="py-24 bg-slate-50 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 md:px-6 text-center space-y-10">

          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            We Bring Structure Back to Your Business
          </h2>

          <p className="text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto">
            Through automation, CRM systems, workflow design, and strategic planning,
            we turn scattered operations into structured growth engines.
          </p>

          <div className="grid md:grid-cols-3 gap-8 pt-8 text-left">

            <div className="p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="font-semibold text-lg mb-3">Automation Systems</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Remove repetitive work and connect your tools into one seamless flow.
              </p>
            </div>

            <div className="p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="font-semibold text-lg mb-3">CRM & Pipeline Design</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Build visibility into your leads, sales, and operational processes.
              </p>
            </div>

            <div className="p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="font-semibold text-lg mb-3">Strategic Consulting</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Clear operational strategy that supports scalable growth.
              </p>
              <a
                href="https://cal.com/flow-bridge-digital-tee44g/systems-strategy-consultation"
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-block text-sm font-semibold text-slate-900"
              >
                Book strategy call →
              </a>
            </div>

          </div>

        </div>
      </section>
      {/* ================= PROCESS SECTION ================= */}
<section className="py-32 bg-white">
  <div className="max-w-5xl mx-auto px-4 md:px-6 text-center space-y-16">

    <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
      Our Process
    </h2>

    <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
      Every engagement follows a structured framework designed to
      bring clarity, alignment, and measurable results.
    </p>

    <div className="grid md:grid-cols-3 gap-12 text-left pt-10">

      <div className="space-y-4">
        <div className="text-2xl font-semibold text-slate-200">01</div>
        <h3 className="text-xl font-semibold">Diagnose</h3>
        <p className="text-slate-600 leading-relaxed">
          We analyze your current workflows, systems, and operational
          bottlenecks to identify gaps and inefficiencies.
        </p>
      </div>

      <div className="space-y-4">
        <div className="text-2xl font-semibold text-slate-200">02</div>
        <h3 className="text-xl font-semibold">Design</h3>
        <p className="text-slate-600 leading-relaxed">
          We architect structured systems, automation flows, and CRM
          frameworks tailored to your business model.
        </p>
      </div>

      <div className="space-y-4">
        <div className="text-2xl font-semibold text-slate-200">03</div>
        <h3 className="text-xl font-semibold">Deploy</h3>
        <p className="text-slate-600 leading-relaxed">
          We implement, test, and refine the systems while ensuring
          your team understands and adopts the new structure.
        </p>
      </div>

    </div>

  </div>
</section>
{/* ================= WHY FLOWBRIDGE ================= */}
<section className="py-32 bg-slate-50">
  <div className="max-w-4xl mx-auto px-4 md:px-6 text-center space-y-12">

    <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
      Built for Operators, Not Just Founders
    </h2>

    <p className="text-lg text-slate-600 leading-relaxed">
      Flowbridge Digital is led by a systems architect who understands
      that growth without structure creates chaos.
    </p>

    <p className="text-lg text-slate-600 leading-relaxed">
      We don’t just install tools. We design operational clarity.
      Every engagement is built around sustainable systems,
      measurable execution, and long-term control.
    </p>

    <div className="pt-6">
      <a
        href="https://cal.com/flow-bridge-digital-tee44g/systems-strategy-consultation"
        target="_blank"
        rel="noreferrer"
        className="px-8 py-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all duration-300 shadow-sm hover:shadow-md inline-block"
      >
        Book a Strategy Call
      </a>
    </div>

  </div>
</section>
{/* Outcomes Section */}
<section className="py-24 bg-white">
  <div className="max-w-6xl mx-auto px-4 md:px-6 text-center">
    <h2 className="text-3xl md:text-4xl font-semibold text-gray-900">
      What Changes After We Work Together
    </h2>

    <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
      Structure replaces chaos. Visibility replaces guessing. Growth becomes controlled and repeatable.
    </p>

    <div className="mt-16 grid md:grid-cols-3 gap-12 text-left">
      <div>
        <h3 className="text-xl font-semibold text-gray-900">
          Clear Operational Visibility
        </h3>
        <p className="mt-4 text-gray-600">
          Know exactly where leads, revenue, and bottlenecks exist inside your business.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-900">
          Automated Workflows
        </h3>
        <p className="mt-4 text-gray-600">
          Remove repetitive tasks and connect your systems into one structured ecosystem.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-900">
          Confident Scaling
        </h3>
        <p className="mt-4 text-gray-600">
          Growth no longer feels overwhelming. Systems support expansion instead of breaking under it.
        </p>
      </div>
    </div>
  </div>
</section>
{/* ================= CARE PLAN SECTION ================= */}
<section className="py-24 bg-slate-950 text-white">
  <div className="max-w-6xl mx-auto px-4 md:px-6">
    <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-start">
      <div>
        <p className="uppercase tracking-[0.3em] text-xs text-cyan-200">
          Ongoing Support
        </p>
        <h2 className="mt-5 text-3xl md:text-4xl font-semibold tracking-tight">
          Flowbridge Care Plan
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-slate-300">
          After your CRM, automation, or operational system is live, we help keep
          it clean, optimized, and aligned with how your business grows.
        </p>
        <a
          href="https://cal.com/flow-bridge-digital-tee44g/systems-strategy-consultation"
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-block rounded-xl bg-white px-7 py-4 font-semibold text-slate-950 transition hover:bg-slate-200"
        >
          Discuss ongoing support
        </a>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          {
            title: "Maintain",
            body: "Keep workflows, CRM stages, forms, automations, and connected tools running correctly.",
          },
          {
            title: "Optimize",
            body: "Review system usage, fix bottlenecks, improve follow-up flows, and refine operations monthly.",
          },
          {
            title: "Support",
            body: "Get a structured support lane for updates, light changes, troubleshooting, and advisory calls.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
          >
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              {item.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>
<FAQSection />
        
<div className="bg-gradient-to-b from-slate-50 to-white text-slate-900">

        {/* Final CTA Section */}
        <section className="py-28 bg-slate-900 text-white text-center">
          <div className="max-w-3xl mx-auto px-4 md:px-6">
            <h2 className="text-3xl md:text-4xl font-semibold">
              Ready to Regain Control of Your Operations?
            </h2>
            <p className="mt-6 text-slate-300 text-lg">
              If your business is growing but your systems feel fragile,
              it’s time to rebuild with clarity and structure.
            </p>

            <div className="mt-10">
              <a
                href="https://cal.com/flow-bridge-digital-tee44g/systems-strategy-consultation"
                target="_blank"
                rel="noreferrer"
                className="inline-block bg-white text-slate-900 px-8 py-4 rounded-lg font-medium hover:bg-slate-200 transition"
              >
                Book a Strategy Call
              </a>
            </div>
          </div>
        </section>

      </div>

    </main>
  )
}
