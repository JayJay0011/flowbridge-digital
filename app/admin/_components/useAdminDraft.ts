"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type AdminDraftOptions<T> = {
  storageKey: string;
  value: T;
  onRestore: (value: T) => void;
  enabled?: boolean;
};

export function useAdminDraft<T>({
  storageKey,
  value,
  onRestore,
  enabled = true,
}: AdminDraftOptions<T>) {
  const readyRef = useRef(false);
  const [status, setStatus] = useState<"idle" | "restored" | "saved">("idle");

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const savedValue = window.localStorage.getItem(storageKey);
    if (savedValue) {
      try {
        onRestore(JSON.parse(savedValue) as T);
        setStatus("restored");
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }

    readyRef.current = true;
    // Restore only once for this form. Re-running after each render would overwrite typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, enabled]);

  useEffect(() => {
    if (!enabled || !readyRef.current || typeof window === "undefined") return;

    const timer = window.setTimeout(() => {
      window.localStorage.setItem(storageKey, JSON.stringify(value));
      setStatus("saved");
    }, 500);

    return () => window.clearTimeout(timer);
  }, [storageKey, value, enabled]);

  const clearDraft = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(storageKey);
    }
    setStatus("idle");
  }, [storageKey]);

  return { clearDraft, status };
}
