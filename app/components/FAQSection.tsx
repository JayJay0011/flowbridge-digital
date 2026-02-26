"use client";

import { useState } from "react";

export default function FAQSection() {
  const faqs = [
  {
    question: "What is business process automation and how can it help my company?",
    answer:
      "Business process automation eliminates repetitive manual tasks by connecting your CRM, marketing, sales, and operational tools into one streamlined system. This improves efficiency, reduces human error, and increases revenue visibility."
  },
  {
    question: "Do you provide CRM setup and pipeline design services?",
    answer:
      "Yes. We design and implement custom CRM systems tailored to your sales process, including pipeline architecture, automation workflows, reporting dashboards, and lead tracking systems."
  },
  {
    question: "Can you help ecommerce and service-based businesses scale operations?",
    answer:
      "Absolutely. We work with ecommerce brands, medical practices, consultants, and service-based businesses to build scalable systems that support growth without operational chaos."
  },
  {
    question: "What tools and automation platforms do you specialize in?",
    answer:
      "We work across leading CRM and automation platforms including HubSpot, GoHighLevel, Zapier, N8N, Make, Airtable, Shopify integrations, and custom API workflows."
  },
  {
    question: "How long does a CRM or automation implementation take?",
    answer:
      "Most CRM setup and workflow automation projects are completed within 2–6 weeks depending on complexity, integrations required, and reporting needs."
  }
];


  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-semibold text-center mb-12">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-slate-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                className="w-full text-left px-6 py-5 flex justify-between items-center"
              >
                <span className="font-medium text-slate-900">
                  {faq.question}
                </span>
                <span className="text-xl">
                  {openIndex === index ? "−" : "+"}
                </span>
              </button>

              {openIndex === index && (
                <div className="px-6 pb-6 text-slate-600 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
