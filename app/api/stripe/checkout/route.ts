import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

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

    if (!gigId || !packageKey) {
      return NextResponse.json({ error: "Missing gig details." }, { status: 400 });
    }

    const { data: gig, error } = await supabaseAdmin
      .from("gigs")
      .select("id,title,summary,slug,package_basic,package_standard,package_premium")
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
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: amountCents,
            product_data: {
              name: gig.title,
              description: gig.summary || undefined,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/dashboard?payment=success`,
      cancel_url: `${siteUrl}/checkout/${gig.slug}?package=${packageKey}&canceled=1`,
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
