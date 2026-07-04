const CASE_STUDY_COVER_FALLBACKS: Record<string, string> = {
  "medspa-crm-rebuild": "/medspa-crm-pipeline.png",
  "ecommerce-automation": "/ecommerce-dashboard.png",
  "internal-operations": "/internal-ops-dashboard.png",
};

const MISSING_LOCAL_ASSETS = new Set(["/medspa-mockup.png"]);

export function getCaseStudyCoverUrl(
  slug: string | null | undefined,
  coverUrl: string | null | undefined
) {
  const fallback = slug ? CASE_STUDY_COVER_FALLBACKS[slug] : undefined;
  if (!coverUrl) return fallback ?? null;
  if (MISSING_LOCAL_ASSETS.has(coverUrl)) return fallback ?? null;
  return coverUrl;
}
