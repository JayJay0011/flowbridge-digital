import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { recordFunnelEvent } from "../../../lib/funnelAnalytics";
import { Resend } from "resend";

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

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

  const { data: order, error } = await supabaseAdmin.from("orders").update({ status: body.decision, revision_request: revision || null, admin_seen_at: null })
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

  const resendKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (resendKey && adminEmail) {
    const { data: clientProfile } = await supabaseAdmin.from("profiles").select("username,company_name,email").eq("id", data.user.id).maybeSingle();
    const clientName = clientProfile?.company_name || clientProfile?.username || clientProfile?.email || "A client";
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://flowbridgedigital.org").replace(/\/+$/, "");
    const adminOrderUrl = `${siteUrl}/admin/orders/${encodeURIComponent(order.id)}`;
    const heading = body.decision === "complete" ? "Delivery approved" : "Revision requested";
    const detail = body.decision === "complete" ? `${clientName} approved the delivery and the order is now complete.` : `${clientName} requested a revision.${revision ? `\n\n${revision}` : ""}`;
    const { error: emailError } = await new Resend(resendKey).emails.send({
      from: `Flowbridge Digital <${adminEmail}>`, to: adminEmail,
      subject: `${heading}: order ${order.id.slice(0, 8)}`,
      html: `<div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.6"><h2>${escapeHtml(heading)}</h2><div style="white-space:pre-line">${escapeHtml(detail)}</div><p><a href="${escapeHtml(adminOrderUrl)}">Open order</a></p></div>`,
      text: `${heading}\n\n${detail}\n\nOpen order: ${adminOrderUrl}`,
    }, { idempotencyKey: `flowbridge-order-decision-${order.id}-${body.decision}-${crypto.randomUUID()}` });
    if (emailError) console.error("Admin order decision email failed:", emailError);
  }

  await recordFunnelEvent({
    eventName: body.decision === "complete" ? "order_completed" : "revision_requested",
    userId: data.user.id,
    resourceId: order.id,
    resourceType: "order",
  });

  return NextResponse.json({ order, activityRecorded: !activityError });
}
