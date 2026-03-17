import Link from "next/link";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import OrderAction from "./[slug]/order-action";

export const revalidate = 0;
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ package?: string; id?: string; title?: string; price?: string; description?: string; delivery?: string } | undefined>;

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
  const priceFromQuery = resolvedSearchParams?.price?.trim() || "";
  const descriptionFromQuery = resolvedSearchParams?.description?.trim() || "";
  const deliveryFromQuery = resolvedSearchParams?.delivery?.trim() || "";
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
    selectedPackage?.price || priceFromQuery || gig?.price_text || "Custom quote";
  const selectedDescription =
    selectedPackage?.description ||
    descriptionFromQuery ||
    "Scope is confirmed after a short discovery review.";
  const selectedDelivery =
    (selectedPackage?.delivery_days ? `${selectedPackage.delivery_days} day${selectedPackage.delivery_days === 1 ? "" : "s"}` : "") ||
    deliveryFromQuery ||
    gig?.average_delivery ||
    "Confirmed after scope";
  const pageTitle = gig?.title || titleFromQuery;
  const pageSummary = gig?.summary || "Review your package, confirm your details, and continue to payment.";
  const totalPrice = selectedPrice;

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
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-3xl font-semibold tracking-tight">Order details</h2>

            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-6">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Selected package</p>
                  <h3 className="text-2xl font-semibold capitalize text-slate-950">{packageKey}</h3>
                  <p className="max-w-2xl text-base leading-7 text-slate-600">{selectedDescription}</p>
                  <div className="flex flex-wrap gap-3 pt-2 text-sm text-slate-600">
                    <span className="rounded-full bg-slate-100 px-3 py-1">Delivery: {selectedDelivery}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">Agency: Flowbridge Digital</span>
                  </div>
                </div>
                <div className="min-w-[140px] text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Amount</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-950">{selectedPrice}</p>
                </div>
              </div>
            </div>

            {gig?.highlights?.length ? (
              <div className="mt-8">
                <h3 className="text-lg font-semibold">What is included</h3>
                <ul className="mt-4 grid gap-3 text-slate-700 sm:grid-cols-2">
                  {gig.highlights.map((item: string) => (
                    <li
                      key={item}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
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

          <div className="h-fit rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm md:sticky md:top-24">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-3xl font-semibold tracking-tight">Total</h3>
              <div className="text-3xl font-semibold text-slate-950">{totalPrice}</div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-600">Selected package</span>
                  <span className="font-semibold capitalize text-slate-900">{packageKey}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-600">Package price</span>
                  <span className="font-semibold text-slate-900">{selectedPrice}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-600">Service fee</span>
                  <span className="font-semibold text-slate-900">$0</span>
                </div>
                <div className="border-t border-slate-200 pt-4 flex items-center justify-between gap-4 text-base">
                  <span className="font-semibold text-slate-900">Total</span>
                  <span className="font-semibold text-slate-950">{totalPrice}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-600">
              Secure payment is processed only after you confirm the selected package. Once Stripe is connected, clicking <span className="font-semibold text-slate-900">Confirm and pay</span> redirects the client to Stripe Checkout.
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
