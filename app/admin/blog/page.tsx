"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadPosts = async () => {
    const { data } = await supabase
      .from("blog_posts")
      .select("id,title,slug,status,published_at,created_at")
      .order("created_at", { ascending: false });
    setPosts((data ?? []) as BlogPost[]);
    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return posts;
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.slug.toLowerCase().includes(query)
    );
  }, [posts, search]);

  const togglePublish = async (post: BlogPost) => {
    const nextStatus = post.status === "published" ? "draft" : "published";
    const publishedAt = nextStatus === "published" ? new Date().toISOString() : null;
    const { data, error } = await supabase
      .from("blog_posts")
      .update({ status: nextStatus, published_at: publishedAt })
      .eq("id", post.id)
      .select("id,title,slug,status,published_at,created_at")
      .single();
    if (!error && data) {
      setPosts((prev) =>
        prev.map((item) => (item.id === post.id ? (data as BlogPost) : item))
      );
    }
  };

  return (
    <section className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold">Blog</h2>
          <p className="text-slate-600 mt-2">
            Create, edit, and publish Flowbridge articles.
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold"
        >
          New post
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search posts"
          className="w-full md:max-w-sm border border-slate-200 rounded-xl px-4 py-3 text-sm"
        />
        <Link
          href="/blog"
          className="text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          Preview live blog →
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-6 text-slate-500">Loading posts...</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-slate-500">No posts yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((post) => (
              <div
                key={post.id}
                className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    {post.status}
                  </p>
                  <h3 className="text-lg font-semibold mt-2">{post.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">/{post.slug}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/admin/blog/${post.id}`}
                    className="text-sm font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/admin/blog/${post.id}?preview=1`}
                    className="text-sm font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Preview
                  </Link>
                  <button
                    type="button"
                    onClick={() => togglePublish(post)}
                    className="text-sm font-semibold px-4 py-2 rounded-lg border border-slate-200"
                  >
                    {post.status === "published" ? "Unpublish" : "Publish"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
