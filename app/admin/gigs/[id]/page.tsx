"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

type PackageInput = {
  title: string;
  price: string;
  description: string;
  delivery_days: string;
  features: string;
};

type PackageData = {
  title?: string | null;
  price?: string | null;
  description?: string | null;
  delivery_days?: number | null;
  features?: string[] | null;
} | null;

type GigRecord = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  highlights: string[] | null;
  price_text: string | null;
  order_fiverr_url: string | null;
  cover_url: string | null;
  gallery_urls: string[] | null;
  delivery_days: number | null;
  status: "draft" | "published";
  package_basic: PackageData;
  package_standard: PackageData;
  package_premium: PackageData;
};

const toPackageInput = (pkg: PackageData): PackageInput => ({
  title: pkg?.title || "",
  price: pkg?.price || "",
  description: pkg?.description || "",
  delivery_days: pkg?.delivery_days ? String(pkg.delivery_days) : "",
  features: Array.isArray(pkg?.features) ? pkg.features.join(", ") : "",
});

export default function AdminGigEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [gig, setGig] = useState<GigRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [basic, setBasic] = useState<PackageInput>(toPackageInput(null));
  const [standard, setStandard] = useState<PackageInput>(toPackageInput(null));
  const [premium, setPremium] = useState<PackageInput>(toPackageInput(null));
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("gigs")
        .select(
          "id,title,slug,summary,highlights,price_text,order_fiverr_url,cover_url,gallery_urls,delivery_days,status,package_basic,package_standard,package_premium"
        )
        .eq("id", params.id)
        .single();
      if (data) {
        setGig(data as GigRecord);
        setBasic(toPackageInput((data as GigRecord).package_basic));
        setStandard(toPackageInput((data as GigRecord).package_standard));
        setPremium(toPackageInput((data as GigRecord).package_premium));
        setGalleryUrls((data as GigRecord).gallery_urls ?? []);
      }
    };
    load();
  }, [params.id]);

  const highlightText = useMemo(
    () => (gig?.highlights?.join(", ") || ""),
    [gig?.highlights]
  );

  const uploadFile = async (file: File, folder: string) => {
    const safeName = file.name.replace(/\s+/g, "-").toLowerCase();
    const path = `gigs/${folder}/${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from("public-assets")
      .upload(path, file, { upsert: true });
    if (uploadError) {
      throw new Error(uploadError.message);
    }
    const { data } = supabase.storage.from("public-assets").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleCoverUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !gig) return;
    setUploading(true);
    setMessage(null);
    try {
      const url = await uploadFile(file, "covers");
      setGig({ ...gig, cover_url: url });
    } catch (uploadError) {
      setMessage(
        uploadError instanceof Error ? uploadError.message : "Upload failed."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleGalleryUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (!files.length) return;
    setUploading(true);
    setMessage(null);
    try {
      const urls = await Promise.all(
        files.map((file) => uploadFile(file, "gallery"))
      );
      setGalleryUrls((prev) => [...prev, ...urls]);
    } catch (uploadError) {
      setMessage(
        uploadError instanceof Error ? uploadError.message : "Upload failed."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const packagePayload = (pkg: PackageInput) => ({
    title: pkg.title.trim() || null,
    price: pkg.price.trim() || null,
    description: pkg.description.trim() || null,
    delivery_days: pkg.delivery_days ? Number(pkg.delivery_days) : null,
    features: pkg.features
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  });

  const handleSave = async () => {
    if (!gig) return;
    setSaving(true);
    setMessage(null);
    const { error } = await supabase
      .from("gigs")
      .update({
        title: gig.title.trim(),
        slug: gig.slug.trim(),
        summary: gig.summary?.trim() || null,
        price_text: gig.price_text?.trim() || null,
        order_fiverr_url: gig.order_fiverr_url?.trim() || null,
        cover_url: gig.cover_url?.trim() || null,
        gallery_urls: galleryUrls.length ? galleryUrls : null,
        delivery_days: gig.delivery_days ?? null,
        highlights: highlightText
          ? highlightText
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : null,
        status: gig.status,
        package_basic: packagePayload(basic),
        package_standard: packagePayload(standard),
        package_premium: packagePayload(premium),
      })
      .eq("id", gig.id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Changes saved.");
    }
    setSaving(false);
  };

  if (!gig) {
    return <div className="text-slate-500">Loading gig...</div>;
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Gig
          </p>
          <h2 className="text-3xl font-semibold mt-2">{gig.title}</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(`/gigs/${gig.slug}`)}
            className="text-sm font-semibold text-slate-600"
          >
            Preview
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/gigs")}
            className="text-sm font-semibold text-slate-600"
          >
            Back to gigs
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-8">
        <div className="space-y-6 bg-white border border-slate-200 rounded-2xl p-6">
          <div>
            <label className="text-sm font-semibold">Gig title</label>
            <input
              value={gig.title}
              onChange={(event) => setGig({ ...gig, title: event.target.value })}
              className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Slug</label>
            <input
              value={gig.slug}
              onChange={(event) => setGig({ ...gig, slug: event.target.value })}
              className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Summary</label>
            <textarea
              value={gig.summary ?? ""}
              onChange={(event) => setGig({ ...gig, summary: event.target.value })}
              rows={4}
              className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Highlights (comma separated)</label>
            <input
              value={highlightText}
              onChange={(event) =>
                setGig({ ...gig, highlights: event.target.value.split(",") })
              }
              className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold">Cover image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
              />
              {gig.cover_url ? (
                <p className="text-xs text-slate-500 mt-2">
                  Cover uploaded ✓
                </p>
              ) : null}
            </div>
            <div>
              <label className="text-sm font-semibold">Gallery images</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryUpload}
                className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
              />
              {galleryUrls.length ? (
                <p className="text-xs text-slate-500 mt-2">
                  {galleryUrls.length} gallery image
                  {galleryUrls.length > 1 ? "s" : ""} uploaded ✓
                </p>
              ) : null}
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold">Starting price</label>
              <input
                value={gig.price_text ?? ""}
                onChange={(event) =>
                  setGig({ ...gig, price_text: event.target.value })
                }
                className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Delivery days</label>
              <input
                type="number"
                value={gig.delivery_days ?? ""}
                onChange={(event) =>
                  setGig({
                    ...gig,
                    delivery_days: event.target.value
                      ? Number(event.target.value)
                      : null,
                  })
                }
                className="w-full mt-2 border border-slate-200 rounded-xl px-4 py-3"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {[
            { label: "Basic", state: basic, setter: setBasic },
            { label: "Standard", state: standard, setter: setStandard },
            { label: "Premium", state: premium, setter: setPremium },
          ].map((pkg) => (
            <div
              key={pkg.label}
              className="border border-slate-200 rounded-2xl p-5 bg-white"
            >
              <h3 className="text-lg font-semibold">{pkg.label} package</h3>
              <div className="mt-4 space-y-3">
                <input
                  value={pkg.state.title}
                  onChange={(event) =>
                    pkg.setter({ ...pkg.state, title: event.target.value })
                  }
                  placeholder="Package title"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm"
                />
                <input
                  value={pkg.state.price}
                  onChange={(event) =>
                    pkg.setter({ ...pkg.state, price: event.target.value })
                  }
                  placeholder="$400"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm"
                />
                <textarea
                  value={pkg.state.description}
                  onChange={(event) =>
                    pkg.setter({ ...pkg.state, description: event.target.value })
                  }
                  placeholder="Describe this package"
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm"
                />
                <input
                  value={pkg.state.delivery_days}
                  onChange={(event) =>
                    pkg.setter({ ...pkg.state, delivery_days: event.target.value })
                  }
                  placeholder="Delivery days"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm"
                />
                <input
                  value={pkg.state.features}
                  onChange={(event) =>
                    pkg.setter({ ...pkg.state, features: event.target.value })
                  }
                  placeholder="Features (comma separated)"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {uploading ? (
        <p className="text-sm text-slate-500">Uploading media...</p>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
        {message && <p className="text-sm text-emerald-600">{message}</p>}
      </div>
    </section>
  );
}
