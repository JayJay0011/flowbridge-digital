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
  "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Flowbridge Digital | Automation & CRM Systems",
    template: "%s | Flowbridge Digital",
  },
  description:
    "Flowbridge Digital builds automation systems, CRM pipelines, and growth infrastructure that help modern businesses scale with clarity.",
  keywords: [
    "business automation",
    "CRM pipeline design",
    "growth infrastructure",
    "operations consulting",
    "workflow automation",
  ],
  openGraph: {
    title: "Flowbridge Digital | Automation & CRM Systems",
    description:
      "Automation systems, CRM pipelines, and growth infrastructure for serious operators.",
    url: siteUrl,
    siteName: "Flowbridge Digital",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flowbridge Digital | Automation & CRM Systems",
    description:
      "Automation systems, CRM pipelines, and growth infrastructure for serious operators.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${fraunces.variable} bg-white text-slate-900`}
      >

        <Header />

        {children}

        <ChatWidget />

        <Footer />

      </body>
    </html>
  )
}
