"use client";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useState } from "react";

export default function StrategyCallPage() {
  const [businessModel, setBusinessModel] = useState("");
  const [otherModel, setOtherModel] = useState("");
  const [phone, setPhone] = useState<string | undefined>();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    pain: "",
    desiredResult: "",
    timeline: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalBusinessModel =
      businessModel === "Other" ? otherModel : businessModel;

    try {
      const response = await fetch("/api/strategy-call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: phone || "",
          businessModel: finalBusinessModel,
          pains: form.pain,
          goals: form.desiredResult,
          timeline: form.timeline,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        window.location.href = "/thank-you";
      } else {
        alert("Something went wrong.");
        console.log(data);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Something went wrong.");
    }
  };

  return (
    <main className="bg-white text-slate-900">
      <section className="py-28 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-semibold mb-6 text-center">
            Systems Consultation Request
          </h1>

          <p className="text-slate-600 text-center mb-12">
            This call is designed for founders serious about rebuilding operational systems.
            Please provide structured details so we can prepare properly.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                title: "Systems Audit",
                desc: "We diagnose your current bottlenecks and operational gaps.",
              },
              {
                title: "Clear Roadmap",
                desc: "You receive a structured plan for automation and growth.",
              },
              {
                title: "Execution Strategy",
                desc: "We outline next steps, timelines, and resourcing needs.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="border border-slate-200 rounded-2xl p-5 bg-white"
              >
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-slate-600 mt-2">{item.desc}</p>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-white p-8 rounded-2xl shadow-md"
          >
            {/* NAME ROW */}
            <div className="grid md:grid-cols-2 gap-6">
              <input
                type="text"
                name="firstName"
                required
                placeholder="First Name"
                value={form.firstName}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-slate-900 outline-none"
              />

              <input
                type="text"
                name="lastName"
                required
                placeholder="Last Name"
                value={form.lastName}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>

            {/* EMAIL */}
            <input
              type="email"
              name="email"
              required
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-slate-900 outline-none"
            />

            {/* PHONE INPUT */}
            <div>
              <PhoneInput
                international
                defaultCountry="US"
                value={phone}
                onChange={setPhone}
                className="border border-slate-300 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-slate-900"
              />
            </div>

            {/* BUSINESS MODEL */}
            <select
              required
              value={businessModel}
              onChange={(e) => setBusinessModel(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-slate-900 outline-none"
            >
              <option value="">Select Your Business Model</option>
              <option>Ecommerce Brand</option>
              <option>MedSpa / Clinic</option>
              <option>Agency</option>
              <option>Coaching Business</option>
              <option>Service-Based Business</option>
              <option>SaaS / Tech Startup</option>
              <option value="Other">Other</option>
            </select>

            {businessModel === "Other" && (
              <input
                type="text"
                required
                placeholder="Please specify your business model"
                value={otherModel}
                onChange={(e) => setOtherModel(e.target.value)}
                className="mt-4 w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-slate-900 outline-none"
              />
            )}

            {/* PAIN */}
            <textarea
              name="pain"
              required
              rows={4}
              placeholder="Briefly describe your current operational challenge (e.g. missed leads, manual follow-ups, disconnected tools...)"
              value={form.pain}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-slate-900 outline-none"
            />

            {/* DESIRED RESULT */}
            <textarea
              name="desiredResult"
              required
              rows={3}
              placeholder="What results are you looking to achieve? (e.g. automated pipeline, clearer reporting, reduced admin workload...)"
              value={form.desiredResult}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-slate-900 outline-none"
            />

            {/* TIMELINE */}
            <select
              name="timeline"
              required
              value={form.timeline}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-slate-900 outline-none"
            >
              <option value="">When are you looking to implement?</option>
              <option>Immediately (0–30 days)</option>
              <option>Within 1–3 months</option>
              <option>3–6 months</option>
              <option>Just exploring</option>
            </select>

            <button
              type="submit"
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-medium hover:bg-slate-800 transition"
            >
              Submit Consultation Request
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
