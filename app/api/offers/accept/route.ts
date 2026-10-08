import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceKey) {
    return NextResponse.json({ error: "Offer service is unavailable." }, { status: 500 });
  }

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Sign in to accept this offer." }, { status: 401 });

  const auth = createClient(url, anonKey);
  const { data: userData, error: authError } = await auth.auth.getUser(token);
  const userId = userData.user?.id;
  if (authError || !userId) return NextResponse.json({ error: "Your session has expired. Please sign in again." }, { status: 401 });

  const body = await request.json().catch(() => null) as { offerId?: string; decision?: "accepted" | "rejected" } | null;
  if (!body?.offerId || !["accepted", "rejected"].includes(body.decision || "")) return NextResponse.json({ error: "Choose whether to accept or reject this offer." }, { status: 400 });

  const admin = createClient(url, serviceKey);
  const { data, error } = await admin
    .from("offers")
    .update({ status: body.decision })
    .eq("id", body.offerId)
    .eq("client_id", userId)
    .eq("status", "sent")
    .select("id")
    .maybeSingle();

  if (error) return NextResponse.json({ error: "Unable to accept this offer." }, { status: 500 });
  if (!data) return NextResponse.json({ error: "This offer is no longer available to accept." }, { status: 409 });
  return NextResponse.json({ decision: body.decision });
}
