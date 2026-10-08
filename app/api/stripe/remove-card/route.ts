import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!url || !anonKey || !serviceKey || !stripeSecret) return NextResponse.json({ error: "Billing is temporarily unavailable." }, { status: 500 });
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Sign in to manage your saved card." }, { status: 401 });
  const auth = createClient(url, anonKey);
  const { data: authData, error: authError } = await auth.auth.getUser(token);
  if (authError || !authData.user) return NextResponse.json({ error: "Your session has expired." }, { status: 401 });

  const admin = createClient(url, serviceKey);
  const { data: profile, error: profileError } = await admin.from("profiles")
    .select("stripe_customer_id,stripe_default_payment_method_id")
    .eq("id", authData.user.id).single();
  if (profileError) return NextResponse.json({ error: "Unable to load your billing profile." }, { status: 500 });
  if (!profile.stripe_default_payment_method_id) return NextResponse.json({ removed: true });

  const stripe = new Stripe(stripeSecret);
  try {
    if (profile?.stripe_customer_id) {
      await stripe.customers.update(profile.stripe_customer_id, { invoice_settings: { default_payment_method: "" } });
    }
    await stripe.paymentMethods.detach(profile?.stripe_default_payment_method_id);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to remove the saved card." }, { status: 502 });
  }
  const { error } = await admin.from("profiles").update({
    stripe_default_payment_method_id: null,
    stripe_card_brand: null,
    stripe_card_last4: null,
    stripe_card_exp_month: null,
    stripe_card_exp_year: null,
  }).eq("id", authData.user.id);
  if (error) return NextResponse.json({ error: "The card was removed from Stripe, but your billing profile could not be updated." }, { status: 500 });
  return NextResponse.json({ removed: true });
}
