import Link from "next/link";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import OrderAction from "./[slug]/order-action";

export const revalidate = 0;
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ package?: string; id?: string; title?: string } | undefined>;

const CHECKOUT_GIG_COLUMNS = `
  id,
  title,
  slug,
  status,
  summary,
  highlights,
  price_text,
  average_delivery,
  package_basic,
  package_standard,
  package_premium
`;

async function resolveGig(gigId?: string) {
  if (!gigId) return null;

  const { data } = await supabaseAdmin
    .from("gigs")
    .select(CHECKOUT_GIG_COLUMNS)
    .eq("id", gigId)
    .maybeSingle();

  if (!data) return null;
  if (data.status && data.status !== "published") return null;
  return data;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const titleFromQuery = resolvedSearchParams?.title?.trim() || "Selected service";
  const gig = await resolveGig(resolvedSearchParams?.id?.trim());

  return {
    title: `Checkout - ${gig?.title || titleFromQuery}`,
    description: gig?.summary || "Review your package and continue to payment.",
  };
}

export default async function CheckoutRootPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const gigId = resolvedSearchParams?.id?.trim() || "";
  const titleFromQuery = resolvedSearchParams?.title?.trim() || "Selected service";
  const gig = gigId ? await resolveGig(gigId) : null;

  const packageKey =
    resolvedSearchParams?.package === "standard" ||
    resolvedSearchParams?.package === "premium"
      ? resolvedSearchParams.package
      : "basic";

  const selectedPackage = gig
    ? packageKey === "standard"
      ? gig.package_standard
      : packageKey === "premium"
        ? gig.package_premium
        : gig.package_basic
    : null;

  const selectedPrice =
    selectedPackage?.price || gig?.price_text || "Price confirmed after scope review";
  const selectedDescription =
    selectedPackage?.description ||
    "Scope is confirmed after a short discovery review.";
  const selectedDelivery =
    selectedPackage?.delivery || gig?.average_delivery || "Confirmed after scope";
  const pageTitle = gig?.title || titleFromQuery;
  const pageSummary = gig?.summary || "Review your package, confirm your details, and continue to payment.";

  return (
    <main className="bg-white text-slate-900">
      <section className="bg-slate-950 py-20 text-white">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-300">
            Checkout
          </p>
          <h1 className="mt-6 text-4xl font-semibold md:text-5xl">
            {pageTitle}
          </h1>
          <p className="mt-6 max-w-3xl text-lg text-slate-200">{pageSummary}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-[1.15fr_0.85fr] md:px-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <h2 className="text-2xl font-semibold">Order details</h2>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Selected package
              </p>
              <div className="mt-3 flex items-start justify-between gap-4">
                <div>
                  <p className="text-2xl font-semibold capitalize">{packageKey}</p>
                  <p className="mt-2 max-w-xl text-sm text-slate-600">
                    {selectedDescription}
                  </p>
                </div>
                <p className="whitespace-nowrap text-xl font-semibold">
                  {selectedPrice}
                </p>
              </div>
            </div>

            {gig?.highlights?.length ? (
              <div className="mt-8">
                <h3 className="text-lg font-semibold">Included in this order</h3>
                <ul className="mt-4 grid gap-3 text-slate-700 sm:grid-cols-2">
                  {gig.highlights.map((item: string) => (
                    <li
                      key={item}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-10">
              {gigId ? <OrderAction gigId={gigId} packageKey={packageKey} /> : <p className="text-sm text-red-600">Missing gig reference. Please return to the gig page and try again.</p>}
            </div>
          </div>

          <div className="h-fit rounded-2xl border border-slate-200 bg-slate-50 p-8">
            <h3 className="text-lg font-semibold">Order summary</h3>

            <div className="mt-6 space-y-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-600">Selected package</span>
                <span className="font-semibold capitalize text-slate-900">
                  {packageKey}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-600">Price</span>
                <span className="font-semibold text-slate-900">
                  {selectedPrice}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-600">Delivery</span>
                <span className="font-semibold text-slate-900">
                  {selectedDelivery}
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-600">
              Final pricing and scope are confirmed before work begins. If the
              project needs a custom buildout, we align deliverables during
              onboarding.
            </div>

            <Link
              href={gig ? `/gigs/${gig.slug}?id=${gig.id}&package=${packageKey}` : `/gigs`}
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-900"
            >
              Back to gig
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
