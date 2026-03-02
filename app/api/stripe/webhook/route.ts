import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing webhook secret." }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Webhook error." },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata || {};
    const gigId = metadata.gig_id;
    const userId = metadata.user_id;
    const packageTier = metadata.package_tier;
    const amountCents = metadata.amount_cents
      ? Number.parseInt(metadata.amount_cents, 10)
      : null;

    if (gigId && userId) {
      await supabaseAdmin.from("orders").insert({
        client_id: userId,
        gig_id: gigId,
        status: "new",
        package_tier: packageTier || null,
        amount_cents: amountCents,
        currency: session.currency || "usd",
        stripe_session_id: session.id,
        payment_status: "paid",
      });
    }
  }

  return NextResponse.json({ received: true });
}
