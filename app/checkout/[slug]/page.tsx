import Link from "next/link";
import { supabasePublic } from "../../lib/supabasePublic";
import OrderAction from "./order-action";

export const revalidate = 0;
export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ slug: string }>;
};

type SearchParams = Promise<{ package?: string; id?: string } | undefined>;

type PageProps = Params & { searchParams?: SearchParams };

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

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-");
}

async function resolveGig(slug: string, gigId?: string) {
  if (gigId) {
    const { data: byId } = await supabasePublic
      .from("gigs")
      .select(CHECKOUT_GIG_COLUMNS)
      .eq("id", gigId)
      .eq("status", "published")
      .maybeSingle();

    if (byId) {
      return byId;
    }
  }

  const { data: bySlug } = await supabasePublic
    .from("gigs")
    .select(CHECKOUT_GIG_COLUMNS)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (bySlug) {
    return bySlug;
  }

  const normalizedSlug = normalizeSlug(slug);
  const { data: publishedGigs } = await supabasePublic
    .from("gigs")
    .select(CHECKOUT_GIG_COLUMNS)
    .eq("status", "published");

  return (
    publishedGigs?.find(
      (item) => normalizeSlug(item.slug || "") === normalizedSlug,
    ) || null
  );
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: SearchParams;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const gig = await resolveGig(
    decodeURIComponent(resolvedParams.slug),
    resolvedSearchParams?.id?.trim(),
  );

  if (!gig) {
    return { title: "Checkout" };
  }

  return {
    title: `Checkout - ${gig.title}`,
    description: gig.summary,
  };
}

export default async function CheckoutPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const slug = decodeURIComponent(resolvedParams.slug);
  const gigId = resolvedSearchParams?.id?.trim() || "";
  const gig = await resolveGig(slug, gigId);

  if (!gig) {
    return (
      <main className="bg-white text-slate-900 py-24 min-h-[70vh]">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h1 className="text-3xl font-semibold">Gig not found</h1>
          <p className="mt-4 text-slate-600">
            The gig you are trying to order does not exist.
          </p>
          <Link
            href="/gigs"
            className="mt-8 inline-block text-sm font-semibold text-slate-900"
          >
            Back to gigs -&gt;
          </Link>
        </div>
      </main>
    );
  }

  const packageKey =
    resolvedSearchParams?.package === "standard" ||
    resolvedSearchParams?.package === "premium"
      ? resolvedSearchParams.package
      : "basic";

  const selectedPackage =
    packageKey === "standard"
      ? gig.package_standard
      : packageKey === "premium"
        ? gig.package_premium
        : gig.package_basic;

  const selectedPrice =
    selectedPackage?.price || gig.price_text || "Custom scope";
  const selectedDescription =
    selectedPackage?.description ||
    "Scope is confirmed after a short discovery review.";
  const selectedDelivery =
    selectedPackage?.delivery || gig.average_delivery || "Confirmed after scope";

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
          <p className="text-lg text-slate-200 mt-6 max-w-3xl">{gig.summary}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 md:px-6 grid md:grid-cols-[1.15fr_0.85fr] gap-10">
          <div className="border border-slate-200 rounded-2xl p-8 bg-white">
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

            {gig.highlights?.length ? (
              <div className="mt-8">
                <h3 className="text-lg font-semibold">Included in this order</h3>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2 text-slate-700">
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
              <OrderAction gigId={gig.id} packageKey={packageKey} />
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
              href={`/gigs/${gig.slug}?id=${gig.id}&package=${packageKey}`}
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
