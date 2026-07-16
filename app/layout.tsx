import "./globals.css";
import Footer from "./components/Footer";
import Header from "./components/Header";
import ChatWidget from "./components/ChatWidget";
import { Fraunces, Manrope } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://flowbridgedigital.org";

const founderName = "Oyeleke Jubril";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Flowbridge Digital | Automation & CRM Systems",
    template: "%s | Flowbridge Digital",
  },
  description:
    "Flowbridge Digital builds automation systems, CRM pipelines, and growth infrastructure that help modern businesses scale with clarity.",
  applicationName: "Flowbridge Digital",
  authors: [{ name: founderName }],
  creator: founderName,
  publisher: "Flowbridge Digital",
  category: "Business automation and CRM consulting",
  keywords: [
    "Flowbridge Digital",
    "Oyeleke Jubril",
    "business automation",
    "CRM pipeline design",
    "CRM systems consultant",
    "automation consultant",
    "workflow automation agency",
    "business systems architecture",
    "growth infrastructure",
    "operations consulting",
    "workflow automation",
  ],
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "Flowbridge Digital | Automation & CRM Systems",
    description:
      "Automation systems, CRM pipelines, and growth infrastructure for serious operators.",
    url: siteUrl,
    siteName: "Flowbridge Digital",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flowbridge Digital | Automation & CRM Systems",
    description:
      "Automation systems, CRM pipelines, and growth infrastructure for serious operators.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Flowbridge Digital",
        url: siteUrl,
        description:
          "Flowbridge Digital builds automation systems, CRM pipelines, operational dashboards, and growth infrastructure for modern businesses.",
        founder: {
          "@type": "Person",
          "@id": `${siteUrl}/#founder`,
          name: founderName,
          jobTitle: "Founder",
          sameAs: [
            "https://www.linkedin.com/in/oyeleke-jubril-846a223a6",
          ],
        },
        owner: {
          "@id": `${siteUrl}/#founder`,
        },
        knowsAbout: [
          "CRM systems",
          "business automation",
          "workflow automation",
          "operations dashboards",
          "growth infrastructure",
          "client portals",
        ],
        makesOffer: [
          {
            "@type": "Service",
            name: "Automation Systems",
            serviceType: "Workflow automation and business systems architecture",
          },
          {
            "@type": "Service",
            name: "CRM Pipeline Engineering",
            serviceType: "CRM strategy, setup, pipeline design, and automation",
          },
          {
            "@type": "Service",
            name: "Platform Development",
            serviceType: "Custom dashboards, portals, and operational web applications",
          },
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Flowbridge Digital",
        publisher: {
          "@id": `${siteUrl}/#organization`,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${manrope.variable} ${fraunces.variable} bg-white text-slate-900`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <Header />
        {children}
        <ChatWidget />
        <Footer />
      </body>
    </html>
  );
}
