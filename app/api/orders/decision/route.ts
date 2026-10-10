import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!url || !anonKey || !token) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const auth = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data } = await auth.auth.getUser(token);
  if (!data.user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const body = await request.json().catch(() => null) as { orderId?: string; decision?: string; revisionReason?: string } | null;
  if (!body?.orderId || !["complete", "revision_requested"].includes(body.decision || "")) {
    return NextResponse.json({ error: "Choose whether to approve delivery or request a revision." }, { status: 400 });
  }
  const revision = body.decision === "revision_requested" ? body.revisionReason?.trim() : null;
  if (body.decision === "revision_requested" && !revision) return NextResponse.json({ error: "Please describe what needs to be revised." }, { status: 400 });

  const { data: order, error } = await supabaseAdmin.from("orders").update({ status: body.decision, revision_request: revision || null })
    .eq("id", body.orderId).eq("client_id", data.user.id).eq("payment_status", "paid").eq("status", "delivered")
    .select("id,status,revision_request").maybeSingle();
  if (error) return NextResponse.json({ error: "Unable to update this order." }, { status: 500 });
  if (!order) return NextResponse.json({ error: "This delivery is no longer awaiting your decision. Refresh the order and try again." }, { status: 409 });

  const activity = body.decision === "complete"
    ? "Client approved the delivery. The order is complete."
    : `Client requested a revision.\n\n${revision}`;
  const { error: activityError } = await supabaseAdmin.from("messages").insert({
    client_id: data.user.id,
    subject: body.decision === "complete" ? "Delivery approved" : "Revision requested",
    body: activity,
    status: "new",
    order_id: order.id,
  });
  if (activityError) console.error("Order decision saved, but conversation activity could not be recorded:", activityError.message);

  return NextResponse.json({ order, activityRecorded: !activityError });
}
