import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceKey) return NextResponse.json({ error: "Referral signup is temporarily unavailable." }, { status: 500 });
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Sign in to apply this referral." }, { status: 401 });
  const auth = createClient(url, anonKey);
  const { data: authData, error: authError } = await auth.auth.getUser(token);
  const user = authData.user;
  if (authError || !user) return NextResponse.json({ error: "Your session has expired." }, { status: 401 });
  const body = await request.json().catch(() => null) as { referralCode?: string } | null;
  const referralCode = body?.referralCode?.trim().toUpperCase();
  if (!referralCode || !/^[A-F0-9]{10}$/.test(referralCode)) return NextResponse.json({ error: "That referral link is not valid." }, { status: 400 });

  const admin = createClient(url, serviceKey);
  const { data: referrer, error: referrerError } = await admin.from("profiles").select("id").eq("referral_code", referralCode).maybeSingle();
  if (referrerError) return NextResponse.json({ error: "Unable to verify that referral link." }, { status: 500 });
  if (!referrer) return NextResponse.json({ error: "That referral link is not valid." }, { status: 404 });
  if (referrer.id === user.id) return NextResponse.json({ error: "You cannot use your own referral link." }, { status: 400 });

  const { data: profile, error: profileError } = await admin.from("profiles").select("referred_by").eq("id", user.id).maybeSingle();
  if (profileError) return NextResponse.json({ error: "Unable to apply this referral." }, { status: 500 });
  if (profile?.referred_by) return NextResponse.json({ applied: true });
  const { error } = await admin.from("profiles").upsert({ id: user.id, email: user.email, referred_by: referrer.id }, { onConflict: "id" });
  if (error) return NextResponse.json({ error: "Unable to save referral attribution." }, { status: 500 });
  return NextResponse.json({ applied: true });
}
