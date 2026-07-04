import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const BUCKET = "public-assets";
const MAX_IMAGE_SIZE = 20 * 1024 * 1024;
const MAX_VIDEO_SIZE = 80 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const ALLOWED_TYPES = new Set([
  ...Array.from(ALLOWED_IMAGE_TYPES),
  ...Array.from(ALLOWED_VIDEO_TYPES),
]);

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
  if (file.type === "video/mp4") return "mp4";
  if (file.type === "video/webm") return "webm";
  if (file.type === "video/quicktime") return "mov";
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
        { error: "Upload a JPG, PNG, WebP, MP4, WebM, or MOV file." },
        { status: 400 }
      );
    }

    const maxFileSize = file.type.startsWith("video/")
      ? MAX_VIDEO_SIZE
      : MAX_IMAGE_SIZE;

    if (file.size > maxFileSize) {
      return NextResponse.json(
        {
          error: file.type.startsWith("video/")
            ? "Video must be 80MB or smaller."
            : "Image must be 20MB or smaller.",
        },
        { status: 400 }
      );
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
      const normalizedError = uploadError.message.toLowerCase();
      const message =
        normalizedError.includes("maximum") ||
        normalizedError.includes("exceeded") ||
        normalizedError.includes("file size")
        ? `Storage rejected the processed upload (${Math.ceil(file.size / 1024)}KB). The public-assets bucket limit may be misconfigured.`
        : uploadError.message;
      return NextResponse.json({ error: message }, { status: 500 });
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
