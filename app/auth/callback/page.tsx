"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handle = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      }

      router.replace("/dashboard");
    };

    handle();
  }, [router]);

  return (
    <main className="min-h-screen bg-white text-slate-900 flex items-center justify-center">
      <p className="text-slate-500">Signing you in...</p>
    </main>
  );
}
