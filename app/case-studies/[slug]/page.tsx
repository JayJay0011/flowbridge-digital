import Link from "next/link";
import MediaGallery, { type GalleryMediaItem } from "../../components/MediaGallery";
import { getCaseStudyCoverUrl } from "../../lib/caseStudyAssets";
import { supabasePublic } from "../../lib/supabasePublic";

export const revalidate = 0;

type Params = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const CASE_STUDY_DETAIL_COLUMNS =
  "title,summary,industry,body,cover_url,gallery_urls,content_sections,results,slug";
const BASE_CASE_STUDY_DETAIL_COLUMNS =
  "title,summary,industry,body,cover_url,results,slug";

type CaseStudySection = {
  title: string;
  body?: string;
  variant?: "light" | "dark" | "white";
  columns?: 1 | 2 | 3;
  items?: Array<string | { title: string; body?: string }>;
};

type CaseStudy = {
  title: string;
  summary: string | null;
  industry: string | null;
  body: string | null;
  cover_url: string | null;
  gallery_urls?: string[] | null;
  content_sections?: CaseStudySection[] | null;
  results: string[] | null;
  slug: string;
};

function normalizeSlug(value: string) {
  return decodeURIComponent(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

async function getPublishedCaseStudy(rawSlug: string) {
  const slug = decodeURIComponent(rawSlug).trim();
  const normalizedSlug = normalizeSlug(slug);

  let { data: exactItem, error: exactError } = await supabasePublic
    .from("case_studies")
    .select(CASE_STUDY_DETAIL_COLUMNS)
    .eq("slug", slug)
    .eq("status", "published")
    .limit(1)
    .maybeSingle();

  if (exactError?.message.includes("gallery_urls")) {
    const fallback = await supabasePublic
      .from("case_studies")
      .select(BASE_CASE_STUDY_DETAIL_COLUMNS)
      .eq("slug", slug)
      .eq("status", "published")
      .limit(1)
      .maybeSingle();
    exactItem = fallback.data as typeof exactItem;
    exactError = fallback.error;
  }

  if (exactItem) {
    return { item: exactItem as CaseStudy, error: null };
  }

  let { data: publishedItems, error: listError } = await supabasePublic
    .from("case_studies")
    .select(CASE_STUDY_DETAIL_COLUMNS)
    .eq("status", "published")
    .limit(200);

  if (listError?.message.includes("gallery_urls")) {
    const fallback = await supabasePublic
      .from("case_studies")
      .select(BASE_CASE_STUDY_DETAIL_COLUMNS)
      .eq("status", "published")
      .limit(200);
    publishedItems = fallback.data as typeof publishedItems;
    listError = fallback.error;
  }

  const item =
    (publishedItems as CaseStudy[] | null)?.find(
      (entry) => normalizeSlug(entry.slug ?? "") === normalizedSlug
    ) ?? null;

  return { item, error: exactError || listError };
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const { item } = await getPublishedCaseStudy(slug);

  if (!item) {
    return { title: "Case Study" };
  }

  return {
    title: item.title,
    description: item.summary,
  };
}

export default async function CaseStudyDetailPage({ params }: Params) {
  const { slug } = await params;
  const { item, error } = await getPublishedCaseStudy(slug);

  if (!item) {
    return (
      <main className="bg-white text-slate-900 py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h1 className="text-3xl font-semibold">Case study not found</h1>
          <p className="mt-4 text-slate-600">
            This case study is not available. Browse all case studies instead.
          </p>
          {error ? (
            <p className="mt-2 text-xs text-slate-500">{error.message}</p>
          ) : null}
          <Link
            href="/case-studies"
            className="mt-8 inline-block text-sm font-semibold text-slate-900"
          >
            View case studies →
          </Link>
        </div>
      </main>
    );
  }

  const paragraphs = item.body
    ? item.body
        .split("\n")
        .map((entry: string) => entry.trim())
        .filter(Boolean)
    : [];
  const coverUrl = getCaseStudyCoverUrl(item.slug, item.cover_url);
  const mediaItems: GalleryMediaItem[] = [
    coverUrl
      ? { url: coverUrl, type: "image", alt: item.title }
      : null,
    ...(item.gallery_urls ?? []).map((url) => ({
      url,
      type: "image" as const,
      alt: item.title,
    })),
  ].filter(Boolean) as GalleryMediaItem[];
  const contentSections = Array.isArray(item.content_sections)
    ? item.content_sections
    : [];

  return (
    <main className="bg-white text-slate-900">
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 grid gap-14 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm uppercase tracking-widest text-slate-500 mb-4">
              Case Study
            </p>
            <h1 className="text-4xl md:text-5xl font-semibold mb-6 leading-tight">
              {item.title}
            </h1>
            {item.summary ? (
              <p className="text-lg text-slate-600 mb-8">{item.summary}</p>
            ) : null}
            <Link
              href="/contact"
              className="inline-block bg-slate-900 text-white px-8 py-4 rounded-xl hover:bg-slate-800 transition"
            >
              Book a Systems Consultation
            </Link>
          </div>

          <MediaGallery
            items={mediaItems}
            title={item.title}
            emptyLabel="Cover image"
            className="rounded-2xl shadow-xl"
          />
        </div>
      </section>

      {item.industry || paragraphs.length ? (
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-semibold mb-8">Business Context</h2>
            {item.industry ? (
              <p className="mb-6 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                {item.industry}
              </p>
            ) : null}
            <div className="space-y-5 text-lg leading-8 text-slate-600">
              {(paragraphs.length ? paragraphs : item.summary ? [item.summary] : []).map(
                (paragraph: string) => (
                  <p key={paragraph}>{paragraph}</p>
                )
              )}
            </div>
          </div>
        </section>
      ) : null}

      {contentSections.length ? (
        <div>
          {contentSections.map((section, index) => (
            <CaseStudyContentSection
              key={`${section.title}-${index}`}
              section={section}
              index={index}
            />
          ))}
        </div>
      ) : null}

      {item.results?.length ? (
        <section className="py-24 bg-slate-900 text-white">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-semibold mb-12">
              Operational Outcomes
            </h2>
            <div className="grid gap-6 text-lg text-slate-300 md:grid-cols-2">
              {item.results.map((result: string) => (
                <p key={result}>• {result}</p>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="py-28 text-center bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-semibold mb-6">
            Ready to Rebuild Your Operational Systems?
          </h2>
          <Link
            href="/contact"
            className="inline-block bg-slate-900 text-white px-10 py-4 rounded-xl hover:bg-slate-800 transition"
          >
            Book a Systems Consultation
          </Link>
        </div>
      </section>
    </main>
  );
}

function CaseStudyContentSection({
  section,
  index,
}: {
  section: CaseStudySection;
  index: number;
}) {
  const isDark = section.variant === "dark";
  const isLight = section.variant === "light";
  const columns =
    section.columns === 3
      ? "md:grid-cols-3"
      : section.columns === 2
        ? "md:grid-cols-2"
        : "grid-cols-1";

  return (
    <section
      className={`py-24 ${
        isDark
          ? "bg-slate-900 text-white"
          : isLight || index % 2 === 1
            ? "bg-slate-50"
            : "bg-white"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-semibold mb-8">{section.title}</h2>
        {section.body ? (
          <p
            className={`max-w-4xl text-lg leading-8 ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            {section.body}
          </p>
        ) : null}
        {section.items?.length ? (
          <div className={`mt-10 grid ${columns} gap-8 text-lg`}>
            {section.items.map((item, itemIndex) => {
              if (typeof item === "string") {
                return (
                  <p
                    key={`${item}-${itemIndex}`}
                    className={isDark ? "text-slate-300" : "text-slate-600"}
                  >
                    • {item}
                  </p>
                );
              }
              return (
                <div key={`${item.title}-${itemIndex}`}>
                  <h3
                    className={`text-xl font-semibold ${
                      isDark ? "text-white" : "text-slate-950"
                    }`}
                  >
                    {item.title}
                  </h3>
                  {item.body ? (
                    <p
                      className={`mt-3 leading-8 ${
                        isDark ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      {item.body}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
