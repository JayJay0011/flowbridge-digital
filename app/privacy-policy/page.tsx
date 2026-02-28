export const metadata = {
  title: "Privacy Policy",
  description:
    "Flowbridge Digital privacy policy covering data collection, usage, and user rights.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-white text-slate-900">
      <section className="py-24 bg-slate-950 text-white">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <p className="uppercase tracking-[0.3em] text-xs text-slate-300">
            Legal
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold mt-6">
            Privacy Policy
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
              This Privacy Policy explains how Flowbridge Digital ("we", "us",
              "our") collects, uses, and protects your information when you
              visit our website or use our services.
            </p>
            <p>
              By using our website, you agree to the collection and use of
              information in accordance with this policy.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Information We Collect</h2>
            <ul className="space-y-3 text-slate-600">
              <li>
                Contact details such as name, email address, phone number, and
                company information when you submit forms or create an account.
              </li>
              <li>
                Usage data including pages visited, time on site, and device
                information.
              </li>
              <li>
                Communications you send us via forms, chat, or email.
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">How We Use Information</h2>
            <ul className="space-y-3 text-slate-600">
              <li>Provide and improve our services.</li>
              <li>Respond to inquiries and support requests.</li>
              <li>Send service updates or important notices.</li>
              <li>Analyze website usage to improve performance.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Sharing of Information</h2>
            <p className="text-slate-600 leading-relaxed">
              We do not sell your personal information. We may share data with
              trusted service providers who help us operate the website and
              deliver services, under confidentiality obligations.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Data Security</h2>
            <p className="text-slate-600 leading-relaxed">
              We implement reasonable security measures to protect your
              information. However, no method of transmission over the internet
              is 100% secure.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Your Rights</h2>
            <p className="text-slate-600 leading-relaxed">
              You may request access, correction, or deletion of your personal
              information by contacting us.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Contact</h2>
            <p className="text-slate-600 leading-relaxed">
              For privacy questions, email{" "}
              <a
                href="mailto:hello@flowbridgedigital.com"
                className="underline"
              >
                hello@flowbridgedigital.com
              </a>
              .
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
            Please review and customize this policy to match your legal
            requirements and business practices.
          </div>
        </div>
      </section>
    </main>
  );
}
