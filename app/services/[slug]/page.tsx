import Link from "next/link";
import Image from "next/image";
import { supabasePublic } from "../../lib/supabasePublic";

export const revalidate = 0;

type Params = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

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
    .select("title,description,cover_url")
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
  const coverUrl =
    serviceRecord &&
    "cover_url" in serviceRecord &&
    typeof serviceRecord.cover_url === "string"
      ? serviceRecord.cover_url
      : null;

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

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-6 space-y-6 text-slate-600 leading-relaxed">
          <p>
            We tailor each engagement to your operational needs, aligning
            automation, CRM, and growth systems into a cohesive infrastructure.
          </p>
          <p>
            Book a strategy call to map out the right path for your team.
          </p>
          <Link
            href="/strategy-call"
            className="inline-flex items-center text-sm font-semibold text-slate-900"
          >
            Book a strategy call →
          </Link>
        </div>
      </section>
    </main>
  );
}
