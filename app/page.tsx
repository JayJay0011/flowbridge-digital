
import Link from "next/link"
import FAQSection from "./components/FAQSection";
import Footer from "./components/Footer"

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Flowbridge Digital",
    url: "https://flowbridgedigital.org",
    description:
      "Automation systems, CRM pipelines, and growth infrastructure for modern operators.",
    sameAs: [],
    makesOffer: [
      {
        "@type": "Service",
        name: "Automation Systems",
      },
      {
        "@type": "Service",
        name: "CRM Pipeline Engineering",
      },
      {
        "@type": "Service",
        name: "Growth Infrastructure",
      },
      {
        "@type": "Service",
        name: "Platform Development",
      },
      {
        "@type": "Service",
        name: "Operational Support",
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
                className="flex-1 rounded-xl px-5 py-4 bg-[var(--background)] text-[var(--foreground)] placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center px-6 py-4 rounded-xl bg-[var(--background)] text-[var(--foreground)] font-semibold hover:bg-slate-100 transition"
              >
                Search
              </button>
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

          <div className="mt-12 flex flex-wrap items-center gap-6 text-slate-300 text-sm">
            <span className="uppercase tracking-[0.2em] text-xs">Trusted by</span>
            <span className="text-slate-200 font-semibold">Meta</span>
            <span className="text-slate-200 font-semibold">Google</span>
            <span className="text-slate-200 font-semibold">PayPal</span>
            <span className="text-slate-200 font-semibold">P&amp;G</span>
            <span className="text-slate-200 font-semibold">Netflix</span>
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
            {[
              {
                title: "Automation Systems",
                desc: "Workflow mapping, integrations, and backend architecture.",
              },
              {
                title: "CRM Pipeline Design",
                desc: "Lifecycle automation and revenue visibility.",
              },
              {
                title: "Growth Infrastructure",
                desc: "Lead capture, nurturing, and conversion systems.",
              },
              {
                title: "Platform Development",
                desc: "Custom dashboards and internal tools.",
              },
              {
                title: "Operational Support",
                desc: "Execution frameworks and support systems.",
              },
              {
                title: "Email Marketing",
                desc: "Segmentation, campaigns, and automations.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="border border-slate-200 rounded-2xl p-6 bg-slate-50 hover:shadow-md transition"
              >
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-slate-600 mt-3 text-sm leading-relaxed">
                  {item.desc}
                </p>
                <Link
                  href="/gigs"
                  className="mt-6 inline-block text-sm font-semibold text-slate-900"
                >
                  View options →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

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
{/* Testimonials Section */}
<section className="py-24 bg-gray-50">
  <div className="max-w-6xl mx-auto px-4 md:px-6 text-center">
    <h2 className="text-3xl md:text-4xl font-semibold text-gray-900">
      Trusted by Operators Across Industries
    </h2>

    <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
      From ecommerce to medical practices, we design systems that bring clarity and structure.
    </p>

    <div className="mt-16 grid md:grid-cols-3 gap-10 text-left">
      
      {/* Ashley */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="aspect-video rounded-xl overflow-hidden">
          <iframe
            src="https://www.youtube.com/embed/qcpyw1omFMQ"
            className="w-full h-full"
            allowFullScreen
          ></iframe>
        </div>
        <h3 className="mt-6 text-lg font-semibold text-gray-900">
          Ashley Bayes
        </h3>
        <p className="text-sm text-gray-500">
          Founder, NavBuddyTM (Driving Instructor)
        </p>
      </div>

      {/* Nicky */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="aspect-video rounded-xl overflow-hidden">
          <iframe
            src="https://www.youtube.com/embed/K6AG2KZ3auI"
            className="w-full h-full"
            allowFullScreen
          ></iframe>
        </div>
        <h3 className="mt-6 text-lg font-semibold text-gray-900">
          Nicky Terrebonne
        </h3>
        <p className="text-sm text-gray-500">
          Ecommerce Store Owner
        </p>
      </div>

      {/* Dr Ayona */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="aspect-video rounded-xl overflow-hidden">
          <iframe
            src="https://www.youtube.com/embed/ExBODRPBiuw"
            className="w-full h-full"
            allowFullScreen
          ></iframe>
        </div>
        <h3 className="mt-6 text-lg font-semibold text-gray-900">
          Dr. Ayona
        </h3>
        <p className="text-sm text-gray-500">
          Founder, Ayona Medspa & Beauty Bar
        </p>
      </div>

    </div>

    <div className="mt-16">
      <a
        href="https://cal.com/flow-bridge-digital-tee44g/systems-strategy-consultation"
        target="_blank"
        rel="noreferrer"
        className="inline-block bg-gray-900 text-white px-8 py-3 rounded-xl hover:bg-gray-800 transition"
      >
        Book a Strategy Call
      </a>
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
                className="inline-block bg-[var(--background)] text-[var(--foreground)] px-8 py-4 rounded-lg font-medium hover:bg-slate-200 transition"
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
