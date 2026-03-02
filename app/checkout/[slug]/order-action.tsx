"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

type Props = {
  gigId: string;
  packageKey: "basic" | "standard" | "premium";
};

export default function OrderAction({ gigId, packageKey }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      setUserId(user?.id ?? null);
      setLoading(false);
    };
    load();
  }, []);

  const handleOrder = async () => {
    if (!userId) {
      router.push("/login?mode=signup");
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      router.push("/login?mode=signup");
      return;
    }

    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ gigId, packageKey }),
    });

    if (!response.ok) {
      const payload = await response.json();
      setMessage(payload?.error || "Unable to start checkout.");
      setSubmitting(false);
      return;
    }

    const payload = await response.json();
    if (payload?.url) {
      window.location.href = payload.url;
      return;
    }
    setMessage("Unable to start checkout.");
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="text-sm text-slate-500">Checking your account...</div>
    );
  }

  return (
    <div>
      <button
        onClick={handleOrder}
        disabled={submitting}
        className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition disabled:opacity-60"
      >
        {userId ? "Confirm and pay" : "Sign in to Order"}
      </button>
      <p className="text-sm text-slate-500 mt-3">
        {userId
          ? "We will confirm scope and timeline after submission."
          : "You will need an account to place this order."}
      </p>
      {message && <p className="text-sm text-red-600 mt-2">{message}</p>}
    </div>
  );
}
