import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!url || !anonKey || !serviceKey || !stripeSecret) return NextResponse.json({ error: "Card setup is unavailable right now." }, { status: 500 });

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Sign in to save a card." }, { status: 401 });
  const auth = createClient(url, anonKey);
  const { data: authData, error: authError } = await auth.auth.getUser(token);
  const user = authData.user;
  if (authError || !user) return NextResponse.json({ error: "Your session has expired." }, { status: 401 });

  const admin = createClient(url, serviceKey);
  const { data: profile, error: profileError } = await admin.from("profiles").select("stripe_customer_id,email").eq("id", user.id).maybeSingle();
  if (profileError) return NextResponse.json({ error: "Unable to load your billing profile." }, { status: 500 });

  const stripe = new Stripe(stripeSecret);
  let customerId = (profile?.stripe_customer_id as string | null) ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: profile?.email || user.email, metadata: { flowbridge_user_id: user.id } }, { idempotencyKey: `flowbridge-customer-${user.id}` });
    customerId = customer.id;
    const { error } = await admin.from("profiles").upsert({ id: user.id, email: profile?.email || user.email, stripe_customer_id: customerId }, { onConflict: "id" });
    if (error) return NextResponse.json({ error: "Unable to prepare secure card setup." }, { status: 500 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://flowbridgedigital.org";
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "setup",
      currency: "usd",
      customer: customerId,
      payment_method_types: ["card"],
      setup_intent_data: { metadata: { user_id: user.id } },
      success_url: `${siteUrl}/dashboard/billing?card=added`,
      cancel_url: `${siteUrl}/dashboard/billing?card=canceled`,
    });
    if (!session.url) return NextResponse.json({ error: "Stripe did not return a card setup link." }, { status: 502 });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to start secure card setup." }, { status: 500 });
  }
}
