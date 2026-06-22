import Link from "next/link";
import MediaGallery from "../../components/MediaGallery";
import { supabasePublic } from "../../lib/supabasePublic";

type Params = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 0;
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const BLOG_DETAIL_COLUMNS = "title,excerpt,body,cover_url,published_at,slug";

type BlogPost = {
  title: string;
  excerpt: string | null;
  body: string | null;
  cover_url: string | null;
  published_at: string | null;
  slug: string;
};

function normalizeSlug(value: string) {
  return decodeURIComponent(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

function formatDate(value?: string | null) {
  if (!value) return "Flowbridge Digital";
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getArticleBlocks(body?: string | null) {
  return (body || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function isHeading(block: string) {
  const hasEndingPunctuation = /[.!?]$/.test(block);
  const wordCount = block.split(/\s+/).length;
  return wordCount <= 12 && !hasEndingPunctuation;
}

function isListItem(block: string) {
  const wordCount = block.split(/\s+/).length;
  return wordCount <= 9 && !/[.!?]$/.test(block) && !block.includes(":");
}

function renderArticleBlock(block: string, index: number) {
  if (isHeading(block)) {
    return (
      <h2
        key={`${block}-${index}`}
        className="pt-8 text-2xl md:text-3xl font-semibold tracking-tight text-slate-950"
      >
        {block}
      </h2>
    );
  }

  if (isListItem(block)) {
    return (
      <p
        key={`${block}-${index}`}
        className="flex gap-3 text-base md:text-lg leading-8 text-slate-700"
      >
        <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-900" />
        <span>{block}</span>
      </p>
    );
  }

  return (
    <p
      key={`${block}-${index}`}
      className="text-base md:text-lg leading-8 md:leading-9 text-slate-700"
    >
      {block}
    </p>
  );
}

async function getPublishedPost(rawSlug: string) {
  const slug = decodeURIComponent(rawSlug).trim();
  const normalizedSlug = normalizeSlug(slug);

  const { data: exactPost, error: exactError } = await supabasePublic
    .from("blog_posts")
    .select(BLOG_DETAIL_COLUMNS)
    .eq("slug", slug)
    .eq("status", "published")
    .limit(1)
    .maybeSingle();

  if (exactPost) {
    return { post: exactPost as BlogPost, error: null };
  }

  const { data: publishedPosts, error: listError } = await supabasePublic
    .from("blog_posts")
    .select(BLOG_DETAIL_COLUMNS)
    .eq("status", "published")
    .limit(200);

  const post =
    (publishedPosts as BlogPost[] | null)?.find(
      (item) => normalizeSlug(item.slug ?? "") === normalizedSlug
    ) ?? null;

  return { post, error: exactError || listError };
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const { post } = await getPublishedPost(slug);

  if (!post) {
    return { title: "Article Not Found" };
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const { post, error } = await getPublishedPost(slug);
  const articleBlocks = getArticleBlocks(post?.body);

  if (!post) {
    return (
      <main className="bg-white text-slate-900 py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h1 className="text-3xl font-semibold">Article not found</h1>
          <p className="mt-4 text-slate-600">
            This article is not available yet.
          </p>
          {error ? (
            <p className="mt-2 text-xs text-slate-500">{error.message}</p>
          ) : null}
          <Link href="/blog" className="mt-6 inline-block text-sm font-semibold">
            View all articles →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white text-slate-900">
      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-4xl px-4 py-20 md:px-6 md:py-24">
          <Link
            href="/blog"
            className="inline-flex text-sm font-semibold text-slate-300 transition hover:text-white"
          >
            Back to blog
          </Link>
          <div className="mt-10 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.22em] text-slate-400">
            <span>Flowbridge Digital</span>
            <span className="h-1 w-1 rounded-full bg-slate-500" />
            <span>{formatDate(post.published_at)}</span>
          </div>
          <h1 className="mt-6 text-4xl font-semibold leading-tight md:text-6xl md:leading-[1.05]">
            {post.title}
          </h1>
          {post.excerpt ? (
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-200 md:text-xl">
              {post.excerpt}
            </p>
          ) : null}
        </div>
      </section>

      <section className="py-12 md:py-16">
        <article className="mx-auto max-w-3xl px-4 md:px-6">
          {post.cover_url ? (
            <MediaGallery
              items={[{ url: post.cover_url, type: "image", alt: post.title }]}
              title={post.title}
            />
          ) : null}

          {post.excerpt ? (
            <p className="mt-10 border-l-4 border-slate-900 pl-5 text-xl font-medium leading-9 text-slate-900">
              {post.excerpt}
            </p>
          ) : null}

          <div className="mt-10 space-y-5">
            {articleBlocks.length ? (
              articleBlocks.map(renderArticleBlock)
            ) : (
              <p className="text-lg leading-8 text-slate-700">
                This article is being prepared.
              </p>
            )}
          </div>

          <div className="mt-16 rounded-2xl border border-slate-200 bg-slate-50 p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-slate-950">
              Need this kind of system in your business?
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Flowbridge helps service businesses structure CRM, automation, and
              follow-up systems so leads, clients, and operations stop slipping
              through the cracks.
            </p>
            <Link
              href="/strategy-call"
              className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Book a strategy call
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
