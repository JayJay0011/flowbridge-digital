import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const BUCKET = "message-attachments";
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
  "text/csv",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "audio/webm",
  "audio/ogg",
  "audio/mp4",
]);

async function authorize(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!token || !url || !anonKey) return null;

  const auth = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data } = await auth.auth.getUser(token);
  if (!data.user) return null;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();
  return { user: data.user, isAdmin: profile?.role === "admin" };
}

export async function POST(request: Request) {
  const access = await authorize(request);
  if (!access) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  const clientId = form.get("clientId");
  if (!(file instanceof File) || typeof clientId !== "string") {
    return NextResponse.json({ error: "Choose a file and conversation." }, { status: 400 });
  }
  if (access.user.id !== clientId && !access.isAdmin) {
    return NextResponse.json({ error: "You cannot upload to this conversation." }, { status: 403 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Use a PDF, image, text/CSV, Office document, or audio recording." }, { status: 400 });
  }
  if (!file.size || file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Attachments must be smaller than 20 MB." }, { status: 400 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-100) || "attachment";
  const path = `conversations/${clientId}/${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabaseAdmin.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: "3600",
    upsert: false,
  });
  if (error) {
    console.error("Message attachment upload failed:", error.message);
    return NextResponse.json({ error: "Upload failed. Please try again or choose a smaller file." }, { status: 500 });
  }
  return NextResponse.json({ path });
}

export async function GET(request: Request) {
  const access = await authorize(request);
  if (!access) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const path = new URL(request.url).searchParams.get("path") || "";
  const match = path.match(/^conversations\/([0-9a-f-]{36})\/[a-zA-Z0-9._-]+$/i);
  if (!match) return NextResponse.json({ error: "Attachment reference is invalid." }, { status: 400 });
  if (access.user.id !== match[1] && !access.isAdmin) {
    return NextResponse.json({ error: "You cannot access this attachment." }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(path, 60);
  if (error || !data?.signedUrl) return NextResponse.json({ error: "Unable to open this attachment." }, { status: 404 });
  return NextResponse.json({ url: data.signedUrl });
}
