import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

type MessageRequest = {
  subject?: string;
  body?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Messaging configuration is missing." },
        { status: 500 }
      );
    }

    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : "";
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    const { data: userData } = await supabaseAuth.auth.getUser(token);
    const user = userData.user;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as MessageRequest;
    const content = body.body?.trim();
    if (!content) {
      return NextResponse.json(
        { error: "Please enter a message." },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const [{ data: message, error: messageError }, { data: profile }] =
      await Promise.all([
        supabaseAdmin
          .from("messages")
          .insert({
            client_id: user.id,
            subject: body.subject?.trim() || "Message",
            body: content,
            status: "new",
          })
          .select("id,subject,body,status,created_at")
          .single(),
        supabaseAdmin
          .from("profiles")
          .select("username,company_name")
          .eq("id", user.id)
          .maybeSingle(),
      ]);

    if (messageError || !message) {
      return NextResponse.json(
        { error: messageError?.message || "Unable to send message." },
        { status: 500 }
      );
    }

    const resendKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL || "admin@flowbridgedigital.org";
    if (resendKey) {
      const sender =
        process.env.NOTIFICATION_FROM_EMAIL ||
        "Flowbridge Digital <noreply@flowbridgedigital.org>";
      const contactName =
        profile?.company_name || profile?.username || user.email || "Account";
      const dashboardUrl = `${
        process.env.NEXT_PUBLIC_SITE_URL || "https://flowbridgedigital.org"
      }/admin/messages`;
      const resend = new Resend(resendKey);
      const { error: emailError } = await resend.emails.send({
        from: sender,
        to: adminEmail,
        subject: `New Flowbridge message from ${contactName}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
            <h2 style="margin: 0 0 16px;">New message received</h2>
            <p><strong>From:</strong> ${escapeHtml(contactName)}</p>
            <p><strong>Email:</strong> ${escapeHtml(user.email || "Unavailable")}</p>
            <p><strong>Subject:</strong> ${escapeHtml(message.subject || "Message")}</p>
            <div style="margin: 20px 0; padding: 16px; background: #f1f5f9; border-radius: 10px; white-space: pre-wrap;">${escapeHtml(content)}</div>
            <a href="${dashboardUrl}" style="display: inline-block; background: #0f172a; color: #ffffff; padding: 12px 18px; border-radius: 8px; text-decoration: none;">Open inbox</a>
          </div>
        `,
      });
      if (emailError) {
        console.error("Message notification email failed:", emailError);
      }
    } else {
      console.warn("RESEND_API_KEY is missing; message email notification skipped.");
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Message submission error:", error);
    return NextResponse.json(
      { error: "Unable to send message." },
      { status: 500 }
    );
  }
}
