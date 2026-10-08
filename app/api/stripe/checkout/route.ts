import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const parsePriceToCents = (value?: string | null) => {
  if (!value) return null;
  const match = value.match(/[\d,.]+/);
  if (!match) return null;
  const normalized = match[0].replace(/,/g, "");
  const amount = Number.parseFloat(normalized);
  if (Number.isNaN(amount) || amount <= 0) return null;
  return Math.round(amount * 100);
};

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: "Supabase environment variables are missing." },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      return NextResponse.json(
        { error: "Stripe secret key is missing." },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecret);

    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : null;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userData } = await supabaseAuth.auth.getUser(token);
    const userId = userData.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const gigId = body?.gigId as string | undefined;
    const packageKey = body?.packageKey as "basic" | "standard" | "premium";
    const offerId = body?.offerId as string | undefined;

    const { data: billingProfile, error: billingProfileError } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .maybeSingle();
    if (billingProfileError) {
      return NextResponse.json({ error: "Unable to load your billing profile." }, { status: 500 });
    }

    if (offerId) {
      const { data: offer, error: offerError } = await supabaseAdmin
        .from("offers")
        .select("id,client_id,gig_id,title,description,price,delivery_date,deliverables,status,stripe_session_id")
        .eq("id", offerId)
        .eq("client_id", userId)
        .eq("status", "accepted")
        .single();

      if (offerError || !offer) {
        return NextResponse.json({ error: "Accepted offer not found." }, { status: 404 });
      }

      if (offer.stripe_session_id) {
        const existingSession = await stripe.checkout.sessions.retrieve(offer.stripe_session_id);
        if (existingSession.status === "open" && existingSession.url) return NextResponse.json({ url: existingSession.url });
        const { error: clearSessionError } = await supabaseAdmin
          .from("offers")
          .update({ stripe_session_id: null })
          .eq("id", offer.id)
          .eq("stripe_session_id", offer.stripe_session_id);
        if (clearSessionError) return NextResponse.json({ error: "Unable to refresh offer checkout. Please try again." }, { status: 500 });
      }

      const amountCents = parsePriceToCents(offer.price);
      if (!amountCents) {
        return NextResponse.json({ error: "This offer does not have a valid payment amount." }, { status: 400 });
      }

      const { data: priorOrder, error: priorOrderError } = await supabaseAdmin
        .from("orders")
        .select("id")
        .eq("client_id", userId)
        .eq("offer_id", offer.id)
        .eq("payment_status", "paid")
        .maybeSingle();
      if (priorOrderError) return NextResponse.json({ error: "Unable to verify offer payment status." }, { status: 500 });
      if (priorOrder) return NextResponse.json({ error: "This offer has already been paid." }, { status: 409 });

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://flowbridgedigital.org";
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        ...(billingProfile?.stripe_customer_id ? { customer: billingProfile.stripe_customer_id } : {}),
        ...(!billingProfile?.stripe_customer_id && userData.user?.email ? { customer_email: userData.user.email } : {}),
        line_items: [{
          price_data: {
            currency: "usd",
            unit_amount: amountCents,
            product_data: {
              name: offer.title || "Flowbridge custom offer",
              description: [offer.description, offer.deliverables].filter(Boolean).join(" — ").slice(0, 500) || undefined,
            },
          },
          quantity: 1,
        }],
        success_url: `${siteUrl}/dashboard/orders?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/dashboard/messages?offer=${offer.id}&payment=canceled`,
        client_reference_id: offer.id,
        metadata: {
          payment_type: "offer",
          offer_id: offer.id,
          gig_id: offer.gig_id || "",
          user_id: userId,
          amount_cents: String(amountCents),
        },
      });

      const { data: savedOffer, error: saveSessionError } = await supabaseAdmin
        .from("offers")
        .update({ stripe_session_id: session.id })
        .eq("id", offer.id)
        .eq("client_id", userId)
        .eq("status", "accepted")
        .is("stripe_session_id", null)
        .select("id")
        .maybeSingle();
      if (saveSessionError || !savedOffer) {
        await stripe.checkout.sessions.expire(session.id);
        return NextResponse.json({ error: saveSessionError ? "Unable to prepare offer payment. Please retry." : "A payment session is already open for this offer. Return to your inbox and continue from there." }, { status: saveSessionError ? 500 : 409 });
      }

      return NextResponse.json({ url: session.url });
    }

    if (!gigId || !packageKey) {
      return NextResponse.json({ error: "Missing gig details." }, { status: 400 });
    }

    const { data: gig, error } = await supabaseAdmin
      .from("gigs")
      .select("id,title,slug,package_basic,package_standard,package_premium")
      .eq("id", gigId)
      .single();

    if (error || !gig) {
      return NextResponse.json({ error: "Gig not found." }, { status: 404 });
    }

    const packages = {
      basic: gig.package_basic,
      standard: gig.package_standard,
      premium: gig.package_premium,
    };
    const selectedPackage = packages[packageKey];
    if (!selectedPackage) return NextResponse.json({ error: "Selected package is unavailable." }, { status: 400 });
    const amountCents = parsePriceToCents(selectedPackage?.price);

    if (!amountCents) {
      return NextResponse.json(
        { error: "Package price is missing. Please update the gig pricing." },
        { status: 400 }
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://flowbridgedigital.org";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      ...(billingProfile?.stripe_customer_id ? { customer: billingProfile.stripe_customer_id } : {}),
      ...(!billingProfile?.stripe_customer_id && userData.user?.email ? { customer_email: userData.user.email } : {}),
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: amountCents,
            product_data: {
              name: gig.title,
              description: selectedPackage?.description?.slice(0, 500) || `${packageKey[0].toUpperCase()}${packageKey.slice(1)} package`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/dashboard/orders?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/${gig.slug}?id=${encodeURIComponent(gig.id)}&package=${packageKey}&canceled=1`,
      client_reference_id: `${userId}:${gig.id}:${packageKey}`,
      metadata: {
        gig_id: gig.id,
        user_id: userId,
        package_tier: packageKey,
        amount_cents: String(amountCents),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed." },
      { status: 500 }
    );
  }
}
