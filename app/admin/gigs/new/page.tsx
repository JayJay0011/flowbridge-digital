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
  const [orderHereUrl, setOrderHereUrl] = useState("");
  const [orderFiverrUrl, setOrderFiverrUrl] = useState("");
  const [highlights, setHighlights] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [galleryUrls, setGalleryUrls] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [sellerTitle, setSellerTitle] = useState("");
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

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const slug = slugify(title);
    const highlightList = highlights
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const galleryList = galleryUrls
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
      order_here_url: orderHereUrl || null,
      order_fiverr_url: orderFiverrUrl || null,
      highlights: highlightList.length ? highlightList : null,
      cover_url: coverUrl || null,
      gallery_urls: galleryList.length ? galleryList : null,
      seller_name: sellerName || null,
      seller_title: sellerTitle || null,
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
                <label className="text-sm font-medium">Order Here URL</label>
                <input
                  type="url"
                  placeholder="https://flowbridge.io/checkout/automation-blueprint"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  value={orderHereUrl}
                  onChange={(event) => setOrderHereUrl(event.target.value)}
                />
              </div>
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
            </div>

            <div className="grid gap-4">
              <label className="text-sm font-medium">Highlights</label>
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
                <label className="text-sm font-medium">Cover Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  value={coverUrl}
                  onChange={(event) => setCoverUrl(event.target.value)}
                />
              </div>
              <div className="grid gap-4">
                <label className="text-sm font-medium">
                  Gallery URLs (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="https://..., https://..."
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  value={galleryUrls}
                  onChange={(event) => setGalleryUrls(event.target.value)}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="grid gap-4">
                <label className="text-sm font-medium">Seller Name</label>
                <input
                  type="text"
                  placeholder="Flowbridge Digital"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  value={sellerName}
                  onChange={(event) => setSellerName(event.target.value)}
                />
              </div>
              <div className="grid gap-4">
                <label className="text-sm font-medium">Seller Title</label>
                <input
                  type="text"
                  placeholder="Automation & CRM Systems"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  value={sellerTitle}
                  onChange={(event) => setSellerTitle(event.target.value)}
                />
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

            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}

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
