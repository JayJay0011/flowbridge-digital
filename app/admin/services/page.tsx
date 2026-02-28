"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type ServiceItem = {
  id: string;
  title: string;
  status: string;
  created_at: string;
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

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

  return (
    <main className="bg-white text-slate-900">
      <section className="py-16 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <h1 className="text-3xl font-semibold">Services</h1>
          <p className="text-slate-600 mt-2">
            Update positioning copy and structure without touching code.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 md:px-6 grid md:grid-cols-3 gap-8">
          {loading ? (
            <div className="border border-slate-200 rounded-2xl p-6 text-slate-500">
              Loading services...
            </div>
          ) : services.length === 0 ? (
            <div className="border border-slate-200 rounded-2xl p-6 text-slate-500">
              No services yet.
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
                  <button
                    onClick={() => toggleStatus(service)}
                    className="text-sm font-medium text-slate-900"
                    disabled={updating === service.id}
                  >
                    {service.status === "published" ? "Unpublish" : "Publish"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
