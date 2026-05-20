"use client";

import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function DashboardProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [form, setForm] = useState({
    avatar_url: "",
    company_name: "",
    business_category: "",
    phone: "",
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) return;
      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("avatar_url,company_name,business_category,phone")
        .eq("id", user.id)
        .single();

      if (isMounted) {
        setForm({
          avatar_url: profile?.avatar_url || "",
          company_name: profile?.company_name || "",
          business_category: profile?.business_category || "",
          phone: profile?.phone || "",
        });
        setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user.id;
    if (!userId) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        avatar_url: form.avatar_url || null,
        company_name: form.company_name || null,
        business_category: form.business_category || null,
        phone: form.phone || null,
      })
      .eq("id", userId);

    if (error) {
      const errorMessage = error.message.toLowerCase();
      const schemaError =
        errorMessage.includes("schema") ||
        errorMessage.includes("cache") ||
        errorMessage.includes("column");
      if (
        errorMessage.includes("avatar_url") ||
        errorMessage.includes("business_category") ||
        errorMessage.includes("company_name") ||
        schemaError
      ) {
        const { error: fallbackError } = await supabase
          .from("profiles")
          .update({
            phone: form.phone || null,
          })
          .eq("id", userId);
        if (fallbackError) {
          setMessage(fallbackError.message);
        } else {
          setMessage(
            "Profile updated, but some fields couldn't save. Run the profile fields migration in Supabase and refresh."
          );
        }
      } else {
        setMessage(error.message);
      }
    } else {
      setMessage("Profile updated.");
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please upload an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setMessage("Profile photo must be 3MB or smaller.");
      event.target.value = "";
      return;
    }

    const { data } = await supabase.auth.getSession();
    const session = data.session;
    if (!session) {
      setMessage("Session expired. Please sign in again.");
      return;
    }

    setUploading(true);
    setMessage(null);

    const body = new FormData();
    body.append("file", file);

    const response = await fetch("/api/profile/avatar", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body,
    });

    const result = (await response.json()) as {
      avatarUrl?: string;
      error?: string;
    };

    if (!response.ok || !result.avatarUrl) {
      setMessage(result.error || "Upload failed. Please try again.");
      setUploading(false);
      return;
    }

    setForm((prev) => ({ ...prev, avatar_url: result.avatarUrl || "" }));
    setMessage("Profile photo updated.");
    setUploading(false);
    event.target.value = "";
  };

  if (loading) {
    return <div className="text-[var(--dash-muted)]">Loading profile...</div>;
  }

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold">Profile</h2>
        <p className="mt-2 text-[var(--dash-muted)]">
          Update your company details and profile photo.
        </p>
      </div>

      <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <div className="h-fit rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface-2)] p-6">
          <div className="flex flex-col items-center text-center">
            {form.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.avatar_url}
                alt="Profile avatar"
                className="h-28 w-28 rounded-full border border-[var(--dash-border)] object-cover"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[var(--dash-surface)] text-2xl font-semibold text-[var(--dash-muted)]">
                {(form.company_name || "FB").slice(0, 2).toUpperCase()}
              </div>
            )}
            <label className="mt-5 inline-flex cursor-pointer rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              {uploading ? "Uploading..." : "Upload photo"}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="sr-only"
                disabled={uploading}
              />
            </label>
            <p className="mt-3 text-xs leading-5 text-[var(--dash-muted)]">
              JPG, PNG, or WebP. Max 3MB. The photo saves automatically after upload.
            </p>
            {userId ? (
              <p className="mt-4 break-all text-[11px] text-[var(--dash-muted)]">
                Profile ID: {userId.slice(0, 8)}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Company name</label>
            <input
              type="text"
              className="w-full rounded-xl border border-[var(--dash-border)] bg-transparent px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
              value={form.company_name}
              onChange={(event) =>
                setForm({ ...form, company_name: event.target.value })
              }
              placeholder="Your company"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Business category</label>
            <input
              type="text"
              className="w-full rounded-xl border border-[var(--dash-border)] bg-transparent px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
              value={form.business_category}
              onChange={(event) =>
                setForm({ ...form, business_category: event.target.value })
              }
              placeholder="Ecommerce, SaaS, Agency..."
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Phone</label>
            <input
              type="text"
              className="w-full rounded-xl border border-[var(--dash-border)] bg-transparent px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              placeholder="+1 555 000 0000"
            />
          </div>

          {message && (
            <div className="text-sm text-[var(--dash-muted)]">{message}</div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </section>
  );
}
