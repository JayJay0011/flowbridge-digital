"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

type ServiceItem = {
  id: string;
  title: string;
  status: string;
  created_at: string;
};

const defaultServices = [
  {
    title: "Automation & Systems Architecture",
    slug: "automation-systems-architecture",
    description:
      "Business process automation, workflow engineering, and backend operational structuring.",
  },
  {
    title: "CRM & Pipeline Engineering",
    slug: "crm-pipeline",
    description:
      "Structured CRM design, lifecycle workflows, and revenue visibility systems.",
  },
  {
    title: "Growth Infrastructure",
    slug: "growth-infrastructure",
    description:
      "Email marketing systems, lead nurturing automation, and conversion infrastructure.",
  },
  {
    title: "Platform Development",
    slug: "platform-development",
    description:
      "Modern web applications and internal tools built for operational scalability.",
  },
  {
    title: "Operational Support",
    slug: "operational-support",
    description:
      "Structured VA systems, backend documentation, and execution support frameworks.",
  },
];

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const { data, error } = await supabase
        .from("services")
        .select("id,title,status,created_at")
        .order("created_at", { ascending: false });
      if (isMounted) {
        setServices(error ? [] : (data ?? []));
        setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleStatus = async (item: ServiceItem) => {
    const nextStatus = item.status === "published" ? "draft" : "published";
    setUpdating(item.id);
    await supabase
      .from("services")
      .update({ status: nextStatus })
      .eq("id", item.id);
    setServices((prev) =>
      prev.map((row) =>
        row.id === item.id ? { ...row, status: nextStatus } : row
      )
    );
    setUpdating(null);
  };

  const seedDefaults = async () => {
    setMessage(null);
    const payload = defaultServices.map((service) => ({
      ...service,
      status: "published",
    }));
    const { error, data } = await supabase.from("services").insert(payload).select("id,title,status,created_at");
    if (error) {
      setMessage(error.message);
      return;
    }
    setServices((data ?? []) as ServiceItem[]);
  };

  return (
    <main className="bg-white text-slate-900">
      <section className="py-12 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 md:px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Services</h1>
            <p className="text-slate-600 mt-2">
              Update positioning copy and structure without touching code.
            </p>
          </div>
          <Link
            href="/admin/services/new"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold"
          >
            New service
          </Link>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 md:px-6 grid md:grid-cols-3 gap-8">
          {loading ? (
            <div className="border border-slate-200 rounded-2xl p-6 text-slate-500">
              Loading services...
            </div>
          ) : services.length === 0 ? (
            <div className="border border-slate-200 rounded-2xl p-6 text-slate-500 space-y-4">
              <p>No services yet. Create your first service to populate this page.</p>
              <button
                type="button"
                onClick={seedDefaults}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold"
              >
                Import default services
              </button>
              {message ? (
                <p className="text-xs text-slate-500">{message}</p>
              ) : null}
            </div>
          ) : (
            services.map((service) => (
              <div
                key={service.id}
                className="border border-slate-200 rounded-2xl p-6 bg-white"
              >
                <h2 className="text-xl font-semibold">{service.title}</h2>
                <p className="mt-3 text-sm text-slate-500">
                  Updated {new Date(service.created_at).toLocaleDateString()}
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                    {service.status}
                  </span>
                  <div className="flex items-center gap-3">
                    <a
                      href={`/admin/services/${service.id}`}
                      className="text-sm font-medium text-slate-600"
                    >
                      Edit
                    </a>
                    <button
                      onClick={() => toggleStatus(service)}
                      className="text-sm font-medium text-slate-900"
                      disabled={updating === service.id}
                    >
                      {service.status === "published" ? "Unpublish" : "Publish"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
