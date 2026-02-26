import Link from "next/link";
import { supabasePublic } from "../../lib/supabasePublic";

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
      "title,summary,highlights,order_here_url,order_fiverr_url,price_text"
    )
    .eq("slug", params.slug)
    .single();

  if (!gig) {
    return (
      <main className="bg-white text-slate-900 py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
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

  return (
    <main className="bg-white text-slate-900">
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-[1.3fr_0.7fr] gap-10">
          <div>
            <p className="text-sm text-slate-500 uppercase tracking-[0.2em]">
              About this gig
            </p>
            <h1 className="text-4xl md:text-5xl font-semibold mt-4">
              {gig.title}
            </h1>
            <p className="mt-6 text-lg text-slate-600">{gig.summary}</p>

            <div className="mt-10">
              <h2 className="text-xl font-semibold">What You Get</h2>
              {gig.highlights?.length ? (
                <ul className="mt-6 space-y-3 text-slate-600 list-disc list-inside">
                  {gig.highlights.map((item: string) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-slate-600">
                  Highlights will be added soon.
                </p>
              )}
            </div>
          </div>

          <aside className="border border-slate-200 rounded-2xl p-6 bg-white shadow-sm h-fit">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Package</h3>
              <span className="text-sm text-slate-500">Standard</span>
            </div>
            <p className="text-2xl font-semibold mt-4 text-slate-900">
              {gig.price_text || "Custom scope"}
            </p>
            <p className="text-sm text-slate-600 mt-2">
              Full build plan with scoped deliverables and timeline.
            </p>

            <div className="mt-6 space-y-2 text-sm text-slate-600">
              <div>• Discovery + audit</div>
              <div>• System design</div>
              <div>• Implementation plan</div>
            </div>

            <div className="mt-8 grid gap-3">
              <Link
                href={gig.order_here_url || `/checkout/${params.slug}`}
                className="px-6 py-3 bg-slate-900 text-white rounded-xl text-center font-semibold hover:bg-slate-800 transition"
              >
                Continue
              </Link>
              {gig.order_fiverr_url ? (
                <a
                  href={gig.order_fiverr_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3 border border-slate-300 rounded-xl text-center hover:bg-slate-50 transition"
                >
                  Order on Fiverr
                </a>
              ) : null}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <Link
                href="/strategy-call"
                className="w-full inline-flex items-center justify-center px-6 py-3 border border-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
              >
                Message Flowbridge
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
