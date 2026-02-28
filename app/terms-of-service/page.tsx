export const metadata = {
  title: "Terms of Service",
  description:
    "Flowbridge Digital terms of service outlining usage and engagement terms.",
};

export default function TermsOfServicePage() {
  return (
    <main className="bg-white text-slate-900">
      <section className="py-24 bg-slate-950 text-white">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <p className="uppercase tracking-[0.3em] text-xs text-slate-300">
            Legal
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold mt-6">
            Terms of Service
          </h1>
          <p className="text-slate-200 mt-6">
            Last updated: February 28, 2026
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 md:px-6 space-y-10">
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              These Terms of Service ("Terms") govern your access to and use of
              the Flowbridge Digital website and services. By accessing the
              website, you agree to be bound by these Terms.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Use of the Website</h2>
            <p className="text-slate-600 leading-relaxed">
              You agree to use the website only for lawful purposes and in a
              manner that does not infringe the rights of others or restrict or
              inhibit their use and enjoyment.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Services & Engagements</h2>
            <p className="text-slate-600 leading-relaxed">
              Services are provided subject to agreed scopes, timelines, and
              fees outlined in written proposals or contracts. We reserve the
              right to decline engagements that are outside our capacity or
              ethical standards.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Payments & Refunds</h2>
            <p className="text-slate-600 leading-relaxed">
              Payment terms are defined in project agreements or invoices.
              Refunds, if any, are determined based on delivered work and the
              applicable agreement.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Intellectual Property</h2>
            <p className="text-slate-600 leading-relaxed">
              Unless otherwise specified, all materials and content on this
              website are owned by Flowbridge Digital. Client deliverables are
              governed by the project agreement.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Limitation of Liability</h2>
            <p className="text-slate-600 leading-relaxed">
              To the maximum extent permitted by law, Flowbridge Digital shall
              not be liable for any indirect, incidental, or consequential
              damages arising from the use of this website or services.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Changes to Terms</h2>
            <p className="text-slate-600 leading-relaxed">
              We may update these Terms from time to time. Continued use of the
              website after changes constitutes acceptance of the revised Terms.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Contact</h2>
            <p className="text-slate-600 leading-relaxed">
              For questions about these Terms, email{" "}
              <a
                href="mailto:hello@flowbridgedigital.com"
                className="underline"
              >
                hello@flowbridgedigital.com
              </a>
              .
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}
