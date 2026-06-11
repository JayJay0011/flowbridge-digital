import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const BUCKET = "public-assets";
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function getSupabaseAuthClient(token: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });
}

function getExtension(file: File) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

function cleanSection(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "general";
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9/-]+/g, "-")
      .replace(/\/+/g, "/")
      .replace(/(^\/|\/$)/g, "") || "general"
  );
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : "";

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAuth = getSupabaseAuthClient(token);
    const { data: userData } = await supabaseAuth.auth.getUser(token);
    const user = userData.user;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing image file" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Upload a JPG, PNG, or WebP image." },
        { status: 400 }
      );
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "Image must be 8MB or smaller." },
        { status: 400 }
      );
    }

    const bucketOptions = {
      public: true,
      fileSizeLimit: MAX_IMAGE_SIZE,
      allowedMimeTypes: Array.from(ALLOWED_TYPES),
    };

    const { error: bucketError } = await supabaseAdmin.storage.createBucket(
      BUCKET,
      bucketOptions
    );

    if (
      bucketError &&
      !bucketError.message.toLowerCase().includes("already exists")
    ) {
      return NextResponse.json({ error: bucketError.message }, { status: 500 });
    }

    if (bucketError) {
      await supabaseAdmin.storage.updateBucket(BUCKET, bucketOptions);
    }

    const section = cleanSection(formData.get("section"));
    const filePath = `admin-media/${section}/${user.id}/${Date.now()}.${getExtension(
      file
    )}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicUrl } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(filePath);

    return NextResponse.json({ url: publicUrl.publicUrl });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
