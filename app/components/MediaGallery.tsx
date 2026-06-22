"use client";

import { useMemo, useState } from "react";

export type GalleryMediaItem = {
  url: string;
  type?: "image" | "video";
  alt?: string;
};

type MediaGalleryProps = {
  items: GalleryMediaItem[];
  title: string;
  emptyLabel?: string;
  className?: string;
};

function getMediaType(item: GalleryMediaItem) {
  if (item.type) return item.type;
  return /\.(mp4|webm|mov)(\?|#|$)/i.test(item.url) ? "video" : "image";
}

export default function MediaGallery({
  items,
  title,
  emptyLabel = "Media preview",
  className = "",
}: MediaGalleryProps) {
  const mediaItems = useMemo(
    () => items.filter((item) => item.url?.trim()),
    [items]
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const activeItem = mediaItems[activeIndex];
  const activeType = activeItem ? getMediaType(activeItem) : "image";

  const move = (direction: -1 | 1) => {
    if (!mediaItems.length) return;
    setActiveIndex(
      (current) => (current + direction + mediaItems.length) % mediaItems.length
    );
  };

  const renderMedia = (
    item: GalleryMediaItem,
    variant: "main" | "lightbox" | "thumb"
  ) => {
    const type = getMediaType(item);
    const commonClass =
      variant === "thumb"
        ? "h-full w-full object-cover"
        : "h-full w-full object-contain";

    if (type === "video") {
      return (
        <div className="relative h-full w-full bg-slate-950">
          <video
            src={item.url}
            controls={variant !== "thumb"}
            muted={variant === "thumb"}
            playsInline
            className={commonClass}
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="rotate-[-24deg] text-sm font-semibold uppercase tracking-[0.35em] text-white/25 md:text-xl">
              Flowbridge Digital
            </span>
          </div>
        </div>
      );
    }

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.url}
        alt={item.alt || title}
        className={commonClass}
      />
    );
  };

  if (!activeItem) {
    return (
      <div
        className={`flex aspect-[16/9] items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-400 ${className}`}
      >
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="group relative block aspect-[16/9] w-full cursor-zoom-in"
          aria-label={`Preview ${title} fullscreen`}
        >
          {renderMedia(activeItem, "main")}
          <span className="absolute right-4 top-4 rounded-full bg-slate-950/80 px-4 py-2 text-sm font-semibold text-white opacity-95 shadow-sm transition group-hover:bg-slate-900">
            Full Screen
          </span>
        </button>
        {mediaItems.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => move(-1)}
              className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl font-semibold text-slate-900 shadow"
              aria-label="Previous media"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl font-semibold text-slate-900 shadow"
              aria-label="Next media"
            >
              ›
            </button>
          </>
        ) : null}
      </div>

      {mediaItems.length > 1 ? (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {mediaItems.map((item, index) => (
            <button
              key={`${item.url}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative h-20 min-w-28 overflow-hidden rounded-xl border bg-slate-100 ${
                index === activeIndex
                  ? "border-slate-950 ring-2 ring-slate-950/10"
                  : "border-slate-200"
              }`}
              aria-label={`Show media ${index + 1}`}
            >
              {renderMedia(item, "thumb")}
              {getMediaType(item) === "video" ? (
                <span className="absolute bottom-1 left-1 rounded bg-slate-950/80 px-2 py-1 text-[10px] font-semibold uppercase text-white">
                  Video
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}

      {lightboxOpen ? (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/95"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} fullscreen preview`}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-5 top-5 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl text-slate-900 shadow"
            aria-label="Close preview"
          >
            ×
          </button>
          {mediaItems.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => move(-1)}
                className="absolute left-5 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-3xl text-slate-900 shadow"
                aria-label="Previous media"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => move(1)}
                className="absolute right-5 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-3xl text-slate-900 shadow"
                aria-label="Next media"
              >
                ›
              </button>
            </>
          ) : null}
          <div className="flex h-full w-full items-center justify-center p-4 md:p-12">
            {renderMedia(activeItem, "lightbox")}
          </div>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white">
            {activeIndex + 1} / {mediaItems.length} · {activeType}
          </div>
        </div>
      ) : null}
    </div>
  );
}
