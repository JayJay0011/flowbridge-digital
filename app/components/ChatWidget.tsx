"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";
import { playNotification } from "../lib/notifications";

type Message = {
  id: string;
  body: string;
  status: string | null;
  created_at: string;
};

type UploadEntry = {
  file: File;
  type: "file" | "voice";
};

const offerPrefix = "__offer__:";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploads, setUploads] = useState<UploadEntry[]>([]);
  const [recording, setRecording] = useState(false);
  const [agentTyping, setAgentTyping] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const typingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const lastTypingSentRef = useRef<number>(0);
  const presenceKeyRef = useRef<string>(
    `client-widget-${Math.random().toString(36).slice(2)}`
  );

  const loadMessages = async (clientId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("id,body,status,created_at")
      .eq("client_id", clientId)
      .order("created_at", { ascending: true })
      .limit(25);
    setMessages(data ?? []);
    setLoading(false);
  };

  const upsertMessage = (incoming: Message) => {
    setMessages((prev) => {
      if (prev.some((message) => message.id === incoming.id)) {
        return prev;
      }
      const next = [...prev, incoming].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      return next.slice(-25);
    });
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!isMounted) return;
      setUserId(user?.id ?? null);
      if (user?.id) {
        await loadMessages(user.id);
      } else {
        setMessages([]);
        setLoading(false);
      }
    };

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`messages-widget-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `client_id=eq.${userId}`,
        },
        (payload) => {
          const incoming = payload.new as Message;
          upsertMessage(incoming);
          if (incoming.status === "replied") {
            playNotification();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  useEffect(() => {
    if (!userId || !open) return;
    const presenceChannel = supabase.channel(`presence-${userId}`, {
      config: { presence: { key: presenceKeyRef.current } },
    });

    presenceChannel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        presenceChannel.track({
          role: "client",
          last_seen: new Date().toISOString(),
        });
      }
    });

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [userId, open]);

  useEffect(() => {
    if (!userId) return;
    const typingChannel = supabase.channel(`typing-${userId}`, {
      config: { broadcast: { self: true } },
    });

    typingChannel.on("broadcast", { event: "typing" }, (payload) => {
      if (payload.payload?.role !== "agent") return;
      setAgentTyping(true);
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = window.setTimeout(() => {
        setAgentTyping(false);
      }, 2000);
    });

    typingChannel.subscribe();
    typingChannelRef.current = typingChannel;

    return () => {
      supabase.removeChannel(typingChannel);
      typingChannelRef.current = null;
    };
  }, [userId]);

  const latestPreview = useMemo(() => {
    if (messages.length === 0) return "Ask us anything about your project.";
    return messages[messages.length - 1].body.slice(0, 80);
  }, [messages]);

  const sendTyping = () => {
    if (!typingChannelRef.current) return;
    const now = Date.now();
    if (now - lastTypingSentRef.current < 1500) return;
    typingChannelRef.current.send({
      type: "broadcast",
      event: "typing",
      payload: { role: "client" },
    });
    lastTypingSentRef.current = now;
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "file"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploads((prev) => [...prev, { file, type }]);
    event.target.value = "";
  };

  const startRecording = async () => {
    if (recording) return;
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `voice-note-${Date.now()}.webm`, {
          type: "audio/webm",
        });
        setUploads((prev) => [...prev, { file, type: "voice" }]);
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch (err) {
      setError("Microphone access is required to record a voice note.");
    }
  };

  const stopRecording = () => {
    if (!recorderRef.current) return;
    recorderRef.current.stop();
    recorderRef.current = null;
    setRecording(false);
  };

  const uploadFile = async (file: File, type: "file" | "voice") => {
    if (!userId) return null;
    const safeName = file.name.replace(/\s+/g, "-").toLowerCase();
    const path = `chat-attachments/${userId}/${Date.now()}-${type}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("public-assets")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data: publicUrl } = supabase.storage
      .from("public-assets")
      .getPublicUrl(path);

    return publicUrl.publicUrl;
  };

  const handleSend = async () => {
    if (!draft.trim() || !userId) return;
    setSending(true);
    setError(null);

    try {
      const attachmentLines: string[] = [];

      for (const upload of uploads) {
        const url = await uploadFile(upload.file, upload.type);
        if (url) {
          attachmentLines.push(
            upload.type === "voice" ? `Voice note: ${url}` : `Attachment: ${url}`
          );
        }
      }

      const body = [draft.trim(), ...attachmentLines].join("\n\n");

      const { data, error: insertError } = await supabase
        .from("messages")
        .insert({
          client_id: userId,
          subject: "Chat widget",
          body,
          status: "new",
        })
        .select("id,body,status,created_at");

      if (insertError) {
        throw new Error(insertError.message);
      }

      (data ?? []).forEach((item) => upsertMessage(item));
      setDraft("");
      setUploads([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const renderMessageBody = (body: string) => {
    if (body.startsWith(offerPrefix)) {
      try {
        const raw = body.replace(offerPrefix, "").trim();
        const offer = JSON.parse(raw) as { title: string; price?: string };
        return (
          <div className="text-xs">
            Offer sent: {offer.title}
            {offer.price ? ` · ${offer.price}` : ""}
          </div>
        );
      } catch {
        return <div className="text-xs">Offer sent.</div>;
      }
    }
    return body.split("\n").map((line, index) => {
      const trimmed = line.trim();
      const match = trimmed.match(/^(Attachment|Voice note):\s*(https?:\/\/\S+)/i);
      if (match) {
        const label = match[1];
        const url = match[2];
        return (
          <div key={`${label}-${index}`} className="text-[11px]">
            {label}:{" "}
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Open
            </a>
          </div>
        );
      }
      return (
        <p key={`${line}-${index}`} className="text-xs whitespace-pre-wrap">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="w-[340px] md:w-[380px] rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 bg-slate-900 text-white">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-300">
                Flowbridge
              </p>
              <p className="text-sm font-medium">Live support</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center"
              aria-label="Close chat widget"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-4 py-3 bg-slate-50 text-xs text-slate-500">
            {userId
              ? "Your messages sync to your client dashboard."
              : "Log in to start chatting with Flowbridge."}
          </div>

          <div className="max-h-[280px] overflow-y-auto px-4 py-3 space-y-3 bg-white">
            {loading ? (
              <div className="text-sm text-slate-400">Loading chat...</div>
            ) : messages.length === 0 ? (
              <div className="text-sm text-slate-500">{latestPreview}</div>
            ) : (
              <>
                {messages.slice(-6).map((message) => {
                  const isAgent = message.status === "replied";
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isAgent ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-3 py-2 text-xs whitespace-pre-wrap ${
                          isAgent
                            ? "bg-slate-100 text-slate-900"
                            : "bg-slate-900 text-white"
                        }`}
                      >
                        {renderMessageBody(message.body)}
                      </div>
                    </div>
                  );
                })}
                {agentTyping ? (
                  <div className="flex justify-start">
                    <div className="rounded-2xl px-3 py-2 text-xs bg-slate-100 text-slate-600">
                      <div className="typing-indicator">
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                      </div>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>

          <div className="border-t border-slate-200 px-4 py-4 bg-white">
            {userId ? (
              <div className="space-y-3">
                <textarea
                  rows={2}
                  value={draft}
                  onChange={(event) => {
                    setDraft(event.target.value);
                    sendTyping();
                  }}
                  placeholder="Type a message..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                />

                {uploads.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {uploads.map((upload, index) => (
                      <span
                        key={`${upload.file.name}-${index}`}
                        className="text-[11px] px-2 py-1 rounded-full bg-slate-100 text-slate-600"
                      >
                        {upload.type === "voice" ? "Voice" : "File"}: {upload.file.name}
                      </span>
                    ))}
                  </div>
                ) : null}

                {error && <div className="text-xs text-red-600">{error}</div>}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-medium text-slate-600 cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        onChange={(event) => handleFileChange(event, "file")}
                      />
                      Attach file
                    </label>
                    <button
                      type="button"
                      onClick={recording ? stopRecording : startRecording}
                      className="text-xs font-medium text-slate-600"
                    >
                      {recording ? "Stop recording" : "Record voice"}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={sending || !draft.trim()}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition disabled:opacity-60"
                  >
                    {sending ? "Sending..." : "Send"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-600">
                <Link href="/login" className="text-slate-900 font-semibold">
                  Log in
                </Link>{" "}
                to start messaging Flowbridge.
              </div>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 ml-auto flex items-center gap-3 rounded-full bg-slate-900 text-white px-5 py-3 shadow-lg hover:bg-slate-800 transition"
          aria-label="Open chat widget"
        >
          <span className="text-sm font-semibold">Message Flowbridge</span>
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
        </button>
      )}
    </div>
  );
}
