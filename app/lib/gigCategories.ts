export const gigCategories = [
  {
    slug: "email-marketing",
    label: "Email Marketing",
    keywords: ["email", "newsletter", "campaign", "klaviyo", "mailchimp"],
  },
  {
    slug: "crm",
    label: "CRM",
    keywords: ["crm", "customer relationship", "pipeline", "hubspot", "gohighlevel"],
  },
  {
    slug: "automation",
    label: "Automation",
    keywords: ["automation", "zapier", "make", "n8n", "workflow", "integration"],
  },
  {
    slug: "development",
    label: "Development",
    keywords: ["development", "website", "web app", "app", "software"],
  },
  {
    slug: "virtual-assistant",
    label: "Virtual Assistant",
    keywords: ["virtual assistant", "assistant", "operations", "admin support", "va"],
  },
];

export function getGigCategoryLabel(slug: string) {
  return gigCategories.find((category) => category.slug === slug)?.label ?? slug;
}
