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
            Last updated: October 12, 2026
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 md:px-6 space-y-10">
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              These Terms of Service (&quot;Terms&quot;) govern your access to and
              use of the Flowbridge Digital website and services. By accessing
              the website, you agree to be bound by these Terms.
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
            <h2 className="text-2xl font-semibold">Referral Attribution</h2>
            <p className="text-slate-600 leading-relaxed">
              When you use a referral link or code, we may associate the
              resulting account or qualifying order with the referring user.
              Referral benefits apply only when they are expressly offered,
              have no cash value unless stated otherwise, and cannot be
              transferred or combined unless the promotion permits it.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Refunds & Cancellations</h2>
            <p className="text-slate-600 leading-relaxed">
              Cancellation and refund eligibility depends on the agreed scope,
              work already completed, committed project costs, and any terms
              shown in the applicable gig, custom offer, or written agreement.
              Requests are reviewed fairly on their facts and do not limit any
              rights that cannot be excluded under applicable law.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">
              Delivery Acceptance & Revisions
            </h2>
            <p className="text-slate-600 leading-relaxed">
              A delivery may be approved or returned with a revision request
              through the order page. Included revisions are limited to the
              number and original scope stated in the selected package, custom
              offer, or written agreement. New requirements or work outside
              that scope may require a separate quote and timeline.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">
              Ownership & Intellectual Property
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Once the applicable order is paid in full, ownership of the
              final, specifically commissioned deliverables transfers to the
              client unless the agreement says otherwise. Flowbridge Digital
              retains ownership of its pre-existing methods, templates, tools,
              reusable components, and know-how. Third-party materials remain
              subject to their own licence terms.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Chargebacks & Disputes</h2>
            <p className="text-slate-600 leading-relaxed">
              Please contact us promptly if you believe a charge is incorrect
              so we can investigate and try to resolve it. If a chargeback or
              payment dispute is opened, we may pause the related work and
              provide the payment provider with relevant order, delivery, and
              communication records. This does not affect rights available
              under applicable law.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">
              Client Information & Project Delays
            </h2>
            <p className="text-slate-600 leading-relaxed">
              You are responsible for providing accurate information, access,
              feedback, and approvals reasonably needed to perform the work.
              Delivery dates may be extended when required information or
              access is incomplete, inaccurate, or delayed. Any material
              change to scope or timing will be communicated through the order
              or project conversation.
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
                href="mailto:support@flowbridgedigital.org"
                className="underline"
              >
                support@flowbridgedigital.org
              </a>
              .
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}
