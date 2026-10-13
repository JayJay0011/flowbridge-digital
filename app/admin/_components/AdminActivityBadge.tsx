"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AdminActivityBadge({ type, className = "" }: { type: "orders" | "reviews"; className?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return;
      const response = await fetch(`/api/admin/activity?type=${type}`, { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json().catch(() => ({}));
      if (mounted && response.ok) setCount(Number(result.count) || 0);
    };
    void refresh();
    const channel = supabase.channel(`admin-${type}-badge`).on("postgres_changes", { event: "*", schema: "public", table: type }, () => void refresh()).subscribe();
    return () => { mounted = false; void supabase.removeChannel(channel); };
  }, [type]);

  if (!count) return null;
  return <span aria-label={`${count} new ${type}`} className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold leading-none text-white ${className}`}>{count > 99 ? "99+" : count}</span>;
}
