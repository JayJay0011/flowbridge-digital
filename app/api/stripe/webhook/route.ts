import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return NextResponse.json(
      { error: "Supabase environment variables are missing." },
      { status: 500 }
    );
  }
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    return NextResponse.json({ error: "Stripe secret key missing." }, { status: 500 });
  }
  const stripe = new Stripe(stripeSecret);

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

  if (event.type === "setup_intent.succeeded") {
    const setupIntent = event.data.object as Stripe.SetupIntent;
    const userId = setupIntent.metadata?.user_id;
    const customerId = typeof setupIntent.customer === "string" ? setupIntent.customer : setupIntent.customer?.id;
    const paymentMethodId = typeof setupIntent.payment_method === "string" ? setupIntent.payment_method : setupIntent.payment_method?.id;
    if (!userId || !customerId || !paymentMethodId) return NextResponse.json({ error: "Card setup metadata is incomplete." }, { status: 500 });

    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    if (paymentMethod.type !== "card" || !paymentMethod.card) return NextResponse.json({ error: "The saved payment method is not a card." }, { status: 400 });
    await stripe.customers.update(customerId, { invoice_settings: { default_payment_method: paymentMethodId } });
    const { error } = await supabaseAdmin.from("profiles").update({
      stripe_customer_id: customerId,
      stripe_default_payment_method_id: paymentMethodId,
      stripe_card_brand: paymentMethod.card.brand,
      stripe_card_last4: paymentMethod.card.last4,
      stripe_card_exp_month: paymentMethod.card.exp_month,
      stripe_card_exp_year: paymentMethod.card.exp_year,
    }).eq("id", userId);
    if (error) return NextResponse.json({ error: "Card was set up, but the billing profile could not be updated." }, { status: 500 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true });
    }
    const metadata = session.metadata || {};
    if (metadata.payment_type === "tip") {
      const orderId = metadata.order_id;
      const userId = metadata.user_id;
      const amountCents = metadata.amount_cents
        ? Number.parseInt(metadata.amount_cents, 10)
        : null;

      if (orderId && userId && amountCents) {
        const { error: tipError } = await supabaseAdmin.from("tips").upsert(
          {
            order_id: orderId,
            client_id: userId,
            amount_cents: amountCents,
            currency: session.currency || "usd",
            stripe_session_id: session.id,
            status: "paid",
          },
          { onConflict: "stripe_session_id" }
        );
        if (tipError) return NextResponse.json({ error: "Unable to record payment." }, { status: 500 });
      }

      return NextResponse.json({ received: true });
    }

    const gigId = metadata.gig_id;
    const userId = metadata.user_id;
    const packageTier = metadata.package_tier;
    const offerId = metadata.offer_id;
    const amountCents = metadata.amount_cents
      ? Number.parseInt(metadata.amount_cents, 10)
      : null;

    if (!userId || (!gigId && !offerId) || !Number.isSafeInteger(amountCents) || !amountCents || amountCents <= 0) {
      return NextResponse.json({ error: "Payment metadata is incomplete." }, { status: 500 });
    }

    if (userId && (gigId || offerId)) {
      let offer: { title: string | null; delivery_date: string | null } | null = null;
      if (offerId) {
        const { data, error } = await supabaseAdmin
          .from("offers")
          .select("id,client_id,title,delivery_date,status")
          .eq("id", offerId)
          .eq("client_id", userId)
          .in("status", ["accepted", "paid"])
          .single();
        if (error || !data) return NextResponse.json({ error: "Accepted offer not found." }, { status: 500 });
        offer = data;
      }

      const { data: order, error: orderError } = await supabaseAdmin.from("orders").upsert({
        client_id: userId,
        gig_id: gigId || null,
        offer_id: offerId || null,
        status: "new",
        package_tier: offerId ? "custom_offer" : packageTier || null,
        amount_cents: amountCents,
        currency: session.currency || "usd",
        stripe_session_id: session.id,
        payment_status: "paid",
      }, { onConflict: "stripe_session_id" }).select("id").single();
      if (orderError || !order) return NextResponse.json({ error: "Unable to record order." }, { status: 500 });

      const messageTitle = offer?.title || "Your Flowbridge order";
      const { error: messageError } = await supabaseAdmin.from("messages").upsert({
        client_id: userId,
        subject: "Paid order",
        body: `__order__:${JSON.stringify({ orderId: order.id, title: messageTitle, amountCents, currency: session.currency || "usd", offerId: offerId || null })}`,
        status: "replied",
        order_id: order.id,
      }, { onConflict: "order_id,subject" });
      if (messageError) return NextResponse.json({ error: "Order saved, but the conversation update failed." }, { status: 500 });

      if (offerId) {
        const { error: offerUpdateError } = await supabaseAdmin
          .from("offers")
          .update({ status: "paid" })
          .eq("id", offerId)
          .eq("client_id", userId);
        if (offerUpdateError) return NextResponse.json({ error: "Order saved, but offer status update failed." }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
