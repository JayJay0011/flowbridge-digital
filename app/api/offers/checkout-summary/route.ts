import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceKey) return NextResponse.json({ error: "Offer service is unavailable." }, { status: 500 });

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Sign in to view this offer." }, { status: 401 });
  const auth = createClient(url, anonKey);
  const { data: userData, error: authError } = await auth.auth.getUser(token);
  const userId = userData.user?.id;
  if (authError || !userId) return NextResponse.json({ error: "Your session has expired." }, { status: 401 });

  const offerId = new URL(request.url).searchParams.get("id");
  if (!offerId) return NextResponse.json({ error: "Missing offer reference." }, { status: 400 });
  const admin = createClient(url, serviceKey);
  const { data, error } = await admin.from("offers")
    .select("id,title,description,price,delivery_date,revisions,deliverables,status")
    .eq("id", offerId).eq("client_id", userId).in("status", ["accepted", "paid"]).maybeSingle();
  if (error) return NextResponse.json({ error: "Unable to load offer." }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Accepted offer not found." }, { status: 404 });
  return NextResponse.json({ offer: data });
}
