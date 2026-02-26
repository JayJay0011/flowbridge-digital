import Link from "next/link";

const cards = [
  {
    title: "Active Orders",
    description: "View current order status and delivery milestones.",
    href: "/dashboard/orders",
  },
  {
    title: "Messages",
    description: "Chat with the Flowbridge team and get updates.",
    href: "/dashboard/messages",
  },
  {
    title: "Support",
    description: "Create a support request or ask for help.",
    href: "/dashboard/support",
  },
];

export default function DashboardPage() {
  return (
    <section>
      <div className="grid md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="border border-[var(--dash-border)] bg-[var(--dash-surface-2)] rounded-2xl p-6 hover:shadow-sm transition"
          >
            <h2 className="text-lg font-semibold">{card.title}</h2>
            <p className="mt-3 text-[var(--dash-muted)]">{card.description}</p>
            <span className="mt-6 inline-flex text-sm font-medium text-[var(--dash-strong)]">
              Open →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
