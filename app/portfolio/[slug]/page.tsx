import Link from "next/link";
import { supabasePublic } from "../../lib/supabasePublic";

export const revalidate = 0;

type Params = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Params) {
  const { data: item } = await supabasePublic
    .from("portfolio")
    .select("title,summary")
    .eq("slug", params.slug)
    .single();

  if (!item) {
    return { title: "Portfolio Item" };
  }

  return {
    title: item.title,
    description: item.summary,
  };
}

export default async function PortfolioDetailPage({ params }: Params) {
  const { data: item } = await supabasePublic
    .from("portfolio")
    .select("title,summary,outcomes,cover_url")
    .eq("slug", params.slug)
    .single();

  if (!item) {
    return (
      <main className="bg-[var(--background)] text-[var(--foreground)] py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h1 className="text-3xl font-semibold">Portfolio item not found</h1>
          <p className="mt-4 text-slate-600">
            This project is not available. Browse the portfolio instead.
          </p>
          <Link
            href="/portfolio"
            className="mt-8 inline-block text-sm font-semibold text-slate-900"
          >
            View portfolio →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[var(--background)] text-[var(--foreground)]">
      <section className="py-20 bg-slate-950 text-white">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <p className="uppercase tracking-[0.3em] text-xs text-slate-300">
            Portfolio
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold mt-6">
            {item.title}
          </h1>
          <p className="text-lg text-slate-200 mt-6">{item.summary}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="aspect-[16/9] bg-slate-100 rounded-2xl overflow-hidden">
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

          <div className="mt-12">
            <h2 className="text-2xl font-semibold">Key Outcomes</h2>
            {item.outcomes?.length ? (
              <ul className="mt-6 space-y-3 text-slate-600 list-disc list-inside">
                {item.outcomes.map((outcome: string) => (
                  <li key={outcome}>{outcome}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-slate-600">
                Outcomes will be added soon.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
