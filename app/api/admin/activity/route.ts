import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

async function authorize(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!url || !anonKey || !token) return false;
  const auth = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data } = await auth.auth.getUser(token);
  if (!data.user) return false;
  const { data: profile } = await supabaseAdmin.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  return profile?.role === "admin";
}

function tableFromRequest(request: Request) {
  const type = new URL(request.url).searchParams.get("type");
  return type === "orders" || type === "reviews" ? type : null;
}

export async function GET(request: Request) {
  if (!(await authorize(request))) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const table = tableFromRequest(request);
  if (!table) return NextResponse.json({ error: "Invalid activity type." }, { status: 400 });
  const { count, error } = await supabaseAdmin.from(table).select("id", { count: "exact", head: true }).is("admin_seen_at", null);
  if (error) return NextResponse.json({ error: "Unable to load activity." }, { status: 500 });
  return NextResponse.json({ count: count || 0 });
}

export async function POST(request: Request) {
  if (!(await authorize(request))) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const table = tableFromRequest(request);
  if (!table) return NextResponse.json({ error: "Invalid activity type." }, { status: 400 });
  const { error } = await supabaseAdmin.from(table).update({ admin_seen_at: new Date().toISOString() }).is("admin_seen_at", null);
  if (error) return NextResponse.json({ error: "Unable to mark activity as seen." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
