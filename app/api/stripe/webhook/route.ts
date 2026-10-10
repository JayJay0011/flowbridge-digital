import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function orderEmailHtml(title: string, shortId: string, amount: string, paidAt: string, dashboardUrl: string, isAdmin: boolean, buyerName: string, buyerEmail: string, packageName: string) {
  const heading = isAdmin ? "A new order has been paid" : "Your payment is confirmed";
  const intro = isAdmin ? "A customer completed payment for this Flowbridge order." : "Thanks for your purchase. Keep this receipt for your records.";
  return `
    <div style="margin:0;background:#f1f5f9;padding:32px 12px;font-family:Arial,sans-serif;color:#0f172a;line-height:1.5">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden">
        <div style="background:#0b1020;padding:28px 32px;color:#ffffff"><div style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#cbd5e1">Flowbridge Digital</div><h1 style="font-size:24px;margin:12px 0 0">${escapeHtml(heading)}</h1></div>
        <div style="padding:28px 32px"><p style="margin:0 0 22px;color:#475569">${escapeHtml(intro)}</p>
          <table role="presentation" style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:10px">
            <tr><td style="padding:13px 16px;color:#64748b;border-bottom:1px solid #e2e8f0">Order</td><td style="padding:13px 16px;text-align:right;font-weight:bold;border-bottom:1px solid #e2e8f0">${escapeHtml(title)}</td></tr>
            <tr><td style="padding:13px 16px;color:#64748b;border-bottom:1px solid #e2e8f0">Order ID</td><td style="padding:13px 16px;text-align:right;border-bottom:1px solid #e2e8f0">${escapeHtml(shortId)}</td></tr>
            ${isAdmin ? `<tr><td style="padding:13px 16px;color:#64748b;border-bottom:1px solid #e2e8f0">Customer</td><td style="padding:13px 16px;text-align:right;border-bottom:1px solid #e2e8f0">${escapeHtml(buyerName)}</td></tr><tr><td style="padding:13px 16px;color:#64748b;border-bottom:1px solid #e2e8f0">Customer email</td><td style="padding:13px 16px;text-align:right;border-bottom:1px solid #e2e8f0">${escapeHtml(buyerEmail)}</td></tr>` : ""}
            <tr><td style="padding:13px 16px;color:#64748b;border-bottom:1px solid #e2e8f0">Package</td><td style="padding:13px 16px;text-align:right;border-bottom:1px solid #e2e8f0">${escapeHtml(packageName)}</td></tr>
            <tr><td style="padding:13px 16px;color:#64748b;border-bottom:1px solid #e2e8f0">Paid on</td><td style="padding:13px 16px;text-align:right;border-bottom:1px solid #e2e8f0">${escapeHtml(paidAt)}</td></tr>
            <tr><td style="padding:15px 16px;color:#64748b;font-weight:bold">Total paid</td><td style="padding:15px 16px;text-align:right;font-size:18px;font-weight:bold">${escapeHtml(amount)}</td></tr>
          </table>
          <p style="margin:22px 0"><a href="${escapeHtml(dashboardUrl)}" style="display:inline-block;background:#0f172a;color:#ffffff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:bold">${isAdmin ? "Open order in admin" : "View your order"}</a></p>
          <p style="margin:0;color:#64748b;font-size:12px">Payment processed securely by Stripe. This email contains no card details.</p>
        </div>
      </div>
    </div>`;
}

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

      let { data: order, error: orderError } = await supabaseAdmin.from("orders")
        .select("id,receipt_email_sent_at,admin_order_email_sent_at")
        .eq("stripe_session_id", session.id)
        .maybeSingle();
      if (orderError) return NextResponse.json({ error: "Unable to check existing order." }, { status: 500 });
      if (!order) {
        const inserted = await supabaseAdmin.from("orders").insert({
          client_id: userId,
          gig_id: gigId || null,
          offer_id: offerId || null,
          status: "in_progress",
          package_tier: offerId ? "custom_offer" : packageTier || null,
          amount_cents: amountCents,
          currency: session.currency || "usd",
          stripe_session_id: session.id,
          payment_status: "paid",
        }).select("id,receipt_email_sent_at,admin_order_email_sent_at").single();
        order = inserted.data;
        orderError = inserted.error;
        if (orderError?.code === "23505") {
          const existing = await supabaseAdmin.from("orders").select("id,receipt_email_sent_at,admin_order_email_sent_at").eq("stripe_session_id", session.id).single();
          order = existing.data;
          orderError = existing.error;
        }
      }
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

      const resendKey = process.env.RESEND_API_KEY;
      const adminEmail = process.env.ADMIN_EMAIL;
      if (!resendKey || !adminEmail) {
        console.error("Order email delivery requires RESEND_API_KEY and ADMIN_EMAIL.");
        return NextResponse.json({ error: "Order saved, but email delivery is not configured." }, { status: 500 });
      }

      const [{ data: profile }, { data: authUser }, gigResult] = await Promise.all([
        supabaseAdmin.from("profiles").select("email,username,company_name").eq("id", userId).maybeSingle(),
        supabaseAdmin.auth.admin.getUserById(userId),
        gigId ? supabaseAdmin.from("gigs").select("title").eq("id", gigId).maybeSingle() : Promise.resolve({ data: null, error: null }),
      ]);
      const recipient = authUser.user?.email || profile?.email || null;
      const buyerName = profile?.company_name || profile?.username || authUser.user?.user_metadata?.full_name || "Flowbridge customer";
      const orderTitle = offer?.title || gigResult.data?.title || "Flowbridge Digital service";
      const packageName = offerId ? "Custom offer" : packageTier || "Service package";
      const currency = (session.currency || "usd").toUpperCase();
      const paidCents = session.amount_total ?? amountCents;
      const paidAmount = new Intl.NumberFormat("en-US", { style: "currency", currency }).format(paidCents / 100);
      const paidAt = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(new Date(session.created * 1000));
      const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://flowbridgedigital.org").replace(/\/+$/, "");
      const orderUrl = `${siteUrl}/dashboard/orders/${encodeURIComponent(order.id)}`;
      const adminOrderUrl = `${siteUrl}/admin/orders/${encodeURIComponent(order.id)}`;
      const resend = new Resend(resendKey);
      const adminSender = `Flowbridge Digital <${adminEmail}>`;

      if (!order.receipt_email_sent_at && recipient) {
        const { error: receiptError } = await resend.emails.send({
          from: adminSender,
          to: recipient,
          subject: `Payment receipt for ${orderTitle}`,
          html: orderEmailHtml(orderTitle, order.id.slice(0, 8), paidAmount, paidAt, orderUrl, false, buyerName, recipient, packageName),
          text: `Payment confirmed\nOrder: ${orderTitle}\nPackage: ${packageName}\nOrder ID: ${order.id.slice(0, 8)}\nPaid on: ${paidAt}\nTotal paid: ${paidAmount}\nView your order: ${orderUrl}`,
        }, { idempotencyKey: `flowbridge-receipt-${order.id}` });
        if (receiptError) {
          console.error("Client order receipt email failed:", receiptError);
          return NextResponse.json({ error: "Order saved, but the customer receipt email failed." }, { status: 500 });
        }
        const { error: receiptStampError } = await supabaseAdmin.from("orders").update({ receipt_email_sent_at: new Date().toISOString() }).eq("id", order.id).is("receipt_email_sent_at", null);
        if (receiptStampError) return NextResponse.json({ error: "Receipt sent, but its delivery record could not be saved." }, { status: 500 });
      } else if (!recipient) {
        console.warn(`No account email is available for order ${order.id}; customer receipt skipped.`);
      }

      if (!order.admin_order_email_sent_at) {
        const { error: adminEmailError } = await resend.emails.send({
          from: adminSender,
          to: adminEmail,
          subject: `New paid order: ${orderTitle}`,
          html: orderEmailHtml(orderTitle, order.id.slice(0, 8), paidAmount, paidAt, adminOrderUrl, true, buyerName, recipient || "Unavailable", packageName),
          text: `New paid order\nOrder: ${orderTitle}\nPackage: ${packageName}\nCustomer: ${buyerName}\nCustomer email: ${recipient || "Unavailable"}\nOrder ID: ${order.id.slice(0, 8)}\nPaid on: ${paidAt}\nTotal paid: ${paidAmount}\nOpen in admin: ${adminOrderUrl}`,
        }, { idempotencyKey: `flowbridge-admin-order-${order.id}` });
        if (adminEmailError) {
          console.error("Admin new-order email failed:", adminEmailError);
          return NextResponse.json({ error: "Order saved, but the admin notification email failed." }, { status: 500 });
        }
        const { error: adminStampError } = await supabaseAdmin.from("orders").update({ admin_order_email_sent_at: new Date().toISOString() }).eq("id", order.id).is("admin_order_email_sent_at", null);
        if (adminStampError) return NextResponse.json({ error: "Admin email sent, but its delivery record could not be saved." }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
