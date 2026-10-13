import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://flowbridgedigital.org";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/auth/",
          "/checkout/",
          "/dashboard/",
          "/login",
          "/messages/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
