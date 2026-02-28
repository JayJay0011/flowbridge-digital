"use client";

import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function DashboardProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
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

    setUploading(true);
    setMessage(null);

    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user.id;
    if (!userId) return;

    const fileExt = file.name.split(".").pop();
    const filePath = `avatars/${userId}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("public-assets")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      if (uploadError.message.toLowerCase().includes("not found")) {
        setMessage(
          "Upload failed. Please confirm the Supabase storage bucket 'public-assets' exists."
        );
      } else {
        setMessage(uploadError.message);
      }
      setUploading(false);
      return;
    }

    const { data: publicUrl } = supabase.storage
      .from("public-assets")
      .getPublicUrl(filePath);

    setForm((prev) => ({ ...prev, avatar_url: publicUrl.publicUrl }));
    setUploading(false);
  };

  if (loading) {
    return <div className="text-[var(--dash-muted)]">Loading profile...</div>;
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold">Profile</h2>
      <p className="text-[var(--dash-muted)] mt-2">
        Update your company details and avatar.
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-6 max-w-xl">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Profile photo (upload)</label>
          <p className="text-xs text-[var(--dash-muted)]">
            Upload an image file. No URL needed.
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="w-full border border-dashed border-[var(--dash-border)] rounded-xl px-4 py-3 text-sm text-[var(--dash-muted)] bg-transparent"
          />
          {form.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.avatar_url}
              alt="Profile avatar"
              className="h-16 w-16 rounded-full object-cover border border-[var(--dash-border)]"
            />
          ) : null}
          {uploading ? (
            <p className="text-xs text-[var(--dash-muted)]">Uploading...</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Company name</label>
          <input
            type="text"
            className="w-full border border-[var(--dash-border)] bg-transparent rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
            value={form.company_name}
            onChange={(event) => setForm({ ...form, company_name: event.target.value })}
            placeholder="Your company"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Business category</label>
          <input
            type="text"
            className="w-full border border-[var(--dash-border)] bg-transparent rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
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
            className="w-full border border-[var(--dash-border)] bg-transparent rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            placeholder="+1 555 000 0000"
          />
        </div>

        {message && <div className="text-sm text-[var(--dash-muted)]">{message}</div>}

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </section>
  );
}
