import Link from "next/link";
import MediaGallery, { type GalleryMediaItem } from "../../components/MediaGallery";
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
  const mediaItems: GalleryMediaItem[] = [
    item.cover_url
      ? { url: item.cover_url, type: "image", alt: item.title }
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
      <section className="py-20 bg-slate-950 text-white">
        <div className="max-w-5xl mx-auto px-4 md:px-6 space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-300">
            Case Study
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold">{item.title}</h1>
          {item.summary ? (
            <p className="text-lg text-slate-200 max-w-3xl">{item.summary}</p>
          ) : null}
          {item.industry ? (
            <p className="text-sm text-slate-400">Industry: {item.industry}</p>
          ) : null}
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 md:px-6 space-y-10">
          <MediaGallery
            items={mediaItems}
            title={item.title}
            emptyLabel="Cover image"
          />

          {item.results?.length ? (
            <div>
              <h2 className="text-2xl font-semibold">Results</h2>
              <ul className="mt-4 space-y-3 text-slate-600 list-disc list-inside">
                {item.results.map((result: string) => (
                  <li key={result}>{result}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {contentSections.length ? (
            <div className="space-y-10">
              {contentSections.map((section, index) => (
                <CaseStudyContentSection
                  key={`${section.title}-${index}`}
                  section={section}
                />
              ))}
            </div>
          ) : paragraphs.length ? (
            <div className="space-y-4 text-slate-600 leading-relaxed">
              {paragraphs.map((paragraph: string) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <p className="text-slate-600">
              Detailed case study narrative will be added soon.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

function CaseStudyContentSection({ section }: { section: CaseStudySection }) {
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
      className={`rounded-2xl p-6 md:p-8 ${
        isDark ? "bg-slate-900 text-white" : isLight ? "bg-slate-50" : "bg-white"
      }`}
    >
      <h2 className="text-2xl font-semibold">{section.title}</h2>
      {section.body ? (
        <p
          className={`mt-4 leading-8 ${
            isDark ? "text-slate-300" : "text-slate-600"
          }`}
        >
          {section.body}
        </p>
      ) : null}
      {section.items?.length ? (
        <div className={`mt-6 grid ${columns} gap-5`}>
          {section.items.map((item, index) => {
            if (typeof item === "string") {
              return (
                <p
                  key={`${item}-${index}`}
                  className={isDark ? "text-slate-300" : "text-slate-600"}
                >
                  • {item}
                </p>
              );
            }
            return (
              <div key={`${item.title}-${index}`}>
                <h3
                  className={`font-semibold ${
                    isDark ? "text-white" : "text-slate-950"
                  }`}
                >
                  {item.title}
                </h3>
                {item.body ? (
                  <p className={`mt-2 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                    {item.body}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
