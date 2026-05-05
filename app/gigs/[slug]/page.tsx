import Link from "next/link";
import { supabasePublic } from "../../lib/supabasePublic";
import PackageTabs from "./PackageTabs";

export const revalidate = 0;
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const GIG_DETAIL_COLUMNS = `
  id,
  title,
  slug,
  status,
  summary,
  price_text,
  highlights,
  cover_url,
  gallery_urls,
  delivery_days,
  order_fiverr_url,
  package_basic,
  package_standard,
  package_premium
`;

type Params = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ id?: string }>;
};

type GigRecord = {
  id: string;
  title: string;
  slug: string;
  status: string;
  summary: string | null;
  price_text: string | null;
  highlights: string[] | null;
  cover_url: string | null;
  gallery_urls: string[] | null;
  delivery_days: number | null;
  order_fiverr_url: string | null;
  package_basic: {
    title?: string | null;
    price?: string | null;
    description?: string | null;
    delivery_days?: number | null;
    features?: string[] | null;
  } | null;
  package_standard: {
    title?: string | null;
    price?: string | null;
    description?: string | null;
    delivery_days?: number | null;
    features?: string[] | null;
  } | null;
  package_premium: {
    title?: string | null;
    price?: string | null;
    description?: string | null;
    delivery_days?: number | null;
    features?: string[] | null;
  } | null;
};

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

function summaryToParagraphs(summary?: string | null) {
  if (!summary) return [];
  if (summary.includes("\n")) {
    return summary
      .split("\n")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return summary
    .split(".")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => `${entry}.`);
}

export async function generateMetadata({ params }: Params) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const { data: gig } = await supabasePublic
    .from("gigs")
    .select("title,summary,status,slug")
    .eq("slug", slug)
    .eq("status", "published")
    .limit(1)
    .maybeSingle();

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

export default async function GigDetailPage({ params, searchParams }: Params) {
  const { slug: rawSlug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const slug = decodeURIComponent(rawSlug).trim();
  const normalizedSlug = normalizeSlug(slug);
  const gigId = resolvedSearchParams?.id?.trim() || "";

  let gig: GigRecord | null = null;

  if (gigId) {
    const { data: idMatch } = await supabasePublic
      .from("gigs")
      .select(GIG_DETAIL_COLUMNS)
      .eq("id", gigId)
      .eq("status", "published")
      .limit(1)
      .maybeSingle();
    if (idMatch) {
      gig = idMatch;
    }
  }

  const { data: exactGig, error: exactError } = gig
    ? { data: gig, error: null }
    : await supabasePublic
        .from("gigs")
        .select(GIG_DETAIL_COLUMNS)
        .eq("slug", slug)
        .eq("status", "published")
        .limit(1)
        .maybeSingle();

  gig = exactGig;

  if (!gig) {
    const { data: publishedGigs, error: listError } = await supabasePublic
      .from("gigs")
      .select(GIG_DETAIL_COLUMNS)
      .eq("status", "published")
      .limit(200);

    gig =
      (publishedGigs as GigRecord[] | null)?.find((item: GigRecord) => {
        const itemSlug = normalizeSlug(item.slug ?? "");
        return (
          itemSlug === normalizedSlug ||
          itemSlug.startsWith(normalizedSlug) ||
          normalizedSlug.startsWith(itemSlug)
        );
      }) ?? null;

    if (!gig && (exactError || listError)) {
      return (
        <main className="bg-white text-slate-900 py-24 min-h-[60vh]">
          <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
            <h1 className="text-3xl font-semibold">Gig lookup error</h1>
            <p className="mt-4 text-slate-600">
              The gig could not be loaded due to a data access error.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {exactError?.message || listError?.message}
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
  }

  if (!gig) {
    return (
      <main className="bg-white text-slate-900 py-24 min-h-[60vh]">
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
  const summaryParagraphs = summaryToParagraphs(gig.summary);

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
                FB
              </div>
              <div>
                <p className="text-sm font-semibold">Flowbridge Digital</p>
                <p className="text-xs text-slate-500">
                  Automation &amp; CRM Systems
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

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Service overview</h2>
              {summaryParagraphs.length ? (
                <div className="space-y-4 text-slate-700 leading-relaxed">
                  {summaryParagraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600">
                  We will confirm scope and outcomes during kickoff.
                </p>
              )}
            </section>

            <div>
              <h2 className="text-xl font-semibold">What’s included</h2>
              {gig.highlights?.length ? (
                <div className="mt-4 grid sm:grid-cols-2 gap-3">
                  {gig.highlights.map((item: string) => (
                    <div
                      key={item}
                      className="text-sm px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-slate-600">
                  Highlights will be added soon.
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Delivery
                </p>
                <p className="mt-3 text-sm text-slate-700">
                  {gig.delivery_days
                    ? `${gig.delivery_days} day average delivery`
                    : "Timeline confirmed after scope review"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Best for
                </p>
                <p className="mt-3 text-sm text-slate-700">
                  Teams that need cleaner operations, faster follow-up, and a more reliable backend.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Next step
                </p>
                <p className="mt-3 text-sm text-slate-700">
                  Choose a package, continue to checkout, and confirm scope before kickoff.
                </p>
              </div>
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
                href={`/messages/new?source=gig&gigId=${gig.id}&gigTitle=${encodeURIComponent(gig.title)}`}
                className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold"
              >
                Message Flowbridge
              </Link>
            </div>
          </div>

          <aside className="space-y-4">
            <PackageTabs
              gigId={gig.id}
              gigTitle={gig.title}
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
                href={`/messages/new?source=gig&gigId=${gig.id}&gigTitle=${encodeURIComponent(gig.title)}&package=custom`}
                className="mt-4 inline-flex w-full items-center justify-center px-4 py-3 rounded-xl border border-slate-300 text-slate-900 text-sm font-semibold"
              >
                Contact us for custom offer
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
