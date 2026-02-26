import Link from "next/link";
import { supabasePublic } from "../lib/supabasePublic";

export const metadata = {
  title: "Portfolio",
  description:
    "Explore Flowbridge Digital portfolio highlights and systems transformations.",
};

export const revalidate = 0;

export default async function PortfolioPage() {
  const { data: items } = await supabasePublic
    .from("portfolio")
    .select("id,title,slug,summary,cover_url")
    .order("created_at", { ascending: false });

  return (
    <main className="bg-white text-slate-900">
      <section className="py-24 bg-slate-950 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <p className="uppercase tracking-[0.3em] text-xs text-slate-300">
            Portfolio
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold mt-6">
            Proof of systems that scale.
          </h1>
          <p className="text-lg text-slate-200 max-w-3xl mt-6">
            Real projects that show how structured operations and automation
            drive clarity, control, and growth.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          {items?.length ? (
            items.map((item) => (
              <Link
                key={item.id}
                href={`/portfolio/${item.slug}`}
                className="border border-slate-200 rounded-2xl overflow-hidden bg-white hover:shadow-md transition"
              >
                <div className="aspect-[4/3] bg-slate-100">
                  {item.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.cover_url}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">
                      Cover image
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-slate-600 mt-2">{item.summary}</p>
                  <div className="mt-4 text-sm font-semibold text-slate-900">
                    View case →
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="border border-slate-200 rounded-2xl p-6 text-slate-500">
              Portfolio items will appear here once published.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
