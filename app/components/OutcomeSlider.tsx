"use client";

import Link from "next/link";
import { useState } from "react";

const outcomes = [
  {
    metric: "+42%",
    title: "Faster project delivery",
    body: "A centralized operating system made delivery progress visible and helped work move through the team faster.",
    context: "Internal operations dashboard",
    href: "/case-studies/internal-operations",
  },
  {
    metric: "-55%",
    title: "Less manual administration",
    body: "Connected workflows replaced repetitive spreadsheet updates and reduced the administrative work needed to keep operations current.",
    context: "Internal operations dashboard",
    href: "/case-studies/internal-operations",
  },
  {
    metric: "100%",
    title: "Automated order-status tracking",
    body: "Structured ecommerce automation replaced fragmented order updates with real-time status visibility across the fulfillment process.",
    context: "Ecommerce automation infrastructure",
    href: "/case-studies/ecommerce-automation",
  },
  {
    metric: "Clearer",
    title: "Lead and lifecycle visibility",
    body: "A structured CRM replaced fragmented lead tracking and manual follow-up with a visible client lifecycle and consistent handoffs.",
    context: "MedSpa CRM rebuild",
    href: "/case-studies/medspa-crm-rebuild",
  },
];

export default function OutcomeSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeOutcome = outcomes[activeIndex];

  const showPrevious = () => {
    setActiveIndex((current) =>
      current === 0 ? outcomes.length - 1 : current - 1,
    );
  };

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % outcomes.length);
  };

  return (
    <section className="overflow-hidden bg-slate-950 py-24 text-white">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
            What changes when we work together
          </p>
          <h2 className="mt-4 text-3xl font-semibold md:text-4xl">
            From operational friction to measurable progress
          </h2>
          <p className="mt-4 text-slate-300">
            Explore the kinds of improvements structured automation, CRM, and
            operational systems can create.
          </p>
        </div>

        <div
          className="mt-12 grid overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] lg:grid-cols-[0.72fr_1.28fr]"
          aria-live="polite"
        >
          <div className="flex min-h-64 items-center justify-center border-b border-white/10 p-8 lg:border-b-0 lg:border-r">
            <p className="text-center text-6xl font-semibold tracking-tight text-cyan-300 md:text-7xl">
              {activeOutcome.metric}
            </p>
          </div>
          <div className="flex min-h-64 flex-col justify-between p-8 md:p-10">
            <div>
              <p className="text-sm font-semibold text-cyan-300">
                Outcome {activeIndex + 1} of {outcomes.length}
              </p>
              <h3 className="mt-4 text-2xl font-semibold">
                {activeOutcome.title}
              </h3>
              <p className="mt-4 max-w-2xl leading-7 text-slate-300">
                {activeOutcome.body}
              </p>
            </div>
            <Link
              href={activeOutcome.href}
              className="mt-8 inline-flex w-fit text-sm font-semibold text-white underline decoration-white/30 underline-offset-4 transition hover:decoration-white"
            >
              Read the {activeOutcome.context} case study →
            </Link>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-5">
          <div className="flex gap-2" aria-label="Select an outcome">
            {outcomes.map((outcome, index) => (
              <button
                key={outcome.title}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeIndex
                    ? "w-9 bg-cyan-300"
                    : "w-2.5 bg-white/30 hover:bg-white/60"
                }`}
                aria-label={`Show outcome ${index + 1}: ${outcome.title}`}
                aria-current={index === activeIndex ? "true" : undefined}
              />
            ))}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={showPrevious}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-xl transition hover:border-white/50 hover:bg-white/10"
              aria-label="Show previous outcome"
            >
              ←
            </button>
            <button
              type="button"
              onClick={showNext}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl text-slate-950 transition hover:bg-slate-100"
              aria-label="Show next outcome"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
