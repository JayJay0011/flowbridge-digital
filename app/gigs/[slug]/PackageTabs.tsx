"use client";

import { useState } from "react";

type PackageInfo = {
  title?: string | null;
  price?: string | null;
  description?: string | null;
  delivery_days?: number | null;
  features?: string[] | null;
};

type Props = {
  basic?: PackageInfo | null;
  standard?: PackageInfo | null;
  premium?: PackageInfo | null;
};

const tabs = [
  { key: "basic", label: "Basic" },
  { key: "standard", label: "Standard" },
  { key: "premium", label: "Premium" },
] as const;

export default function PackageTabs({ basic, standard, premium }: Props) {
  const [active, setActive] = useState<typeof tabs[number]["key"]>("basic");

  const pkg =
    active === "basic" ? basic : active === "standard" ? standard : premium;

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
      <div className="grid grid-cols-3 text-sm font-semibold text-slate-500 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={`py-3 ${
              active === tab.key
                ? "text-slate-900 border-b-2 border-slate-900"
                : "hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold">
            {pkg?.title || "Package"}
          </h3>
          <p className="text-2xl font-semibold mt-2">
            {pkg?.price || "Custom"}
          </p>
        </div>
        {pkg?.description ? (
          <p className="text-sm text-slate-600">{pkg.description}</p>
        ) : null}
        {pkg?.delivery_days ? (
          <div className="text-xs text-slate-500">
            {pkg.delivery_days}-day delivery
          </div>
        ) : null}
        {pkg?.features?.length ? (
          <ul className="space-y-2 text-sm text-slate-600">
            {pkg.features.map((feature) => (
              <li key={feature}>• {feature}</li>
            ))}
          </ul>
        ) : null}
        <button className="w-full mt-4 bg-slate-900 text-white py-3 rounded-xl font-semibold">
          Continue
        </button>
      </div>
    </div>
  );
}
