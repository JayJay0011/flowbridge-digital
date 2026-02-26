import Link from "next/link";

export default function DashboardSupportPage() {
  return (
    <section>
      <h2 className="text-2xl font-semibold">Support</h2>
      <p className="text-[var(--dash-muted)] mt-2">
        Reach out to Flowbridge support 24/7. We respond within 1 business day.
      </p>

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="border border-[var(--dash-border)] bg-[var(--dash-surface-2)] rounded-2xl p-6">
          <h3 className="text-lg font-semibold">Message Support</h3>
          <p className="text-[var(--dash-muted)] mt-2">
            Send a message directly to the team.
          </p>
          <Link
            href="/messages/new"
            className="mt-6 inline-flex items-center justify-center px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
          >
            New message
          </Link>
        </div>
        <div className="border border-[var(--dash-border)] bg-[var(--dash-surface-2)] rounded-2xl p-6">
          <h3 className="text-lg font-semibold">Email Support</h3>
          <p className="text-[var(--dash-muted)] mt-2">
            Prefer email? Reach us directly.
          </p>
          <a
            href="mailto:hello@flowbridgedigital.com"
            className="mt-6 inline-flex items-center justify-center px-5 py-3 rounded-xl border border-[var(--dash-border)] font-semibold hover:bg-[var(--dash-surface)] transition"
          >
            Email support
          </a>
        </div>
      </div>
    </section>
  );
}
