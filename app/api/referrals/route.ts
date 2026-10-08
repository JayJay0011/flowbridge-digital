import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceKey) return NextResponse.json({ error: "Referral information is temporarily unavailable." }, { status: 500 });
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Sign in to view your referral information." }, { status: 401 });
  const auth = createClient(url, anonKey);
  const { data: authData, error: authError } = await auth.auth.getUser(token);
  const user = authData.user;
  if (authError || !user) return NextResponse.json({ error: "Your session has expired." }, { status: 401 });

  const admin = createClient(url, serviceKey);
  const { data: profile, error: profileError } = await admin.from("profiles").select("referral_code").eq("id", user.id).maybeSingle();
  if (profileError) return NextResponse.json({ error: "Unable to load your referral code." }, { status: 500 });
  let referralCode = profile?.referral_code as string | null;
  if (!referralCode) {
    referralCode = crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase();
    const { data: saved, error } = await admin.from("profiles").upsert({ id: user.id, email: user.email, referral_code: referralCode }, { onConflict: "id" }).select("referral_code").single();
    if (error || !saved?.referral_code) return NextResponse.json({ error: "Unable to create your referral code. Apply the referrals database migration and retry." }, { status: 500 });
    referralCode = saved.referral_code as string;
  }

  const { data: referrals, error: referralError } = await admin.from("profiles").select("id,created_at").eq("referred_by", user.id).order("created_at", { ascending: false });
  if (referralError) return NextResponse.json({ error: "Unable to load referral activity." }, { status: 500 });
  const referredIds = (referrals ?? []).map((item) => item.id);
  let paidClientIds = new Set<string>();
  if (referredIds.length) {
    const { data: orders, error: ordersError } = await admin.from("orders").select("client_id").in("client_id", referredIds).eq("payment_status", "paid");
    if (ordersError) return NextResponse.json({ error: "Unable to load referral activity." }, { status: 500 });
    paidClientIds = new Set((orders ?? []).map((item) => item.client_id).filter((id): id is string => Boolean(id)));
  }

  return NextResponse.json({
    referralCode,
    referralUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://flowbridgedigital.org"}/?ref=${encodeURIComponent(referralCode)}`,
    referrals: (referrals ?? []).map((item) => ({
      id: item.id,
      joinedAt: item.created_at,
      status: paidClientIds.has(item.id) ? "paid" : "joined",
    })),
  });
}
