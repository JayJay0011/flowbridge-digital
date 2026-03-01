"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Profile = {
  id: string;
  email: string | null;
  username: string | null;
  role: "admin" | "client";
};

type Permission = {
  module: string;
  can_read: boolean;
  can_write: boolean;
};

const modules = [
  { key: "services", label: "Services" },
  { key: "gigs", label: "Gigs" },
  { key: "portfolio", label: "Portfolio" },
  { key: "case_studies", label: "Case Studies" },
  { key: "blog", label: "Blog" },
  { key: "orders", label: "Orders" },
  { key: "messages", label: "Messages" },
  { key: "reviews", label: "Reviews" },
  { key: "settings", label: "Settings" },
];

export default function AdminSettingsPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

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

  useEffect(() => {
    if (!selectedUserId) return;
    const loadPermissions = async () => {
      setLoadingPermissions(true);
      const { data } = await supabase
        .from("admin_permissions")
        .select("module,can_read,can_write")
        .eq("user_id", selectedUserId);
      setPermissions((data ?? []) as Permission[]);
      setLoadingPermissions(false);
    };
    loadPermissions();
  }, [selectedUserId]);

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

  const permissionMap = useMemo(() => {
    const map: Record<string, Permission> = {};
    permissions.forEach((perm) => {
      map[perm.module] = perm;
    });
    return map;
  }, [permissions]);

  const hasRestrictions = permissions.length > 0;

  const upsertPermission = async (moduleKey: string, nextRead: boolean, nextWrite: boolean) => {
    if (!selectedUserId) return;
    setMessage(null);
    const { error } = await supabase
      .from("admin_permissions")
      .upsert({
        user_id: selectedUserId,
        module: moduleKey,
        can_read: nextRead,
        can_write: nextWrite,
      });
    if (error) {
      setMessage(error.message);
      return;
    }
    setPermissions((prev) => {
      const existing = prev.find((item) => item.module === moduleKey);
      if (existing) {
        return prev.map((item) =>
          item.module === moduleKey
            ? { ...item, can_read: nextRead, can_write: nextWrite }
            : item
        );
      }
      return [...prev, { module: moduleKey, can_read: nextRead, can_write: nextWrite }];
    });
  };

  const clearPermissions = async () => {
    if (!selectedUserId) return;
    setMessage(null);
    const { error } = await supabase
      .from("admin_permissions")
      .delete()
      .eq("user_id", selectedUserId);
    if (error) {
      setMessage(error.message);
      return;
    }
    setPermissions([]);
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
                    onClick={() => setSelectedUserId(profile.id)}
                    className={`text-xs font-semibold px-3 py-2 rounded-lg border ${
                      selectedUserId === profile.id
                        ? "border-slate-900 text-slate-900"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    Permissions
                  </button>
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

      {selectedUserId ? (
        <div className="border border-slate-200 rounded-2xl bg-white p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold">Module permissions</h3>
              <p className="text-sm text-slate-500">
                Toggle read/write access per module.
              </p>
            </div>
            <button
              type="button"
              onClick={clearPermissions}
              className="text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              Reset to full access
            </button>
          </div>

          {loadingPermissions ? (
            <p className="text-sm text-slate-500">Loading permissions...</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {modules.map((module) => {
                const current = permissionMap[module.key];
                const canRead = current?.can_read ?? (hasRestrictions ? false : true);
                const canWrite = current?.can_write ?? (hasRestrictions ? false : true);
                return (
                  <div
                    key={module.key}
                    className="border border-slate-200 rounded-2xl p-4 flex flex-col gap-3"
                  >
                    <div className="font-semibold">{module.label}</div>
                    <div className="flex items-center gap-4 text-sm">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={canRead}
                          onChange={(event) =>
                            upsertPermission(
                              module.key,
                              event.target.checked,
                              canWrite && event.target.checked
                            )
                          }
                        />
                        Read
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={canWrite}
                          onChange={(event) =>
                            upsertPermission(
                              module.key,
                              event.target.checked || canRead,
                              event.target.checked
                            )
                          }
                        />
                        Write
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm text-slate-500">
          Select a user to manage module permissions.
        </div>
      )}
    </section>
  );
}
