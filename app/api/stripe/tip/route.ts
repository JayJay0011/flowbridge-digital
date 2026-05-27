import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const MIN_TIP_CENTS = 100;
const MAX_TIP_CENTS = 100000;

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey || !stripeSecret) {
      return NextResponse.json(
        { error: "Payment configuration is missing." },
        { status: 500 }
      );
    }

    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : "";
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    const { data: userData } = await supabaseAuth.auth.getUser(token);
    const userId = userData.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      orderId?: string;
      amountCents?: number;
    };
    const amountCents = Number(body.amountCents);
    if (
      !body.orderId ||
      !Number.isInteger(amountCents) ||
      amountCents < MIN_TIP_CENTS ||
      amountCents > MAX_TIP_CENTS
    ) {
      return NextResponse.json(
        { error: "Choose a tip between $1 and $1,000." },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("id")
      .eq("id", body.orderId)
      .eq("client_id", userId)
      .eq("status", "complete")
      .single();
    if (!order) {
      return NextResponse.json(
        { error: "Only accepted deliveries can receive a tip." },
        { status: 403 }
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://flowbridgedigital.org";
    const stripe = new Stripe(stripeSecret);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: amountCents,
            product_data: {
              name: "Tip for Flowbridge Digital",
              description: "Optional thank-you tip after completed delivery",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/dashboard/reviews?order=${order.id}&tip=success`,
      cancel_url: `${siteUrl}/dashboard/reviews?order=${order.id}&tip=canceled`,
      metadata: {
        payment_type: "tip",
        order_id: order.id,
        user_id: userId,
        amount_cents: String(amountCents),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Tip checkout failed." },
      { status: 500 }
    );
  }
}
