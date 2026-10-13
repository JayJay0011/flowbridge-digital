import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export async function GET(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!url || !anonKey || !token) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const auth = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data } = await auth.auth.getUser(token);
  if (!data.user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const { data: profile } = await supabaseAdmin.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: events, error } = await supabaseAdmin.from("funnel_events").select("event_name,created_at").gte("created_at", since).order("created_at", { ascending: false }).limit(10000);
  if (error) return NextResponse.json({ error: "Unable to load funnel analytics." }, { status: 500 });
  const counts = Object.fromEntries([
    "gig_viewed", "checkout_started", "offer_accepted", "payment_completed",
    "delivery_submitted", "revision_requested", "order_completed", "review_submitted",
  ].map((name) => [name, events?.filter((event) => event.event_name === name).length || 0]));
  return NextResponse.json({ periodDays: 30, counts, totalEvents: events?.length || 0 });
}
