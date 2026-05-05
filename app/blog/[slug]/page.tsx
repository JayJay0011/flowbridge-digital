import Link from "next/link";
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
      <section className="py-20 bg-slate-950 text-white">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <p className="uppercase tracking-[0.3em] text-xs text-slate-300">
            Blog
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold mt-6">
            {post.title}
          </h1>
          <p className="text-slate-200 mt-4">
            {post.published_at
              ? new Date(post.published_at).toLocaleDateString()
              : "Flowbridge Digital"}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          {post.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.cover_url}
              alt={post.title}
              className="w-full rounded-3xl border border-slate-200 object-cover max-h-[420px]"
            />
          ) : null}
          <p className="text-lg text-slate-600 mt-8">{post.excerpt}</p>
          <div className="mt-8 space-y-6 text-lg text-slate-700 leading-8">
            {(post.body || "")
              .split(/\n{2,}/)
              .map((block: string) => block.trim())
              .filter(Boolean)
              .map((block: string, index: number) => (
                <p key={`${block}-${index}`} className="whitespace-pre-line">
                  {block}
                </p>
              ))}
          </div>
        </div>
      </section>
    </main>
  );
}
