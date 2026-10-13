import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { supabaseAdmin } from "../../lib/supabaseAdmin";
import { recordFunnelEvent } from "../../lib/funnelAnalytics";

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

  const body = await request.json().catch(() => null) as { orderId?: string; rating?: number; summary?: string; body?: string; videoUrl?: string; improvementFeedback?: string } | null;
  if (!body?.orderId || !Number.isInteger(body.rating) || Number(body.rating) < 1 || Number(body.rating) > 5) return NextResponse.json({ error: "Choose an order and rating." }, { status: 400 });
  if (Number(body.rating) < 4 && !body.improvementFeedback?.trim()) return NextResponse.json({ error: "Please tell us how we can improve." }, { status: 400 });
  const { data: order } = await supabaseAdmin.from("orders").select("id").eq("id", body.orderId).eq("client_id", data.user.id).eq("status", "complete").maybeSingle();
  if (!order) return NextResponse.json({ error: "Only completed orders can be reviewed." }, { status: 403 });

  const { data: review, error } = await supabaseAdmin.from("reviews").insert({
    client_id: data.user.id, order_id: order.id, rating: body.rating,
    summary: body.summary?.trim() || null, body: body.body?.trim() || null,
    video_url: body.videoUrl?.trim() || null,
    improvement_feedback: Number(body.rating) < 4 ? body.improvementFeedback?.trim() || null : null,
    status: "pending", admin_seen_at: null,
  }).select("id").single();
  if (error) return NextResponse.json({ error: error.code === "23505" ? "A review has already been submitted for this order." : "Unable to submit your review." }, { status: 400 });

  await recordFunnelEvent({ eventName: "review_submitted", userId: data.user.id, resourceId: order.id, resourceType: "order" });
  const resendKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (resendKey && adminEmail) {
    const { data: profile } = await supabaseAdmin.from("profiles").select("username,company_name,email").eq("id", data.user.id).maybeSingle();
    const clientName = profile?.company_name || profile?.username || profile?.email || "A client";
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://flowbridgedigital.org").replace(/\/+$/, "");
    const reviewUrl = `${siteUrl}/admin/reviews`;
    const summary = body.summary?.trim() || "New client review";
    const { error: emailError } = await new Resend(resendKey).emails.send({
      from: `Flowbridge Digital <${adminEmail}>`, to: adminEmail,
      subject: `New ${body.rating}-star review from ${clientName}`,
      html: `<div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.6"><h2>New client review</h2><p><strong>${escapeHtml(clientName)}</strong> left a ${body.rating}/5 review.</p><h3>${escapeHtml(summary)}</h3><p>${escapeHtml(body.body?.trim() || "No written comment.")}</p><p><a href="${escapeHtml(reviewUrl)}">Review and publish</a></p></div>`,
      text: `New client review\n\n${clientName} left a ${body.rating}/5 review.\n${summary}\n${body.body?.trim() || "No written comment."}\n\nReview and publish: ${reviewUrl}`,
    }, { idempotencyKey: `flowbridge-new-review-${review.id}` });
    if (emailError) console.error("Admin review email failed:", emailError);
  }
  return NextResponse.json({ review });
}
