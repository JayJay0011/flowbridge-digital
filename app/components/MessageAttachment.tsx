"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function MessageAttachment({
  path,
  label,
}: {
  path: string;
  label: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openAttachment = async () => {
    setBusy(true);
    setError(null);
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      setError("Sign in again to open this file.");
      setBusy(false);
      return;
    }
    const response = await fetch(`/api/messages/attachment?path=${encodeURIComponent(path)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.url) {
      setError(result.error || "Unable to open attachment.");
      setBusy(false);
      return;
    }
    window.location.assign(result.url);
  };

  return (
    <span className="inline-flex flex-col items-start">
      <button type="button" onClick={openAttachment} disabled={busy} className="underline disabled:opacity-60">
        {busy ? "Opening…" : label}
      </button>
      {error ? <span role="alert" className="text-xs text-red-600">{error}</span> : null}
    </span>
  );
}
