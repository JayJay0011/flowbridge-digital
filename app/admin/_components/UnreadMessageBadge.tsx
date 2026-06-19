"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type UnreadMessageBadgeProps = {
  className?: string;
  label?: string;
};

async function loadUnreadConversationCount() {
  const { data, error } = await supabase
    .from("messages")
    .select("client_id,status,admin_seen_at")
    .eq("status", "new")
    .is("admin_seen_at", null);

  if (error?.message.includes("admin_seen_at")) {
    const { data: fallbackData } = await supabase
      .from("messages")
      .select("client_id,status")
      .eq("status", "new");

    return new Set((fallbackData ?? []).map((message) => message.client_id))
      .size;
  }

  return new Set((data ?? []).map((message) => message.client_id)).size;
}

export default function UnreadMessageBadge({
  className = "",
  label = "unread message chats",
}: UnreadMessageBadgeProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const refresh = async () => {
      const nextCount = await loadUnreadConversationCount();
      if (isMounted) {
        setCount(nextCount);
      }
    };

    refresh();

    const channel = supabase
      .channel("admin-unread-message-badge")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => {
          void refresh();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      void supabase.removeChannel(channel);
    };
  }, []);

  if (count === 0) return null;

  return (
    <span
      aria-label={`${count} ${label}`}
      className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold leading-none text-white ${className}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
