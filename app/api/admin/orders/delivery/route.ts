import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { recordFunnelEvent } from "../../../../lib/funnelAnalytics";

const ATTACHMENT_BUCKET = "message-attachments";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!url || !anonKey || !token) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const auth = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data } = await auth.auth.getUser(token);
  if (!data.user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const { data: profile } = await supabaseAdmin.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const body = await request.json().catch(() => null) as { orderId?: string; note?: string; attachments?: { path?: string; name?: string }[] } | null;
  if (!body?.orderId) return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
  const { data: currentOrder, error: lookupError } = await supabaseAdmin.from("orders").select("id,client_id,gig_id,offer_id")
    .eq("id", body.orderId).eq("payment_status", "paid").in("status", ["in_progress", "revision_requested"]).maybeSingle();
  if (lookupError) return NextResponse.json({ error: "Unable to load this order." }, { status: 500 });
  if (!currentOrder) return NextResponse.json({ error: "Only a paid order in progress or awaiting revision can be delivered." }, { status: 409 });

  const attachments = body.attachments ?? [];
  if (!Array.isArray(attachments) || attachments.length > 10 || attachments.some((item) =>
    !item || typeof item.path !== "string" || !item.path.startsWith(`conversations/${currentOrder.client_id}/`) ||
    !/^conversations\/[0-9a-f-]{36}\/[a-zA-Z0-9._-]+$/i.test(item.path) ||
    (item.name != null && (typeof item.name !== "string" || item.name.length > 150))
  )) return NextResponse.json({ error: "One or more delivery attachments are invalid." }, { status: 400 });

  const { data: order, error } = await supabaseAdmin.from("orders").update({ status: "delivered", revision_request: null })
    .eq("id", body.orderId).eq("payment_status", "paid").in("status", ["in_progress", "revision_requested"])
    .select("id,client_id,status").maybeSingle();
  if (error) return NextResponse.json({ error: "Unable to submit this delivery." }, { status: 500 });
  if (!order) return NextResponse.json({ error: "Only a paid order in progress or awaiting revision can be delivered." }, { status: 409 });

  const note = body.note?.trim();
  const attachmentLines = attachments.map((item) => `Attachment: storage://${item.path}`);
  const deliveryMessage = ["Your order delivery is ready for review.", note || null, ...attachmentLines, "Please open Orders to approve delivery or request a revision."].filter(Boolean).join("\n\n");
  const { data: deliveryNotification, error: messageError } = await supabaseAdmin.from("messages")
    .insert({ client_id: order.client_id, subject: "Order delivery submitted", body: deliveryMessage, status: "replied", order_id: order.id })
    .select("id")
    .maybeSingle();
  if (messageError) console.error("Delivery status updated, but client notification message failed:", messageError.message);

  let emailSent = false;
  const resendKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (resendKey && adminEmail) {
    const [{ data: profile }, { data: authUser }, gigResult, offerResult] = await Promise.all([
      supabaseAdmin.from("profiles").select("email,username,company_name").eq("id", order.client_id).maybeSingle(),
      supabaseAdmin.auth.admin.getUserById(order.client_id),
      currentOrder.gig_id ? supabaseAdmin.from("gigs").select("title").eq("id", currentOrder.gig_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
      currentOrder.offer_id ? supabaseAdmin.from("offers").select("title").eq("id", currentOrder.offer_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
    ]);
    const recipient = authUser.user?.email || profile?.email || null;
    if (recipient) {
      const clientName = profile?.company_name || profile?.username || authUser.user?.user_metadata?.full_name || "there";
      const orderTitle = offerResult.data?.title || gigResult.data?.title || "Your Flowbridge order";
      const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://flowbridgedigital.org").replace(/\/+$/, "");
      const orderUrl = `${siteUrl}/dashboard/orders/${encodeURIComponent(order.id)}`;
      const signedFiles = await Promise.all(attachments.map(async (attachment) => {
        const { data: signed } = await supabaseAdmin.storage.from(ATTACHMENT_BUCKET).createSignedUrl(attachment.path!, 60 * 60 * 24 * 7);
        return signed?.signedUrl ? { name: attachment.name || attachment.path!.split("/").pop() || "Delivered file", url: signed.signedUrl } : null;
      }));
      const files = signedFiles.filter((file): file is { name: string; url: string } => Boolean(file));
      const fileHtml = files.length
        ? `<h3 style="margin:24px 0 8px">Delivered files</h3><ul>${files.map((file) => `<li style="margin:8px 0"><a href="${escapeHtml(file.url)}">${escapeHtml(file.name)}</a></li>`).join("")}</ul>`
        : "";
      const fileText = files.length ? `\n\nDelivered files:\n${files.map((file) => `- ${file.name}: ${file.url}`).join("\n")}` : "";
      const { error: emailError } = await new Resend(resendKey).emails.send({
        from: `Flowbridge Digital <${adminEmail}>`,
        to: recipient,
        subject: `Delivery ready for review: ${orderTitle}`,
        html: `<div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.6;max-width:640px"><h2 style="margin:0 0 16px">Your order delivery is ready</h2><p>Hi ${escapeHtml(clientName)},</p><p>Flowbridge has submitted the delivery for <strong>${escapeHtml(orderTitle)}</strong>.</p>${note ? `<div style="margin:20px 0;padding:16px;white-space:pre-line;background:#f1f5f9;border-radius:10px">${escapeHtml(note)}</div>` : ""}${fileHtml}<p style="margin-top:24px">Review the delivery, then approve it or request a revision from your order page.</p><a href="${escapeHtml(orderUrl)}" style="display:inline-block;background:#0f172a;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none">Review delivery</a></div>`,
        text: `Your order delivery is ready\n\nHi ${clientName},\n\nFlowbridge has submitted the delivery for ${orderTitle}.${note ? `\n\nDelivery note:\n${note}` : ""}${fileText}\n\nReview delivery: ${orderUrl}`,
      }, { idempotencyKey: `flowbridge-delivery-${order.id}-${deliveryNotification?.id || "latest"}` });
      if (emailError) {
        console.error("Client delivery email failed:", emailError);
      } else {
        emailSent = true;
        if (deliveryNotification?.id) {
          await supabaseAdmin.from("messages").update({ user_notified_at: new Date().toISOString() }).eq("id", deliveryNotification.id);
        }
      }
    } else {
      console.warn(`No account email is available for order ${order.id}; delivery email skipped.`);
    }
  } else {
    console.warn("RESEND_API_KEY or ADMIN_EMAIL is missing; delivery email skipped.");
  }
  await recordFunnelEvent({ eventName: "delivery_submitted", userId: order.client_id, resourceId: order.id, resourceType: "order" });
  return NextResponse.json({ order, notificationSent: !messageError, emailSent });
}
