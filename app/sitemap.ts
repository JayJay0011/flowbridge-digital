import type { MetadataRoute } from "next";
import { supabasePublic } from "./lib/supabasePublic";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://flowbridgedigital.org";

  const routes = [
    "/",
    "/services",
    "/services/automation-systems-architecture",
    "/services/crm-pipeline",
    "/services/growth-infrastructure",
    "/services/platform-development",
    "/services/operational-support",
    "/services/email-marketing",
    "/gigs",
    "/portfolio",
    "/blog",
    "/reviews",
    "/about",
    "/how-we-work",
    "/contact",
    "/case-studies",
    "/case-studies/ecommerce-automation",
    "/case-studies/medspa-crm-rebuild",
    "/case-studies/internal-operations",
    "/privacy-policy",
    "/terms-of-service",
    "/strategy-call",
  ];

  const [gigsResult, postsResult, portfolioResult, casesResult] =
    await Promise.all([
      supabasePublic
        .from("gigs")
        .select("slug,created_at")
        .eq("status", "published"),
      supabasePublic
        .from("blog_posts")
        .select("slug,published_at,updated_at")
        .eq("status", "published"),
      supabasePublic
        .from("portfolio")
        .select("slug,created_at")
        .eq("status", "published"),
      supabasePublic
        .from("case_studies")
        .select("slug,created_at")
        .eq("status", "published"),
    ]);

  const dynamicEntries: MetadataRoute.Sitemap = [
    ...(gigsResult.data ?? []).map((item) => ({
      url: `${siteUrl}/gigs/${item.slug}`,
      lastModified: item.created_at ? new Date(item.created_at) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...(postsResult.data ?? []).map((item) => ({
      url: `${siteUrl}/blog/${item.slug}`,
      lastModified: item.updated_at
        ? new Date(item.updated_at)
        : item.published_at
          ? new Date(item.published_at)
          : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
    ...(portfolioResult.data ?? []).map((item) => ({
      url: `${siteUrl}/portfolio/${item.slug}`,
      lastModified: item.created_at ? new Date(item.created_at) : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...(casesResult.data ?? []).map((item) => ({
      url: `${siteUrl}/case-studies/${item.slug}`,
      lastModified: item.created_at ? new Date(item.created_at) : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
  ];

  const staticEntries: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${siteUrl}${route}`,
    changeFrequency: "weekly",
    priority: route === "/" ? 1 : 0.7,
  }));

  return Array.from(
    new Map(
      [...staticEntries, ...dynamicEntries].map((entry) => [entry.url, entry]),
    ).values(),
  );
}
