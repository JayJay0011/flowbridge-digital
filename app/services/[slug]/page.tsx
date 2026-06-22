import Link from "next/link";
import Image from "next/image";
import { supabasePublic } from "../../lib/supabasePublic";

export const revalidate = 0;

type Params = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type ServiceSection = {
  title: string;
  body?: string;
  variant?: "light" | "dark" | "white";
  columns?: 1 | 2 | 4;
  items?: Array<string | { title: string; body?: string }>;
};

type ServiceRecord = {
  title: string;
  description: string | null;
  cover_url?: string | null;
  cta_label?: string | null;
  cta_url?: string | null;
  content_sections?: ServiceSection[] | null;
};

const STRATEGY_CALL_URL =
  "https://cal.com/flow-bridge-digital-tee44g/systems-strategy-consultation";

export async function generateMetadata({ params }: Params) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug).trim();
  const { data: service } = await supabasePublic
    .from("services")
    .select("title,description")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();

  if (!service) {
    return { title: "Service" };
  }

  return {
    title: service.title,
    description: service.description,
  };
}

export default async function ServiceDetailPage({ params }: Params) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug).trim();
  const { data: service, error } = await supabasePublic
    .from("services")
    .select("title,description,cover_url,cta_label,cta_url,content_sections")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();
  const serviceRecord = error?.message.includes("cover_url")
    ? (
        await supabasePublic
          .from("services")
          .select("title,description")
          .eq("slug", slug)
          .limit(1)
          .maybeSingle()
      ).data
    : service;
  const serviceItem = serviceRecord as ServiceRecord | null;
  const coverUrl =
    serviceRecord &&
    "cover_url" in serviceRecord &&
    typeof serviceRecord.cover_url === "string"
      ? serviceRecord.cover_url
      : null;
  const contentSections = Array.isArray(serviceItem?.content_sections)
    ? serviceItem.content_sections
    : [];
  const ctaLabel = serviceItem?.cta_label || "Book a Strategy Call";
  const ctaUrl = serviceItem?.cta_url || STRATEGY_CALL_URL;

  if (!serviceRecord) {
    return (
      <main className="bg-white text-slate-900 py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h1 className="text-3xl font-semibold">Service not found</h1>
          <p className="mt-4 text-slate-600">
            This service is not available. Browse all services instead.
          </p>
          <Link
            href="/services"
            className="mt-8 inline-block text-sm font-semibold text-slate-900"
          >
            View services →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white text-slate-900">
      <section className="py-24 bg-slate-950 text-white">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <p className="uppercase tracking-[0.3em] text-xs text-slate-300">
            Service
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold mt-6">
            {serviceRecord.title}
          </h1>
          {serviceRecord.description ? (
            <p className="text-xl text-slate-200 max-w-3xl mt-6">
              {serviceRecord.description}
            </p>
          ) : null}
          <div className="mt-10">
            <a
              href={ctaUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              {ctaLabel}
            </a>
          </div>
          {coverUrl ? (
            <div className="relative mt-10 aspect-[16/7] overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
              <Image
                src={coverUrl}
                alt=""
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 960px"
              />
            </div>
          ) : null}
        </div>
      </section>

      {contentSections.length ? (
        contentSections.map((section, index) => (
          <ServiceContentSection key={`${section.title}-${index}`} section={section} />
        ))
      ) : (
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 md:px-6 space-y-6 text-slate-600 leading-relaxed">
            <p>
              We tailor each engagement to your operational needs, aligning
              automation, CRM, and growth systems into a cohesive infrastructure.
            </p>
            <p>Book a strategy call to map out the right path for your team.</p>
            <Link
              href="/strategy-call"
              className="inline-flex items-center text-sm font-semibold text-slate-900"
            >
              Book a strategy call →
            </Link>
          </div>
        </section>
      )}

      <section className="py-24 text-center">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-semibold">
            Ready to build this system properly?
          </h2>
          <a
            href={ctaUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex rounded-xl bg-slate-900 px-8 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            {ctaLabel}
          </a>
        </div>
      </section>
    </main>
  );
}

function ServiceContentSection({ section }: { section: ServiceSection }) {
  const isDark = section.variant === "dark";
  const isLight = section.variant === "light";
  const columns =
    section.columns === 4
      ? "md:grid-cols-4"
      : section.columns === 2
        ? "md:grid-cols-2"
        : "grid-cols-1";

  return (
    <section
      className={`py-24 ${
        isDark ? "bg-slate-900 text-white" : isLight ? "bg-slate-50" : "bg-white"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-semibold mb-10">{section.title}</h2>
        {section.body ? (
          <p
            className={`max-w-4xl text-lg leading-8 ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            {section.body}
          </p>
        ) : null}
        {section.items?.length ? (
          <div className={`grid ${columns} gap-8 ${section.body ? "mt-10" : ""}`}>
            {section.items.map((item, index) => {
              if (typeof item === "string") {
                return (
                  <p
                    key={`${item}-${index}`}
                    className={`text-lg ${isDark ? "text-slate-300" : "text-slate-600"}`}
                  >
                    • {item}
                  </p>
                );
              }
              return (
                <div key={`${item.title}-${index}`}>
                  <h3
                    className={`font-semibold mb-2 ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {item.title}
                  </h3>
                  {item.body ? (
                    <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                      {item.body}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
