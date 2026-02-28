"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  cover_url: string | null;
  status: "draft" | "published";
  published_at: string | null;
};

export default function AdminBlogEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const preview = searchParams.get("preview") === "1";
  const [post, setPost] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id,title,slug,excerpt,body,cover_url,status,published_at")
        .eq("id", params.id)
        .single();
      setPost(data as BlogPost);
    };
    load();
  }, [params.id]);

  const handleSave = async () => {
    if (!post) return;
    setSaving(true);
    setMessage(null);
    const { error } = await supabase
      .from("blog_posts")
      .update({
        title: post.title.trim(),
        slug: post.slug.trim(),
        excerpt: post.excerpt?.trim() || null,
        cover_url: post.cover_url?.trim() || null,
        body: post.body?.trim() || null,
        status: post.status,
        published_at:
          post.status === "published"
            ? post.published_at || new Date().toISOString()
            : null,
      })
      .eq("id", post.id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Changes saved.");
    }
    setSaving(false);
  };

  if (!post) {
    return <div className="text-slate-500">Loading post...</div>;
  }

  if (preview) {
    return (
      <section className="max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Preview
            </p>
            <h2 className="text-3xl font-semibold mt-2">{post.title}</h2>
          </div>
          <button
            type="button"
            onClick={() => router.push(`/admin/blog/${post.id}`)}
            className="text-sm font-semibold text-slate-600"
          >
            Back to edit
          </button>
        </div>
        {post.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_url}
            alt={post.title}
            className="w-full rounded-2xl border border-slate-200 object-cover max-h-[360px]"
          />
        ) : null}
        <p className="text-slate-600">{post.excerpt}</p>
        <div className="space-y-4 text-slate-700 leading-relaxed">
          {(post.body || "").split("\n").map((line, index) => (
            <p key={`${line}-${index}`}>{line}</p>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-3xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Blog
          </p>
          <h2 className="text-3xl font-semibold mt-2">Edit post</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(`/admin/blog/${post.id}?preview=1`)}
            className="text-sm font-semibold text-slate-600"
          >
            Preview
          </button>
          <button
            type="button"
            onClick={() => router.push("/blog/" + post.slug)}
            className="text-sm font-semibold text-slate-600"
          >
            View live
          </button>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="text-sm font-semibold">Title</label>
          <input
            value={post.title}
            onChange={(event) =>
              setPost({ ...post, title: event.target.value })
            }
            className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Slug</label>
          <input
            value={post.slug}
            onChange={(event) =>
              setPost({ ...post, slug: event.target.value })
            }
            className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Excerpt</label>
          <textarea
            value={post.excerpt ?? ""}
            onChange={(event) =>
              setPost({ ...post, excerpt: event.target.value })
            }
            rows={3}
            className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Cover image URL</label>
          <input
            value={post.cover_url ?? ""}
            onChange={(event) =>
              setPost({ ...post, cover_url: event.target.value })
            }
            className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Body</label>
          <textarea
            value={post.body ?? ""}
            onChange={(event) =>
              setPost({ ...post, body: event.target.value })
            }
            rows={10}
            className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Status</label>
          <select
            value={post.status}
            onChange={(event) =>
              setPost({ ...post, status: event.target.value as BlogPost["status"] })
            }
            className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        {message && <p className="text-sm text-emerald-600">{message}</p>}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/blog")}
            className="text-sm font-semibold text-slate-600"
          >
            Back to blog
          </button>
        </div>
      </div>
    </section>
  );
}
