"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type AdminTable =
  | "blog_posts"
  | "case_studies"
  | "gigs"
  | "portfolio"
  | "services";

type AdminDeleteButtonProps = {
  table: AdminTable;
  id: string;
  label: string;
  onDeleted: () => void;
};

export default function AdminDeleteButton({
  table,
  id,
  label,
  onDeleted,
}: AdminDeleteButtonProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete "${label}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeleting(true);
    setError(null);
    const { error: deleteError } = await supabase.from(table).delete().eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      setDeleting(false);
      return;
    }

    onDeleted();
    setDeleting(false);
  };

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="text-sm font-semibold text-red-600 transition hover:text-red-700 disabled:opacity-60"
      >
        {deleting ? "Deleting..." : "Delete"}
      </button>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </span>
  );
}
