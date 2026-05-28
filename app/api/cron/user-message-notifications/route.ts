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
  if (!resendKey) {
    return NextResponse.json(
      { error: "RESEND_API_KEY is missing." },
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
  const sender =
    process.env.NOTIFICATION_FROM_EMAIL ||
    "Flowbridge Digital <noreply@flowbridgedigital.org>";
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
    const preview = message.body.replace(/\s+/g, " ").slice(0, 220);
    const { error: sendError } = await resend.emails.send({
      from: sender,
      to: email,
      subject: "Flowbridge replied to your message",
      html: `
        <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
          <h2 style="margin: 0 0 16px;">You have a new reply from Flowbridge</h2>
          <p>Hi ${escapeHtml(name)},</p>
          <p>Flowbridge replied to your message. Open your inbox to continue the conversation.</p>
          <div style="margin: 20px 0; padding: 16px; background: #f1f5f9; border-radius: 10px;">${escapeHtml(preview)}</div>
          <a href="${siteUrl}/dashboard/messages" style="display: inline-block; background: #0f172a; color: #ffffff; padding: 12px 18px; border-radius: 8px; text-decoration: none;">Open inbox</a>
        </div>
      `,
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
