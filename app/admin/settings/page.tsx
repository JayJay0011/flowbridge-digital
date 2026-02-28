"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Profile = {
  id: string;
  email: string | null;
  username: string | null;
  role: "admin" | "client";
};

export default function AdminSettingsPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const loadProfiles = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id,email,username,role")
      .order("created_at", { ascending: false });
    setProfiles((data ?? []) as Profile[]);
    setLoading(false);
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return profiles;
    return profiles.filter((profile) => {
      return (
        profile.email?.toLowerCase().includes(query) ||
        profile.username?.toLowerCase().includes(query)
      );
    });
  }, [profiles, search]);

  const toggleRole = async (profile: Profile) => {
    setMessage(null);
    const nextRole = profile.role === "admin" ? "client" : "admin";
    const { data, error } = await supabase
      .from("profiles")
      .update({ role: nextRole })
      .eq("id", profile.id)
      .select("id,email,username,role")
      .single();

    if (error) {
      setMessage(error.message);
      return;
    }

    setProfiles((prev) =>
      prev.map((item) => (item.id === profile.id ? (data as Profile) : item))
    );
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold">Settings</h2>
        <p className="text-slate-600 mt-2">
          Manage admin access and user permissions.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by email or username"
          className="w-full md:max-w-sm border border-slate-200 rounded-xl px-4 py-3 text-sm"
        />
        {message ? (
          <p className="text-sm text-emerald-600 self-center">{message}</p>
        ) : null}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-6 text-slate-500">Loading users...</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-slate-500">No users found.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((profile) => (
              <div
                key={profile.id}
                className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div>
                  <p className="text-sm font-semibold">
                    {profile.username || "Unnamed user"}
                  </p>
                  <p className="text-xs text-slate-500">{profile.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    {profile.role}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleRole(profile)}
                    className="text-sm font-semibold px-4 py-2 rounded-lg border border-slate-200"
                  >
                    Make {profile.role === "admin" ? "client" : "admin"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-sm text-slate-500">
        Need finer permissions? We can add role-based access controls for specific
        modules next.
      </div>
    </section>
  );
}
