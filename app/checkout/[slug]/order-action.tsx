"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function OrderAction({ gigId }: { gigId: string }) {
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

    const { error } = await supabase.from("orders").insert({
      client_id: userId,
      gig_id: gigId,
      status: "new",
    });

    if (error) {
      setMessage(error.message);
      setSubmitting(false);
      return;
    }

    router.push("/dashboard?order=created");
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
        {userId ? "Continue to Order" : "Sign in to Order"}
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
