import { NextResponse } from "next/server";
import { recordFunnelEvent } from "../../../lib/funnelAnalytics";
import { createClient } from "@supabase/supabase-js";

const publicEvents = new Set(["page_view", "gig_viewed", "checkout_started"]);

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    eventName?: string;
    visitorId?: string;
    resourceId?: string;
    resourceType?: string;
  } | null;
  if (!body?.eventName) {
    return NextResponse.json({ error: "Invalid analytics event." }, { status: 400 });
  }
  let userId: string | null = null;
  if (!publicEvents.has(body.eventName)) {
    if (body.eventName !== "review_submitted") return NextResponse.json({ error: "Invalid analytics event." }, { status: 400 });
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!url || !anonKey || !token) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const auth = createClient(url, anonKey, { auth: { persistSession: false } });
    const { data } = await auth.auth.getUser(token);
    userId = data.user?.id || null;
    if (!userId) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  await recordFunnelEvent({
    eventName: body.eventName as "page_view" | "gig_viewed" | "checkout_started" | "review_submitted",
    userId,
    visitorId: body.visitorId,
    resourceId: body.resourceId,
    resourceType: body.resourceType,
    metadata: {
      country: request.headers.get("x-vercel-ip-country") || null,
      region: request.headers.get("x-vercel-ip-country-region") || null,
    },
  });
  return new NextResponse(null, { status: 204 });
}
