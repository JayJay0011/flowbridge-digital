import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

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
  const { data: currentOrder, error: lookupError } = await supabaseAdmin.from("orders").select("id,client_id")
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
  const { error: messageError } = await supabaseAdmin.from("messages").insert({ client_id: order.client_id, subject: "Order delivery submitted", body: deliveryMessage, status: "replied", order_id: order.id });
  if (messageError) console.error("Delivery status updated, but client notification message failed:", messageError.message);
  return NextResponse.json({ order, notificationSent: !messageError });
}
