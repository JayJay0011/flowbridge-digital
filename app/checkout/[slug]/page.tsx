import Link from "next/link";
import { supabasePublic } from "../../lib/supabasePublic";
import OrderAction from "./order-action";

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
    return { title: "Checkout" };
  }

  return {
    title: `Checkout – ${gig.title}`,
    description: gig.summary,
  };
}

export default async function CheckoutPage({ params }: Params) {
  const { data: gig } = await supabasePublic
    .from("gigs")
    .select("id,title,summary,price_text,highlights,package_basic")
    .eq("slug", params.slug)
    .single();

  if (!gig) {
    return (
      <main className="bg-white text-slate-900 py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h1 className="text-3xl font-semibold">Gig not found</h1>
          <p className="mt-4 text-slate-600">
            The gig you are trying to order does not exist.
          </p>
          <Link
            href="/gigs"
            className="mt-8 inline-block text-sm font-semibold text-slate-900"
          >
            Back to gigs →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white text-slate-900">
      <section className="py-20 bg-slate-950 text-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <p className="uppercase tracking-[0.3em] text-xs text-slate-300">
            Checkout
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold mt-6">
            {gig.title}
          </h1>
          <p className="text-lg text-slate-200 mt-6">{gig.summary}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 md:px-6 grid md:grid-cols-[1.2fr_0.8fr] gap-10">
          <div className="border border-slate-200 rounded-2xl p-8 bg-white">
            <h2 className="text-2xl font-semibold">What you get</h2>
            {gig.highlights?.length ? (
              <ul className="mt-6 space-y-3 text-slate-600 list-disc list-inside">
                {gig.highlights.map((item: string) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-slate-600">
                We will confirm deliverables during onboarding.
              </p>
            )}

            <div className="mt-10">
              <OrderAction gigId={gig.id} />
            </div>
          </div>

          <div className="border border-slate-200 rounded-2xl p-8 bg-slate-50">
            <h3 className="text-lg font-semibold">Order Summary</h3>
            <div className="mt-6 flex items-center justify-between text-sm">
              <span>Starting Price</span>
              <span className="font-semibold text-slate-900">
                {gig.package_basic?.price || gig.price_text || "Custom scope"}
              </span>
            </div>
            <div className="mt-6 border-t border-slate-200 pt-6 text-sm text-slate-600">
              Final pricing is confirmed after discovery. You will receive a
              scope summary before work begins.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
