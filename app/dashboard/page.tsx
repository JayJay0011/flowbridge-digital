import Link from "next/link";

const cards = [
  {
    title: "Orders",
    description: "View current order status and delivery milestones.",
    href: "/dashboard/orders",
  },
  {
    title: "Inbox",
    description: "Chat with the Flowbridge team and get updates.",
    href: "/dashboard/messages",
  },
  {
    title: "Profile",
    description: "Update your company info and profile picture.",
    href: "/dashboard/profile",
  },
];

export default function DashboardPage() {
  return (
    <section className="space-y-8">
      <div className="grid gap-4 md:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface-2)] p-6 md:p-8">
          <p className="text-sm font-semibold text-[var(--dash-muted)]">
            Client portal
          </p>
          <h2 className="mt-3 text-2xl font-semibold md:text-3xl">
            Manage your Flowbridge work from one place.
          </h2>
          <p className="mt-4 max-w-2xl text-[var(--dash-muted)]">
            Track active orders, continue conversations, update your profile,
            and request support without leaving the dashboard.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/gigs"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Browse services
            </Link>
            <Link
              href="/dashboard/messages"
              className="inline-flex items-center justify-center rounded-xl border border-[var(--dash-border)] px-5 py-3 text-sm font-semibold text-[var(--dash-strong)] transition hover:bg-[var(--dash-surface)]"
            >
              Open inbox
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface-2)] p-6">
          <h3 className="text-lg font-semibold">Today</h3>
          <div className="mt-5 space-y-4 text-sm text-[var(--dash-muted)]">
            <div className="flex items-center justify-between gap-4">
              <span>Response window</span>
              <span className="font-semibold text-[var(--dash-strong)]">
                1 business day
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Primary channel</span>
              <span className="font-semibold text-[var(--dash-strong)]">
                Inbox
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Next step</span>
              <span className="font-semibold text-[var(--dash-strong)]">
                Check orders
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface-2)] p-6 transition hover:-translate-y-0.5 hover:shadow-sm"
          >
            <h2 className="text-lg font-semibold">{card.title}</h2>
            <p className="mt-3 text-[var(--dash-muted)]">{card.description}</p>
            <span className="mt-6 inline-flex text-sm font-medium text-[var(--dash-strong)]">
              Open
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
