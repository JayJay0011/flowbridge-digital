import Link from "next/link";
import { supabasePublic } from "../lib/supabasePublic";

export const metadata = {
  title: "Blog",
  description:
    "Insights on automation, CRM systems, and growth infrastructure from Flowbridge Digital.",
};

export const revalidate = 0;

type PageProps = {
  searchParams?: Promise<{ page?: string }>;
};

const POSTS_PER_PAGE = 6;

function createBlogPageHref(page: number) {
  return page > 1 ? `/blog?page=${page}` : "/blog";
}

export default async function BlogPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const requestedPage = Number(resolvedSearchParams?.page ?? "1");
  const { data: posts } = await supabasePublic
    .from("blog_posts")
    .select("id,title,slug,excerpt,cover_url,published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  const allPosts = posts ?? [];
  const totalPages = Math.max(1, Math.ceil(allPosts.length / POSTS_PER_PAGE));
  const currentPage = Number.isFinite(requestedPage)
    ? Math.min(Math.max(1, requestedPage), totalPages)
    : 1;
  const pageStart = (currentPage - 1) * POSTS_PER_PAGE;
  const visiblePosts = allPosts.slice(pageStart, pageStart + POSTS_PER_PAGE);

  return (
    <main className="bg-white text-slate-900">
      <section className="py-24 bg-slate-950 text-white">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <p className="uppercase tracking-[0.3em] text-xs text-slate-300">
            Blog
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold mt-6">
            Insights for structured operators.
          </h1>
          <p className="text-xl text-slate-200 mt-6 max-w-3xl">
            Practical guidance on automation, CRM systems, and operational clarity.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-8">
          {visiblePosts.length ? (
            visiblePosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="border border-slate-200 rounded-2xl overflow-hidden bg-white hover:shadow-md transition"
              >
                <div className="aspect-[16/9] bg-slate-100">
                  {post.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.cover_url}
                      alt={post.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">
                      Blog cover
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString()
                      : "Flowbridge Digital"}
                  </p>
                  <h2 className="text-2xl font-semibold mt-3">{post.title}</h2>
                  <p className="text-slate-600 mt-3">{post.excerpt}</p>
                  <div className="mt-4 text-sm font-semibold text-slate-900">
                    Read article →
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="border border-slate-200 rounded-2xl p-6 text-slate-500">
              Blog posts will appear here once published.
            </div>
          )}
        </div>
        {allPosts.length > POSTS_PER_PAGE ? (
          <div className="max-w-5xl mx-auto px-4 md:px-6 mt-10 flex items-center justify-center gap-2">
            <Link
              href={createBlogPageHref(Math.max(1, currentPage - 1))}
              aria-disabled={currentPage === 1}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold ${
                currentPage === 1
                  ? "pointer-events-none border-slate-200 text-slate-300"
                  : "border-slate-300 text-slate-700 hover:border-slate-900"
              }`}
            >
              ←
            </Link>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <Link
                  key={page}
                  href={createBlogPageHref(page)}
                  className={`inline-flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm font-semibold ${
                    page === currentPage
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 text-slate-700 hover:border-slate-900"
                  }`}
                >
                  {page}
                </Link>
              )
            )}
            <Link
              href={createBlogPageHref(Math.min(totalPages, currentPage + 1))}
              aria-disabled={currentPage === totalPages}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold ${
                currentPage === totalPages
                  ? "pointer-events-none border-slate-200 text-slate-300"
                  : "border-slate-300 text-slate-700 hover:border-slate-900"
              }`}
            >
              →
            </Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}
