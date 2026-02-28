import Image from "next/image";
import Link from "next/link";

export default function EcommerceAutomationCaseStudy() {
  return (
    <main className="bg-white text-slate-900">

      {/* HERO */}
      <section className="py-28 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <h1 className="text-4xl md:text-5xl font-semibold mb-6">
            Ecommerce Automation Infrastructure
          </h1>

          <p className="text-lg text-slate-600 max-w-3xl">
            Designing structured backend systems to eliminate order confusion,
            automate fulfillment workflows, and create real-time operational visibility.
          </p>
        </div>
      </section>

      {/* CONTEXT */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-semibold mb-6">
            The Challenge
          </h2>

          <p className="text-slate-600 text-lg mb-6">
            A growing ecommerce brand was experiencing order tracking gaps,
            manual follow-ups, fragmented CRM logic, and delayed fulfillment processes.
          </p>

          <p className="text-slate-600 text-lg">
            As order volume increased, operational clarity decreased.
          </p>
        </div>
      </section>

      {/* MOCKUP 1 */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-semibold mb-12">
            Centralized Revenue & Order Dashboard
          </h2>

          <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200">
            <Image
              src="/ecommerce-dashboard.png"
              alt="Ecommerce analytics dashboard mockup"
              width={1400}
              height={900}
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* MOCKUP 2 */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-semibold mb-12">
            CRM & Automation Flow Structuring
          </h2>

          <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200">
            <Image
              src="/ecommerce-crm.png"
              alt="CRM automation flow mockup"
              width={1400}
              height={900}
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* MOCKUP 3 */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-semibold mb-12">
            Order Fulfillment Automation Pipeline
          </h2>

          <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200">
            <Image
              src="/ecommerce-order-automation.png"
              alt="Order automation workflow mockup"
              width={1400}
              height={900}
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-semibold mb-8">
            Implementation Results
          </h2>

          <ul className="space-y-4 text-slate-600 text-lg">
            <li>• 100% automated order status tracking</li>
            <li>• Real-time dashboard visibility</li>
            <li>• Reduced manual admin workload</li>
            <li>• Structured CRM tagging & lifecycle flows</li>
            <li>• Faster fulfillment coordination</li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 bg-slate-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-semibold mb-6">
            Ready to Structure Your Ecommerce Operations?
          </h2>

          <Link
            href="/contact"
            className="inline-block bg-white text-slate-900 px-10 py-4 rounded-xl font-medium hover:bg-slate-100 transition"
          >
            Book a Systems Consultation
          </Link>
        </div>
      </section>

    </main>
  );
}
