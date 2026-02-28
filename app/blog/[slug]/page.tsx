import Link from "next/link";
import { supabasePublic } from "../../lib/supabasePublic";

type Params = {
  params: { slug: string };
};

export const revalidate = 0;

export async function generateMetadata({ params }: Params) {
  const { data: post } = await supabasePublic
    .from("blog_posts")
    .select("title,excerpt")
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (!post) {
    return { title: "Article Not Found" };
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Params) {
  const { data: post } = await supabasePublic
    .from("blog_posts")
    .select("title,excerpt,body,cover_url,published_at")
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (!post) {
    return (
      <main className="bg-white text-slate-900 py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h1 className="text-3xl font-semibold">Article not found</h1>
          <p className="mt-4 text-slate-600">
            This article is not available yet.
          </p>
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
          <div className="mt-8 space-y-6 text-slate-700 leading-relaxed">
            {(post.body || "").split("\n").map((line: string, index: number) => (
              <p key={`${line}-${index}`}>{line}</p>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
