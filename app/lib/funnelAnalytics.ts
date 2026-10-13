import { supabaseAdmin } from "./supabaseAdmin";

export type FunnelEventName =
  | "gig_viewed"
  | "checkout_started"
  | "offer_accepted"
  | "payment_completed"
  | "delivery_submitted"
  | "revision_requested"
  | "order_completed"
  | "review_submitted";

export async function recordFunnelEvent(input: {
  eventName: FunnelEventName;
  userId?: string | null;
  visitorId?: string | null;
  resourceId?: string | null;
  resourceType?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const { error } = await supabaseAdmin.from("funnel_events").insert({
    event_name: input.eventName,
    user_id: input.userId || null,
    visitor_id: input.visitorId?.slice(0, 100) || null,
    resource_id: input.resourceId?.slice(0, 150) || null,
    resource_type: input.resourceType?.slice(0, 50) || null,
    metadata: input.metadata || {},
  });
  if (error) console.error("Unable to record funnel event:", error.message);
}
