import Link from "next/link";

const cards = [
  {
    title: "Gigs",
    desc: "Create and manage service listings, pricing, and Fiverr links.",
    href: "/admin/gigs",
  },
  {
    title: "Portfolio",
    desc: "Publish projects, case studies, and outcome highlights.",
    href: "/admin/portfolio",
  },
  {
    title: "Services",
    desc: "Edit your core services and positioning copy.",
    href: "/admin/services",
  },
  {
    title: "Orders",
    desc: "Track client requests and status (coming next).",
    href: "/admin/orders",
    disabled: false,
  },
  {
    title: "Messages",
    desc: "View client conversations and respond in real time.",
    href: "/admin/messages",
    disabled: false,
  },
  {
    title: "Clients",
    desc: "View client profiles and messages (coming next).",
    href: "#",
    disabled: true,
  },
];

export default function AdminHomePage() {
  return (
    <main className="bg-white text-slate-900">
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold">
                Admin Dashboard
              </h1>
              <p className="mt-3 text-slate-600">
                Manage gigs, portfolio items, and services without editing code.
              </p>
            </div>
            <div className="text-sm text-slate-500">
              Phase 1 of admin tools
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          {cards.map((card) => (
            <div
              key={card.title}
              className="border border-slate-200 rounded-2xl p-6 bg-white"
            >
              <h2 className="text-xl font-semibold">{card.title}</h2>
              <p className="mt-3 text-slate-600">{card.desc}</p>
              {card.disabled ? (
                <div className="mt-6 text-sm text-slate-400">
                  Coming soon
                </div>
              ) : (
                <Link
                  href={card.href}
                  className="mt-6 inline-block text-sm font-medium text-slate-900"
                >
                  Manage →
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
