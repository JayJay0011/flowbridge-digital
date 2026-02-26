import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
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
    "/gigs",
    "/about",
    "/how-we-work",
    "/case-studies",
    "/case-studies/ecommerce-automation",
    "/case-studies/medspa-crm-rebuild",
    "/case-studies/internal-operations",
    "/strategy-call",
  ];

  const now = new Date();

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
