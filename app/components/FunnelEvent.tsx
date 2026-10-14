"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function FunnelEvent({ eventName, resourceId, resourceType }: {
  eventName: "page_view" | "gig_viewed" | "checkout_started";
  resourceId?: string;
  resourceType?: string;
}) {
  const pathname = usePathname();
  useEffect(() => {
    const trackedResourceId = eventName === "page_view" ? pathname : resourceId;
    const key = `flowbridge-funnel-${eventName}-${trackedResourceId || "page"}`;
    if (window.sessionStorage.getItem(key)) return;
    let visitorId = window.localStorage.getItem("flowbridge-visitor-id");
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      window.localStorage.setItem("flowbridge-visitor-id", visitorId);
    }
    void fetch("/api/analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventName, visitorId, resourceId: trackedResourceId, resourceType }),
      keepalive: true,
    }).then((response) => {
      if (response.ok) window.sessionStorage.setItem(key, "1");
    }).catch(() => undefined);
  }, [eventName, pathname, resourceId, resourceType]);
  return null;
}
