"use client";

import { useEffect } from "react";

export default function FunnelEvent({ eventName, resourceId, resourceType }: {
  eventName: "gig_viewed" | "checkout_started";
  resourceId?: string;
  resourceType?: string;
}) {
  useEffect(() => {
    const key = `flowbridge-funnel-${eventName}-${resourceId || "page"}`;
    if (window.sessionStorage.getItem(key)) return;
    let visitorId = window.localStorage.getItem("flowbridge-visitor-id");
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      window.localStorage.setItem("flowbridge-visitor-id", visitorId);
    }
    window.sessionStorage.setItem(key, "1");
    void fetch("/api/analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventName, visitorId, resourceId, resourceType }),
      keepalive: true,
    });
  }, [eventName, resourceId, resourceType]);
  return null;
}
