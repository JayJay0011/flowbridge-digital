const STRATEGY_CALL_URL =
  "https://cal.com/flow-bridge-digital-tee44g/systems-strategy-consultation";

export const metadata = {
  title: "Email Marketing Automation and Lifecycle Campaigns",
  description:
    "Email marketing strategy, segmentation, campaigns, lifecycle automation, and retention systems from Flowbridge Digital.",
  keywords: ["email marketing automation", "lifecycle email campaigns", "email segmentation strategy", "customer retention automation"],
  alternates: { canonical: "/services/email-marketing" },
  openGraph: {
    title: "Email Marketing Automation and Lifecycle Campaigns | Flowbridge Digital",
    description: "Build segmented campaigns and lifecycle automations around the complete customer journey.",
    url: "/services/email-marketing",
    images: ["/api/og?title=Email+marketing+automation&subtitle=Lifecycle+campaigns%2C+segmentation%2C+and+retention+systems"],
  },
};

const capabilities = [
  {
    title: "Lifecycle Automation",
    body: "Welcome, nurture, onboarding, re-engagement, and post-purchase flows built around real customer stages.",
  },
  {
    title: "Campaign Systems",
    body: "A repeatable campaign calendar, audience rules, templates, and approval workflow for consistent sending.",
  },
  {
    title: "Segmentation & Personalization",
    body: "Useful segments based on behaviour, lifecycle stage, interests, and purchase activity instead of one broad list.",
  },
  {
    title: "Reporting & Optimization",
    body: "Clear performance tracking for deliverability, engagement, conversion, and the flows that need improvement.",
  },
];

export default function EmailMarketingPage() {
  return (
    <main className="bg-white text-slate-900">
      <section className="bg-slate-950 py-24 text-white md:py-28">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">
            Email Marketing
          </p>
          <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">
            Email systems built around the complete customer journey.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300 md:text-xl">
            We design campaigns, segmentation, lifecycle automations, and
            reporting that help you follow up consistently and retain more of
            the customers you already worked to acquire.
          </p>
          <a
            href={STRATEGY_CALL_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-10 inline-flex rounded-xl bg-white px-7 py-4 font-semibold text-slate-950 transition hover:bg-slate-200"
          >
            Book an Email Strategy Call
          </a>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold md:text-4xl">What we can build</h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              The exact scope is agreed before work begins and can cover one
              focused improvement or a complete email marketing foundation.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {capabilities.map((item) => (
              <article key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-7">
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-4 leading-relaxed text-slate-600">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-2 md:px-6">
          <div>
            <h2 className="text-3xl font-semibold">Designed for your stack</h2>
            <p className="mt-5 leading-8 text-slate-600">
              We work with platforms such as Klaviyo, HubSpot, Brevo,
              ActiveCampaign, Mailchimp, MailerLite, and connected CRM or
              ecommerce systems.
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-semibold">Built for measurable use</h2>
            <p className="mt-5 leading-8 text-slate-600">
              You receive a system your team can operate: documented flows,
              clear audiences, campaign structure, and reporting that supports
              ongoing decisions.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 text-center">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <h2 className="text-3xl font-semibold">
            Ready to improve your email customer journey?
          </h2>
          <a
            href={STRATEGY_CALL_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex rounded-xl bg-slate-900 px-8 py-4 font-semibold text-white transition hover:bg-slate-800"
          >
            Book a Strategy Call
          </a>
        </div>
      </section>
    </main>
  );
}
