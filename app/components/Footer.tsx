"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 grid md:grid-cols-4 gap-10">

        {/* Brand Column */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">
            Flowbridge Digital
          </h3>
          <p className="text-sm leading-relaxed text-slate-400">
            We design structured automation systems and CRM frameworks 
            that help operators regain control and scale with clarity.
          </p>
          <p className="text-sm text-slate-400">
            hello@flowbridgedigital.com
          </p>
        </div>

        {/* Services */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">
            Services
          </h4>
          <ul className="space-y-3 text-sm">
            <li>
              <a
                href="/services/automation-systems-architecture"
                className="hover:text-white transition-colors duration-300"
              >
                Automation Systems
              </a>
            </li>
            <li>
              <a
                href="/services/crm-pipeline"
                className="hover:text-white transition-colors duration-300"
              >
                CRM & Pipeline Design
              </a>
            </li>
            <li>
              <a
                href="/services/growth-infrastructure"
                className="hover:text-white transition-colors duration-300"
              >
                Strategic Consulting
              </a>
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
              <a href="/portfolio" className="hover:text-white transition-colors duration-300">
                Portfolio
              </a>
            </li>
            <li>
              <a href="/blog" className="hover:text-white transition-colors duration-300">
                Blog
              </a>
            </li>
            <li>
              <a href="/reviews" className="hover:text-white transition-colors duration-300">
                Reviews
              </a>
            </li>
            <li>
              <a href="/about" className="hover:text-white transition-colors duration-300">
                About
              </a>
            </li>
            <li>
              <a
                href="/how-we-work"
                className="hover:text-white transition-colors duration-300"
              >
                Our Process
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:text-white transition-colors duration-300">
                Contact
              </a>
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
              <a href="/#faq" className="hover:text-white transition-colors duration-300">
                FAQs
              </a>
            </li>
            <li>
              <a href="/privacy-policy" className="hover:text-white transition-colors duration-300">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="/terms-of-service" className="hover:text-white transition-colors duration-300">
                Terms of Service
              </a>
            </li>
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
    </footer>
  )
}
