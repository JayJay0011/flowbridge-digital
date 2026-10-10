import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

type Related<T> = T | T[] | null;

type DueMessage = {
  id: string;
  client_id: string;
  subject: string | null;
  body: string;
  created_at: string;
  profiles: Related<{
    email: string | null;
    username: string | null;
    company_name: string | null;
  }>;
};

type NotificationCandidate = DueMessage & {
  profile: {
    email: string | null;
    username: string | null;
    company_name: string | null;
  } | null;
};

type OfferNotice = { title?: string; description?: string; price?: string; deliveryDate?: string; revisions?: string; deliverables?: string };

function notificationContent(body: string) {
  if (body.startsWith("__offer__:")) {
    try {
      const offer = JSON.parse(body.slice("__offer__:".length)) as OfferNotice;
      return {
        subject: "Flowbridge sent you a custom offer",
        heading: "Your custom offer is ready",
        intro: "Flowbridge sent an offer for your review. Sign in to accept it or continue the conversation.",
        preview: [offer.title, offer.description, offer.price ? `Price: ${offer.price}` : null, offer.deliveryDate ? `Delivery: ${offer.deliveryDate}` : null, offer.revisions ? `Revisions: ${offer.revisions}` : null, offer.deliverables ? `Deliverables: ${offer.deliverables}` : null].filter(Boolean).join("\n"),
        button: "Review offer",
        href: "/dashboard/messages",
      };
    } catch {
      return { subject: "Flowbridge sent you a custom offer", heading: "Your custom offer is ready", intro: "Flowbridge sent an offer for your review. Sign in to view it.", preview: "Open your inbox to review the offer details.", button: "Review offer", href: "/dashboard/messages" };
    }
  }
  if (body.startsWith("__order__:")) {
    try {
      const order = JSON.parse(body.slice("__order__:".length)) as { title?: string; orderId?: string };
      const orderPath = order.orderId && /^[0-9a-f-]{36}$/i.test(order.orderId) ? `/dashboard/orders/${encodeURIComponent(order.orderId)}` : "/dashboard/orders";
      return { subject: "Your Flowbridge order is confirmed", heading: "Your order is confirmed", intro: "Your payment is confirmed and work can begin.", preview: order.title || "Flowbridge service", button: "View order", href: orderPath };
    } catch {
      return { subject: "Your Flowbridge order is confirmed", heading: "Your order is confirmed", intro: "Your payment is confirmed and work can begin.", preview: "Open your dashboard to view the order.", button: "View order", href: "/dashboard/orders" };
    }
  }
  const plain = body.replace(/\s+/g, " ").slice(0, 220);
  return { subject: "Flowbridge replied to your message", heading: "You have a new reply from Flowbridge", intro: "Flowbridge replied to your message. Open your inbox to continue the conversation.", preview: plain, button: "Open inbox", href: "/dashboard/messages" };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getNotificationStartAt() {
  const configuredStart = process.env.USER_MESSAGE_NOTIFICATIONS_START_AT;
  if (!configuredStart) return null;

  const parsedStart = new Date(configuredStart);
  if (Number.isNaN(parsedStart.getTime())) {
    return null;
  }

  return parsedStart.toISOString();
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const resendKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!resendKey || !adminEmail) {
    return NextResponse.json(
      { error: "RESEND_API_KEY or ADMIN_EMAIL is missing." },
      { status: 500 }
    );
  }

  const cutoff = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const startAt = getNotificationStartAt();
  let query = supabaseAdmin
    .from("messages")
    .select("id,client_id,subject,body,created_at,profiles(email,username,company_name)")
    .eq("status", "replied")
    .is("user_seen_at", null)
    .is("user_notified_at", null)
    .lte("created_at", cutoff);

  if (startAt) {
    query = query.gte("created_at", startAt);
  }

  const { data, error } = await query.order("created_at", { ascending: true }).limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const resend = new Resend(resendKey);
  const sender = `Flowbridge Digital <${adminEmail}>`;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://flowbridgedigital.org";
  const dueMessages = (data ?? []) as DueMessage[];
  const latestByClient = new Map<string, NotificationCandidate>();

  dueMessages.forEach((message) => {
    const profile = Array.isArray(message.profiles)
      ? message.profiles[0]
      : message.profiles;
    const existing = latestByClient.get(message.client_id);

    if (
      !existing ||
      new Date(message.created_at).getTime() >
        new Date(existing.created_at).getTime()
    ) {
      latestByClient.set(message.client_id, {
        ...message,
        profile,
      });
    }
  });

  let sent = 0;

  for (const message of latestByClient.values()) {
    const email = message.profile?.email;
    if (!email) continue;

    const name =
      message.profile?.company_name || message.profile?.username || "there";
    const content = notificationContent(message.body);
    const { error: sendError } = await resend.emails.send({
      from: sender,
      to: email,
      subject: content.subject,
      html: `
        <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
          <h2 style="margin: 0 0 16px;">${escapeHtml(content.heading)}</h2>
          <p>Hi ${escapeHtml(name)},</p>
          <p>${escapeHtml(content.intro)}</p>
          <div style="margin: 20px 0; padding: 16px; white-space: pre-line; background: #f1f5f9; border-radius: 10px;">${escapeHtml(content.preview)}</div>
          <a href="${siteUrl}${content.href}" style="display: inline-block; background: #0f172a; color: #ffffff; padding: 12px 18px; border-radius: 8px; text-decoration: none;">${escapeHtml(content.button)}</a>
        </div>
      `,
      text: `${content.heading}\n\n${content.intro}\n\n${content.preview}\n\n${siteUrl}${content.href}`,
    });

    if (!sendError) {
      let updateQuery = supabaseAdmin
        .from("messages")
        .update({ user_notified_at: new Date().toISOString() })
        .eq("client_id", message.client_id)
        .eq("status", "replied")
        .is("user_seen_at", null)
        .is("user_notified_at", null)
        .lte("created_at", message.created_at);

      if (startAt) {
        updateQuery = updateQuery.gte("created_at", startAt);
      }

      await updateQuery;
      sent += 1;
    } else {
      console.error("User reply notification failed:", sendError);
    }
  }

  return NextResponse.json({
    checked: dueMessages.length,
    conversations: latestByClient.size,
    sent,
    startAt,
  });
}
