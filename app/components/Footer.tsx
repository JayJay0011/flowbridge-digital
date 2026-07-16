"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type SocialChoice = {
  label: string;
  href: string;
};

type SocialItem =
  | {
      label: string;
      href: string;
      choices?: never;
    }
  | {
      label: string;
      href?: never;
      choices: SocialChoice[];
    };

function hasChoices(item: SocialItem): item is Extract<SocialItem, { choices: SocialChoice[] }> {
  return "choices" in item && Array.isArray(item.choices);
}

const socialItems: SocialItem[] = [
  {
    label: "Facebook",
    choices: [
      { label: "Founder Profile", href: "#" },
      { label: "Business Page", href: "#" },
    ],
  },
  {
    label: "LinkedIn",
    choices: [
      { label: "Founder Profile", href: "#" },
      { label: "Business Page", href: "#" },
    ],
  },
  {
    label: "YouTube",
    href: "#",
  },
  {
    label: "Instagram",
    choices: [
      { label: "Founder Profile", href: "#" },
      { label: "Business Page", href: "#" },
    ],
  },
  {
    label: "X (Twitter)",
    choices: [
      { label: "Founder Profile", href: "#" },
      { label: "Business Page", href: "#" },
    ],
  },
  {
    label: "WhatsApp",
    choices: [
      { label: "UK Support", href: "#" },
      { label: "US Support", href: "#" },
      { label: "Nigeria Support", href: "#" },
    ],
  },
];

export default function Footer() {
  const pathname = usePathname();
  const [activeSocial, setActiveSocial] = useState<SocialItem | null>(null);

  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 grid sm:grid-cols-2 lg:grid-cols-5 gap-10">

        {/* Brand Column */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">
            Flowbridge Digital
          </h3>
          <p className="text-sm leading-relaxed text-slate-400">
            We design structured automation systems and CRM frameworks 
            that help operators regain control and scale with clarity.
          </p>
          <a
            href="mailto:support@flowbridgedigital.org"
            className="text-sm text-slate-400 hover:text-white transition-colors duration-300"
          >
            support@flowbridgedigital.org
          </a>
        </div>

        {/* Services */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">
            Services
          </h4>
          <ul className="space-y-3 text-sm">
            <li>
              <Link
                href="/services/automation-systems-architecture"
                className="hover:text-white transition-colors duration-300"
              >
                Automation Systems
              </Link>
            </li>
            <li>
              <Link
                href="/services/crm-pipeline"
                className="hover:text-white transition-colors duration-300"
              >
                CRM & Pipeline Design
              </Link>
            </li>
            <li>
              <Link
                href="/services/growth-infrastructure"
                className="hover:text-white transition-colors duration-300"
              >
                Strategic Consulting
              </Link>
            </li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">
            Company
          </h4>
          <ul className="space-y-3 text-sm">
            <li>
              <Link
                href="/portfolio"
                className="hover:text-white transition-colors duration-300"
              >
                Portfolio
              </Link>
            </li>
            <li>
              <Link
                href="/case-studies"
                className="hover:text-white transition-colors duration-300"
              >
                Case Studies
              </Link>
            </li>
            <li>
              <Link
                href="/blog"
                className="hover:text-white transition-colors duration-300"
              >
                Blog
              </Link>
            </li>
            <li>
              <Link
                href="/reviews"
                className="hover:text-white transition-colors duration-300"
              >
                Reviews
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="hover:text-white transition-colors duration-300"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/how-we-work"
                className="hover:text-white transition-colors duration-300"
              >
                Our Process
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="hover:text-white transition-colors duration-300"
              >
                Contact
              </Link>
            </li>
            <li>
              <a
                href="https://cal.com/flow-bridge-digital-tee44g/systems-strategy-consultation"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors duration-300"
              >
                Book a Strategy Call
              </a>
            </li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">
            Resources
          </h4>
          <ul className="space-y-3 text-sm">
            <li>
              <Link
                href="/#faq"
                className="hover:text-white transition-colors duration-300"
              >
                FAQs
              </Link>
            </li>
            <li>
              <Link
                href="/privacy-policy"
                className="hover:text-white transition-colors duration-300"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms-of-service"
                className="hover:text-white transition-colors duration-300"
              >
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>

        {/* Socials */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">
            Socials
          </h4>
          <ul className="space-y-3 text-sm">
            {socialItems.map((item) => (
              <li key={item.label}>
                {hasChoices(item) ? (
                  <button
                    type="button"
                    onClick={() => setActiveSocial(item)}
                    className="text-left hover:text-white transition-colors duration-300"
                  >
                    {item.label}
                  </button>
                ) : (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors duration-300"
                  >
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 text-sm text-slate-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Flowbridge Digital. All rights reserved.</p>
          <p>Built with clarity.</p>
        </div>
      </div>

      {activeSocial ? (
        <div
          className="fixed inset-0 z-50 bg-slate-950/50 px-4 py-6"
          role="presentation"
          onClick={() => setActiveSocial(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${activeSocial.label} links`}
            className="ml-auto flex h-full w-full max-w-sm flex-col rounded-2xl border border-slate-700 bg-slate-950 p-6 text-slate-200 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Socials
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  {activeSocial.label}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveSocial(null)}
                className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300 hover:border-slate-500 hover:text-white"
              >
                Close
              </button>
            </div>

            {hasChoices(activeSocial) ? (
              <div className="mt-8 grid gap-3">
                {activeSocial.choices.map((choice) => (
                  <a
                    key={choice.label}
                    href={choice.href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-4 font-semibold text-white transition hover:border-cyan-300 hover:bg-slate-800"
                  >
                    {choice.label}
                  </a>
                ))}
              </div>
            ) : null}

            <p className="mt-auto pt-8 text-xs leading-relaxed text-slate-500">
              Placeholder links are active until the official Flowbridge Digital
              social profiles are added.
            </p>
          </div>
        </div>
      ) : null}
    </footer>
  )
}
