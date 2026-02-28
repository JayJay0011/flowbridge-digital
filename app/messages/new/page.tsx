"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function NewMessagePage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSending(true);
    setError(null);

    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user.id;

    if (!userId) {
      router.push("/login?mode=signup");
      return;
    }

    const { error: insertError } = await supabase.from("messages").insert({
      client_id: userId,
      subject,
      body,
      status: "new",
    });

    if (insertError) {
      setError(insertError.message);
      setSending(false);
      return;
    }

    router.push("/dashboard?message=sent");
  };

  return (
    <main className="bg-[var(--background)] text-[var(--foreground)]">
      <section className="py-16 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <h1 className="text-3xl font-semibold">Message Flowbridge</h1>
          <p className="text-slate-600 mt-2">
            Send a note to our team and we will respond within 1 business day.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <form className="grid gap-6" onSubmit={onSubmit}>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="Automation Systems Blueprint"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Message</label>
              <textarea
                rows={6}
                value={body}
                onChange={(event) => setBody(event.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="Tell us about your project and timeline..."
                required
              />
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition disabled:opacity-60"
            >
              {sending ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
