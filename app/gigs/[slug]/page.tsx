import Link from "next/link";
import { supabasePublic } from "../../lib/supabasePublic";
import PackageTabs from "./PackageTabs";

export const revalidate = 0;

type Params = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Params) {
  const { data: gig } = await supabasePublic
    .from("gigs")
    .select("title,summary")
    .eq("slug", params.slug)
    .single();

  if (!gig) {
    return {
      title: "Gig Not Found",
    };
  }

  return {
    title: gig.title,
    description: gig.summary,
  };
}

export default async function GigDetailPage({ params }: Params) {
  const { data: gig } = await supabasePublic
    .from("gigs")
    .select(
      "title,summary,highlights,order_here_url,order_fiverr_url,price_text,cover_url,gallery_urls,seller_name,seller_title,delivery_days,package_basic,package_standard,package_premium"
    )
    .eq("slug", params.slug)
    .single();

  if (!gig) {
    return (
      <main className="bg-white text-slate-900 py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h1 className="text-3xl font-semibold">Gig not found</h1>
          <p className="mt-4 text-slate-600">
            This gig is not available. Browse all gigs instead.
          </p>
          <Link
            href="/gigs"
            className="mt-8 inline-block text-sm font-medium text-slate-900"
          >
            View all gigs →
          </Link>
        </div>
      </main>
    );
  }

  const images = [gig.cover_url, ...(gig.gallery_urls ?? [])].filter(Boolean);

  return (
    <main className="bg-white text-slate-900">
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6 grid lg:grid-cols-[1.4fr_0.6fr] gap-10">
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Services / Automation
              </p>
              <h1 className="text-3xl md:text-4xl font-semibold mt-4">
                {gig.title}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-700">
                {gig.seller_name
                  ? gig.seller_name.slice(0, 2).toUpperCase()
                  : "FB"}
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {gig.seller_name || "Flowbridge Digital"}
                </p>
                <p className="text-xs text-slate-500">
                  {gig.seller_title || "Automation & CRM Systems"}
                </p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              {images.length ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={images[0] as string}
                  alt={gig.title}
                  className="w-full h-[360px] object-cover"
                />
              ) : (
                <div className="h-[360px] bg-slate-100 flex items-center justify-center text-slate-400">
                  Gig cover
                </div>
              )}
            </div>

            <p className="text-slate-600">{gig.summary}</p>

            <div>
              <h2 className="text-xl font-semibold">What’s included</h2>
              {gig.highlights?.length ? (
                <div className="mt-4 flex flex-wrap gap-3">
                  {gig.highlights.map((item: string) => (
                    <span
                      key={item}
                      className="text-xs px-3 py-2 rounded-full bg-slate-100 text-slate-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-slate-600">
                  Highlights will be added soon.
                </p>
              )}
            </div>

            <div className="flex items-center gap-4">
              {gig.order_fiverr_url ? (
                <a
                  href={gig.order_fiverr_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold"
                >
                  Order on Fiverr
                </a>
              ) : null}
              <Link
                href="/strategy-call"
                className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold"
              >
                Message Flowbridge
              </Link>
            </div>
          </div>

          <aside className="space-y-4">
            <PackageTabs
              basic={gig.package_basic}
              standard={gig.package_standard}
              premium={gig.package_premium}
            />

            <div className="border border-slate-200 rounded-2xl p-5 bg-white">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Delivery
              </div>
              <p className="text-sm text-slate-600 mt-2">
                {gig.delivery_days
                  ? `${gig.delivery_days} days average delivery`
                  : "Timeline confirmed after kickoff"}
              </p>
              <Link
                href={gig.order_here_url || `/checkout/${params.slug}`}
                className="mt-4 inline-flex w-full items-center justify-center px-4 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold"
              >
                Continue
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
