import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "About",
  description:
    "Learn how Flowbridge Digital builds structured automation, CRM, and operational systems for modern businesses.",
};

export default function AboutPage() {
  return (
    <main className="bg-white text-slate-900">

      {/* HERO */}
      <section className="py-24 bg-slate-950 text-white">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

          <div>
            <p className="uppercase tracking-[0.3em] text-xs text-slate-300">
              About
            </p>
            <h1 className="text-4xl md:text-5xl font-semibold mb-6 mt-6">
              Building Structured Digital Infrastructure for Modern Businesses
            </h1>

            <p className="text-xl text-slate-200 max-w-xl">
              Flowbridge Digital was founded to help growing companies regain
              operational clarity. We design backend systems, automation
              architecture, and structured digital platforms that support
              scalable growth.
            </p>

            <div className="mt-8">
              <a
                href="https://cal.com/flow-bridge-digital-tee44g/systems-strategy-consultation"
                target="_blank"
                rel="noreferrer"
                className="inline-block bg-white text-slate-900 px-8 py-4 rounded-xl hover:bg-slate-100 transition"
              >
                Book a Strategy Call
              </a>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <Image
              src="/jay.jpg"
              alt="Founder of Flowbridge Digital"
              width={400}
              height={500}
              className="rounded-2xl shadow-2xl object-cover border border-slate-700"
            />
          </div>

        </div>
      </section>

      {/* WHY FLOWBRIDGE EXISTS */}
      <section className="py-20 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-semibold mb-8">
            Why Flowbridge Digital Exists
          </h2>

          <div className="space-y-6 text-slate-600 text-lg">
            <p>
              Many businesses reach a growth ceiling not because of lack of
              demand — but because of operational chaos.
            </p>

            <p>
              Disconnected tools. Manual follow-ups. Missed leads. Poor
              pipeline visibility. Repetitive admin work.
            </p>

            <p>
              Growth becomes fragile instead of scalable.
            </p>

            <p>
              Flowbridge Digital was built to solve that exact problem —
              by designing structured systems that remove friction,
              increase clarity, and create backend stability.
            </p>
          </div>
        </div>
      </section>

      {/* FOUNDER BACKGROUND */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-semibold mb-8">
            Founder & Systems Architect
          </h2>

          <div className="space-y-6 text-slate-600 text-lg">
            <p>
              Flowbridge Digital is led by a systems-focused consultant
              specializing in automation architecture, CRM engineering,
              workflow optimization, and digital platform development.
            </p>

            <p>
              With experience across automation platforms, API integrations,
              web applications, and structured backend systems, the focus
              is not simply on tools — but on operational design.
            </p>

            <p>
              Every engagement begins with understanding the operational
              bottlenecks inside a business before recommending
              implementation.
            </p>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-semibold mb-12 text-center">
            Our Philosophy
          </h2>

          <div className="grid md:grid-cols-3 gap-12 text-center">

            <div>
              <h3 className="text-xl font-semibold mb-4">
                Structure Over Chaos
              </h3>
              <p className="text-slate-600">
                Systems should simplify growth — not complicate it.
                Clarity creates confidence.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">
                Automation With Purpose
              </h3>
              <p className="text-slate-600">
                Automation is not about replacing people.
                It’s about removing friction from execution.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">
                Scalability From Day One
              </h3>
              <p className="text-slate-600">
                Every system is designed with long-term growth
                and infrastructure stability in mind.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="py-28 bg-slate-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-semibold mb-6">
            Ready to Bring Structure to Your Business?
          </h2>

          <Link
            href="/contact"
            className="inline-block bg-white text-slate-900 px-10 py-4 rounded-xl hover:bg-slate-200 transition"
          >
            Schedule a Consultation
          </Link>
        </div>
      </section>

    </main>
  );
}
