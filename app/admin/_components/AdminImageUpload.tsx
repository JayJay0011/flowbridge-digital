"use client";

import Image from "next/image";
import { useState, type ChangeEvent } from "react";
import { supabase } from "../../lib/supabaseClient";

type AdminImageUploadProps = {
  label: string;
  section: string;
  value?: string | null;
  multiple?: boolean;
  watermark?: boolean;
  accept?: "image" | "video" | "media";
  helperText?: string;
  onUploaded: (urls: string[]) => void;
};

const MAX_CANVAS_WIDTH = 1400;
const TARGET_IMAGE_SIZE = 1.8 * 1024 * 1024;
const ACCEPT_MAP = {
  image: "image/jpeg,image/png,image/webp",
  video: "video/mp4,video/webm,video/quicktime",
  media: "image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime",
};

async function loadImage(file: File) {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = document.createElement("img");
    image.decoding = "async";
    image.src = objectUrl;
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function canvasToFile(
  canvas: HTMLCanvasElement,
  originalName: string,
  quality: number
) {
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", quality)
  );

  if (!blob) return null;

  return new File([blob], originalName.replace(/\.[^.]+$/, ".webp"), {
    type: "image/webp",
  });
}

async function addWatermark(file: File) {
  const image = await loadImage(file);
  const scale = Math.min(1, MAX_CANVAS_WIDTH / image.naturalWidth);
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) return file;

  context.drawImage(image, 0, 0, width, height);
  context.save();
  context.translate(width / 2, height / 2);
  context.rotate((-28 * Math.PI) / 180);
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = "600 22px Arial, sans-serif";

  const spacingX = 300;
  const spacingY = 190;
  for (let y = -height; y <= height; y += spacingY) {
    for (let x = -width; x <= width; x += spacingX) {
      context.strokeStyle = "rgba(15, 23, 42, 0.2)";
      context.lineWidth = 3;
      context.strokeText("Flowbridge Digital", x, y);
      context.fillStyle = "rgba(255, 255, 255, 0.32)";
      context.fillText("Flowbridge Digital", x, y);
    }
  }
  context.restore();

  for (const quality of [0.78, 0.68, 0.58, 0.48]) {
    const compressedFile = await canvasToFile(canvas, file.name, quality);
    if (!compressedFile) continue;
    if (compressedFile.size <= TARGET_IMAGE_SIZE || quality === 0.48) {
      return compressedFile;
    }
  }

  return file;
}

export default function AdminImageUpload({
  label,
  section,
  value,
  multiple = false,
  watermark = false,
  accept = "image",
  helperText,
  onUploaded,
}: AdminImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
      ? Array.from(event.target.files)
      : [];
    if (!selectedFiles.length) return;

    setUploading(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Sign in again before uploading media.");
      }

      const urls: string[] = [];
      for (const selectedFile of selectedFiles) {
        const file =
          watermark && selectedFile.type.startsWith("image/")
            ? await addWatermark(selectedFile)
            : selectedFile;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("section", section);

        const response = await fetch("/api/admin/media", {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: formData,
        });
        const payload = (await response.json()) as {
          url?: string;
          error?: string;
        };

        if (!response.ok || !payload.url) {
          throw new Error(payload.error || "Upload failed.");
        }

        urls.push(payload.url);
      }

      onUploaded(urls);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Upload failed."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="grid gap-3">
      <label className="text-sm font-semibold">{label}</label>
      {value ? (
        <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          {/\.(mp4|webm|mov)(\?|#|$)/i.test(value) ? (
            <video src={value} controls className="h-full w-full object-cover" />
          ) : (
            <Image
              src={value}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 480px"
            />
          )}
        </div>
      ) : null}
      <input
        type="file"
        accept={ACCEPT_MAP[accept]}
        multiple={multiple}
        onChange={handleChange}
        disabled={uploading}
        className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:opacity-60"
      />
      {helperText ? <p className="text-xs text-slate-500">{helperText}</p> : null}
      {uploading ? (
        <p className="text-xs font-semibold text-slate-600">
          Uploading{watermark ? " with Flowbridge watermark" : ""}...
        </p>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
