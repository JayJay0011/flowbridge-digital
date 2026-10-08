import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceKey) return NextResponse.json({ error: "Billing is temporarily unavailable." }, { status: 500 });
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Sign in to view billing details." }, { status: 401 });
  const auth = createClient(url, anonKey);
  const { data: authData, error: authError } = await auth.auth.getUser(token);
  if (authError || !authData.user) return NextResponse.json({ error: "Your session has expired." }, { status: 401 });

  const admin = createClient(url, serviceKey);
  const { data, error } = await admin.from("profiles")
    .select("stripe_customer_id,stripe_default_payment_method_id,stripe_card_brand,stripe_card_last4,stripe_card_exp_month,stripe_card_exp_year")
    .eq("id", authData.user.id).maybeSingle();
  if (error) return NextResponse.json({ error: "Unable to load your saved card." }, { status: 500 });
  return NextResponse.json({
    saved: Boolean(data?.stripe_default_payment_method_id),
    brand: data?.stripe_card_brand ?? null,
    last4: data?.stripe_card_last4 ?? null,
    expMonth: data?.stripe_card_exp_month ?? null,
    expYear: data?.stripe_card_exp_year ?? null,
  });
}
