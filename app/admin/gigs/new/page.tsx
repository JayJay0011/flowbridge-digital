"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function NewGigPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [priceText, setPriceText] = useState("");
  const [status, setStatus] = useState("draft");
  const [orderFiverrUrl, setOrderFiverrUrl] = useState("");
  const [highlights, setHighlights] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [deliveryDays, setDeliveryDays] = useState("");
  const [basicTitle, setBasicTitle] = useState("");
  const [basicPrice, setBasicPrice] = useState("");
  const [basicDescription, setBasicDescription] = useState("");
  const [basicDelivery, setBasicDelivery] = useState("");
  const [basicFeatures, setBasicFeatures] = useState("");
  const [standardTitle, setStandardTitle] = useState("");
  const [standardPrice, setStandardPrice] = useState("");
  const [standardDescription, setStandardDescription] = useState("");
  const [standardDelivery, setStandardDelivery] = useState("");
  const [standardFeatures, setStandardFeatures] = useState("");
  const [premiumTitle, setPremiumTitle] = useState("");
  const [premiumPrice, setPremiumPrice] = useState("");
  const [premiumDescription, setPremiumDescription] = useState("");
  const [premiumDelivery, setPremiumDelivery] = useState("");
  const [premiumFeatures, setPremiumFeatures] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadFile(file, "covers");
      setCoverUrl(url);
    } catch (uploadError) {
      setError(
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
    setError(null);
    try {
      const urls = await Promise.all(
        files.map((file) => uploadFile(file, "gallery"))
      );
      setGalleryUrls((prev) => [...prev, ...urls]);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Upload failed."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const slug = slugify(title);
    const highlightList = highlights
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const packageBasic = {
      title: basicTitle || null,
      price: basicPrice || null,
      description: basicDescription || null,
      delivery_days: basicDelivery ? Number(basicDelivery) : null,
      features: basicFeatures
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    const packageStandard = {
      title: standardTitle || null,
      price: standardPrice || null,
      description: standardDescription || null,
      delivery_days: standardDelivery ? Number(standardDelivery) : null,
      features: standardFeatures
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    const packagePremium = {
      title: premiumTitle || null,
      price: premiumPrice || null,
      description: premiumDescription || null,
      delivery_days: premiumDelivery ? Number(premiumDelivery) : null,
      features: premiumFeatures
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    const { error: insertError } = await supabase.from("gigs").insert({
      title,
      slug,
      summary,
      price_text: priceText || null,
      status,
      order_fiverr_url: orderFiverrUrl || null,
      highlights: highlightList.length ? highlightList : null,
      cover_url: coverUrl || null,
      gallery_urls: galleryUrls.length ? galleryUrls : null,
      delivery_days: deliveryDays ? Number(deliveryDays) : null,
      package_basic: packageBasic,
      package_standard: packageStandard,
      package_premium: packagePremium,
    });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    router.push("/admin/gigs");
  };

  return (
    <main className="bg-white text-slate-900">
      <section className="py-16 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <h1 className="text-3xl font-semibold">Create New Gig</h1>
          <p className="text-slate-600 mt-2">
            Draft a listing and choose where the order should route.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <form className="grid gap-8" onSubmit={onSubmit}>
            <div className="grid gap-4">
              <label className="text-sm font-medium">Gig Name</label>
              <input
                type="text"
                placeholder="Automation Systems Blueprint"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </div>

            <div className="grid gap-4">
              <label className="text-sm font-medium">Short Description</label>
              <textarea
                rows={4}
                placeholder="Explain what the client gets and the outcomes."
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="grid gap-4">
                <label className="text-sm font-medium">Starting Price</label>
                <input
                  type="text"
                  placeholder="$1,200+"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  value={priceText}
                  onChange={(event) => setPriceText(event.target.value)}
                />
              </div>
              <div className="grid gap-4">
                <label className="text-sm font-medium">Status</label>
                <select
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="grid gap-4">
                <label className="text-sm font-medium">Order on Fiverr URL</label>
                <input
                  type="url"
                  placeholder="https://fiverr.com/your-gig-link"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  value={orderFiverrUrl}
                  onChange={(event) => setOrderFiverrUrl(event.target.value)}
                />
              </div>
              <div className="grid gap-2 text-sm text-slate-500">
                <span className="font-medium text-slate-700">
                  Order Here
                </span>
                <p>
                  Checkout links are automatic. Every gig routes to
                  <span className="font-semibold"> /checkout/[gig-slug]</span>.
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              <label className="text-sm font-medium">Key Outcomes</label>
              <input
                type="text"
                placeholder="Add 3-5 outcome bullets separated by commas"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                value={highlights}
                onChange={(event) => setHighlights(event.target.value)}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="grid gap-4">
                <label className="text-sm font-medium">Cover Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                {coverUrl ? (
                  <p className="text-xs text-slate-500">Cover uploaded ✓</p>
                ) : null}
              </div>
              <div className="grid gap-4">
                <label className="text-sm font-medium">Gallery Images</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryUpload}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                {galleryUrls.length ? (
                  <p className="text-xs text-slate-500">
                    {galleryUrls.length} gallery image
                    {galleryUrls.length > 1 ? "s" : ""} uploaded ✓
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4">
              <label className="text-sm font-medium">Delivery Days</label>
              <input
                type="number"
                placeholder="7"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                value={deliveryDays}
                onChange={(event) => setDeliveryDays(event.target.value)}
              />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {[
                {
                  label: "Basic",
                  title: basicTitle,
                  setTitle: setBasicTitle,
                  price: basicPrice,
                  setPrice: setBasicPrice,
                  description: basicDescription,
                  setDescription: setBasicDescription,
                  delivery: basicDelivery,
                  setDelivery: setBasicDelivery,
                  features: basicFeatures,
                  setFeatures: setBasicFeatures,
                },
                {
                  label: "Standard",
                  title: standardTitle,
                  setTitle: setStandardTitle,
                  price: standardPrice,
                  setPrice: setStandardPrice,
                  description: standardDescription,
                  setDescription: setStandardDescription,
                  delivery: standardDelivery,
                  setDelivery: setStandardDelivery,
                  features: standardFeatures,
                  setFeatures: setStandardFeatures,
                },
                {
                  label: "Premium",
                  title: premiumTitle,
                  setTitle: setPremiumTitle,
                  price: premiumPrice,
                  setPrice: setPremiumPrice,
                  description: premiumDescription,
                  setDescription: setPremiumDescription,
                  delivery: premiumDelivery,
                  setDelivery: setPremiumDelivery,
                  features: premiumFeatures,
                  setFeatures: setPremiumFeatures,
                },
              ].map((pkg) => (
                <div
                  key={pkg.label}
                  className="border border-slate-200 rounded-2xl p-4"
                >
                  <p className="text-sm font-semibold">{pkg.label} package</p>
                  <div className="mt-3 grid gap-3">
                    <input
                      type="text"
                      placeholder="Package title"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                      value={pkg.title}
                      onChange={(event) => pkg.setTitle(event.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="$400"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                      value={pkg.price}
                      onChange={(event) => pkg.setPrice(event.target.value)}
                    />
                    <textarea
                      rows={3}
                      placeholder="Package description"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                      value={pkg.description}
                      onChange={(event) => pkg.setDescription(event.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Delivery days"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                      value={pkg.delivery}
                      onChange={(event) => pkg.setDelivery(event.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Features (comma separated)"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                      value={pkg.features}
                      onChange={(event) => pkg.setFeatures(event.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-4">
              <label className="text-sm font-medium">Slug (auto)</label>
              <input
                type="text"
                value={slugify(title)}
                readOnly
                className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-slate-50 text-slate-500"
              />
            </div>

            {uploading ? (
              <p className="text-sm text-slate-500">Uploading media...</p>
            ) : null}
            {error && <div className="text-sm text-red-600">{error}</div>}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Gig"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
