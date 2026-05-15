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

      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (userId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role,username")
          .eq("id", userId)
          .maybeSingle();

        if (profile?.role === "admin") {
          router.replace("/admin");
          return;
        }

        if (!profile?.username) {
          router.replace("/login?mode=signup&step=username&next=/dashboard");
          return;
        }
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
