"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { playNotification } from "../../lib/notifications";
import MessageAttachment from "../../components/MessageAttachment";

type Message = {
  id: string;
  subject: string | null;
  body: string;
  status: string | null;
  created_at: string;
};

const offerPrefix = "__offer__:";
const orderPrefix = "__order__:";
type PendingAttachment = { name: string; path: string; voice?: boolean };

export default function DashboardMessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [agentTyping, setAgentTyping] = useState(false);
  const [agentOnline, setAgentOnline] = useState(false);
  const [replyTo, setReplyTo] = useState<{ author: string; excerpt: string } | null>(
    null
  );
  const [offersById, setOffersById] = useState<Record<string, { status: string }>>(
    {}
  );
  const [acceptingOfferId, setAcceptingOfferId] = useState<string | null>(null);
  const [payingOfferId, setPayingOfferId] = useState<string | null>(null);
  const typingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const lastTypingSentRef = useRef<number>(0);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);

  const refreshOfferStatuses = async (offerIds: string[]) => {
    const uniqueIds = Array.from(new Set(offerIds));
    if (uniqueIds.length === 0) return;
    const { data } = await supabase.from("offers").select("id,status").in("id", uniqueIds);
    if (!data) return;
    setOffersById((previous) => {
      const next = { ...previous };
      data.forEach((offer) => { next[offer.id] = { status: offer.status }; });
      return next;
    });
  };

  const loadMessages = async (clientId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("id,subject,body,status,created_at")
      .eq("client_id", clientId)
      .order("created_at", { ascending: true });
    setMessages(data ?? []);
    setLoading(false);
  };

  const markRepliesSeen = async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    await fetch("/api/messages/seen", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const upsertMessage = (incoming: Message) => {
    setMessages((prev) => {
      if (prev.some((message) => message.id === incoming.id)) {
        return prev;
      }
      return [...prev, incoming].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) {
        setLoading(false);
        return;
      }
      if (isMounted) {
        setUserId(user.id);
      }
      await loadMessages(user.id);
      await markRepliesSeen();
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`messages-client-${userId}`)
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
    if (!userId) return;
    const channel = supabase
      .channel(`orders-client-${userId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders", filter: `client_id=eq.${userId}` }, () => {
        const offerIds = messages.map((message) => parseOffer(message.body)?.offerId).filter((id): id is string => Boolean(id));
        void refreshOfferStatuses(offerIds);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, messages]);

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

  useEffect(() => {
    if (!userId) return;
    const presenceChannel = supabase.channel(`presence-${userId}`, {
      config: { presence: { key: userId } },
    });

    presenceChannel.on("presence", { event: "sync" }, () => {
      const state = presenceChannel.presenceState();
      const online = Object.values(state)
        .flat()
        .some((item) => (item as { role?: string }).role === "agent");
      setAgentOnline(online);
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
  }, [userId]);

  useEffect(() => {
    requestAnimationFrame(() => {
      if (messageListRef.current) {
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      }
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    });
  }, [messages]);

  const lastAgentMessage = useMemo(
    () => [...messages].reverse().find((message) => message.status === "replied"),
    [messages]
  );

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

  const handleSend = async () => {
    if ((!draft.trim() && attachments.length === 0) || !userId || uploading) return;
    setSending(true);
    setError(null);
    setAttachmentError(null);

    const replyPrefix = replyTo
      ? `Replying to: ${replyTo.author}: "${replyTo.excerpt}"\n---\n`
      : "";

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      setError("Please sign in again to send a message.");
      setSending(false);
      return;
    }

    const response = await fetch("/api/messages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject: "Chat",
        body: [replyPrefix + draft.trim(), ...attachments.map((item) => `${item.voice ? "Voice note" : "Attachment"}: storage://${item.path}`)].filter(Boolean).join("\n\n"),
      }),
    });
    const payload = (await response.json()) as {
      message?: Message;
      error?: string;
    };

    if (!response.ok || !payload.message) {
      setError(payload.error || "Unable to send message.");
      setSending(false);
      return;
    }

    upsertMessage(payload.message);
    setDraft("");
    setReplyTo(null);
    setAttachments([]);
    setSending(false);
  };

  const uploadAttachment = async (file: File, voice = false) => {
    if (!userId) return;
    setUploading(true);
    setAttachmentError(null);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Please sign in again before uploading.");
      const form = new FormData();
      form.set("file", file);
      form.set("clientId", userId);
      const response = await fetch("/api/messages/attachment", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form });
      const result = await response.json();
      if (!response.ok || !result.path) throw new Error(result.error || "Upload failed.");
      setAttachments((previous) => [...previous, { name: file.name, path: result.path, voice }]);
    } catch (uploadError) {
      setAttachmentError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void uploadAttachment(file);
    event.target.value = "";
  };

  const startRecording = async () => {
    setAttachmentError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") throw new Error("Voice recording is not supported by this browser.");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      recordingChunksRef.current = [];
      const preferredType = ["audio/webm", "audio/ogg", "audio/mp4"].find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, preferredType ? { mimeType: preferredType } : undefined);
      recorder.ondataavailable = (event) => { if (event.data.size) recordingChunksRef.current.push(event.data); };
      recorder.onstop = () => {
        const mimeType = (recorder.mimeType || "audio/webm").split(";")[0];
        const extension = mimeType === "audio/ogg" ? "ogg" : mimeType === "audio/mp4" ? "m4a" : "webm";
        const file = new File(recordingChunksRef.current, `voice-note-${Date.now()}.${extension}`, { type: mimeType });
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setRecording(false);
        if (file.size) void uploadAttachment(file, true);
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch (recordError) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setAttachmentError(recordError instanceof Error ? recordError.message : "Could not start recording.");
    }
  };

  const stopRecording = () => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    recorderRef.current = null;
  };

  const updateOfferStatus = async (offerId: string, status: string) => {
    if (status === "accepted" || status === "rejected") {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setError("Please sign in again to accept this offer.");
        return false;
      }
      const response = await fetch("/api/offers/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ offerId, decision: status }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setError(payload.error || "Unable to accept this offer.");
        return false;
      }
      setOffersById((prev) => ({ ...prev, [offerId]: { status } }));
      return true;
    }
    const { data, error } = await supabase
      .from("offers")
      .update({ status })
      .eq("id", offerId)
      .eq("status", "sent")
      .select("id,status")
      .single();

    if (error || !data) return false;
    setOffersById((prev) => ({ ...prev, [data.id]: { status: data.status } }));
    return true;
  };

  const parseReply = (body: string) => {
    const divider = "\n---\n";
    if (!body.startsWith("Replying to:") || !body.includes(divider)) {
      return { reply: null, content: body };
    }
    const [header, rest] = body.split(divider);
    return {
      reply: header.replace("Replying to:", "").trim(),
      content: rest.trim(),
    };
  };

  const parseOffer = (body: string) => {
    if (!body.startsWith(offerPrefix)) return null;
    try {
      const raw = body.replace(offerPrefix, "").trim();
      return JSON.parse(raw) as {
        offerId: string;
        title: string;
        description: string;
        gigSlug?: string;
        price?: string;
        deliveryDate?: string;
        revisions?: string;
        deliverables?: string;
      };
    } catch {
      return null;
    }
  };

  const parseOrder = (body: string) => {
    if (!body.startsWith(orderPrefix)) return null;
    try {
      return JSON.parse(body.slice(orderPrefix.length)) as {
        orderId: string;
        title: string;
        amountCents: number | null;
        currency: string;
        offerId?: string | null;
      };
    } catch {
      return null;
    }
  };

  const renderMessageBody = (body: string) => {
    const parsed = parseReply(body);
    return (
      <div className="space-y-2">
        {parsed.reply ? (
          <div className="text-xs rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-2)] px-3 py-2 text-[var(--dash-muted)]">
            Replying to {parsed.reply}
          </div>
        ) : null}
        {parsed.content.split("\n").map((line, index) => {
          const trimmed = line.trim();
          const match = trimmed.match(
            /^(Attachment|Voice note):\s*(https?:\/\/\S+|storage:\/\/\S+)/i
          );
          if (match) {
            const label = match[1];
            const url = match[2];
            const storagePath = url.startsWith("storage://") ? url.slice("storage://".length) : null;
            return (
              <div key={`${label}-${index}`} className="text-xs">
                {label}:{" "}
                {storagePath ? <MessageAttachment path={storagePath} label="Open" /> : <a href={url} target="_blank" rel="noreferrer" className="underline">Open</a>}
              </div>
            );
          }

          return (
            <p key={`${line}-${index}`} className="text-sm whitespace-pre-wrap">
              {line}
            </p>
          );
        })}
      </div>
    );
  };

  useEffect(() => {
    const offerIds = messages
      .map((message) => parseOffer(message.body)?.offerId)
      .filter((id): id is string => Boolean(id));

    if (offerIds.length === 0) return;

    const loadOffers = async () => {
      const uniqueIds = Array.from(new Set(offerIds));
      await refreshOfferStatuses(uniqueIds);
    };

    loadOffers();
  }, [messages]);

  useEffect(() => {
    const refresh = () => {
      const ids = messages.map((message) => parseOffer(message.body)?.offerId).filter((id): id is string => Boolean(id));
      void refreshOfferStatuses(ids);
    };
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [messages]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`offers-client-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "offers",
          filter: `client_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as { id: string; status: string };
          setOffersById((prev) => ({
            ...prev,
            [row.id]: { status: row.status },
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold">Messages</h2>
        <p className="text-[var(--dash-muted)] mt-2">
          Conversations with the Flowbridge team.
        </p>
        <div className="mt-3 flex items-center gap-3 text-xs text-[var(--dash-muted)]">
          <span
            className={`h-2 w-2 rounded-full ${
              agentOnline ? "bg-emerald-500" : "bg-slate-400"
            }`}
          />
          {agentOnline
            ? "Flowbridge online"
            : lastAgentMessage
            ? `Last seen ${new Date(lastAgentMessage.created_at).toLocaleString()}`
            : "Flowbridge offline"}
        </div>
      </div>

      <div className="border border-[var(--dash-border)] rounded-2xl p-4 md:p-6 bg-[var(--dash-surface-2)]">
        {loading ? (
          <div className="text-[var(--dash-muted)]">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-[var(--dash-muted)]">
            No messages yet. Start a conversation below.
          </div>
        ) : (
          <div
            ref={messageListRef}
            className="space-y-4 max-h-[50vh] md:max-h-[520px] overflow-y-auto md:pr-2"
          >
            {messages.map((message) => {
              const isAgent = message.status === "replied";
              const parsed = parseReply(message.body);
              const replyExcerpt = parsed.reply
                ? parsed.reply.slice(0, 120)
                : message.body.slice(0, 120);
              const offer = parseOffer(message.body);
              const paidOrder = parseOrder(message.body);

              if (paidOrder) {
                const amount = paidOrder.amountCents
                  ? new Intl.NumberFormat(undefined, { style: "currency", currency: paidOrder.currency.toUpperCase() }).format(paidOrder.amountCents / 100)
                  : "Paid";
                return (
                  <div key={message.id} className="flex justify-start">
                    <div className="w-full md:max-w-[70%] rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
                      <p className="text-sm font-semibold">Payment confirmed · {paidOrder.title}</p>
                      <p className="mt-1 text-sm">{amount} received. Your order is now in your Orders dashboard.</p>
                      <button type="button" onClick={() => router.push(`/dashboard/orders?order=${encodeURIComponent(paidOrder.orderId)}`)} className="mt-3 text-sm font-semibold underline">View order</button>
                    </div>
                  </div>
                );
              }

              if (offer) {
                const offerStatus = offersById[offer.offerId]?.status ?? "sent";
                const offerOrder = messages.map((item) => parseOrder(item.body)).find((item) => item?.offerId === offer.offerId);
                return (
                  <div key={message.id} className="flex justify-start">
                  <div className="w-full md:max-w-[70%] border border-[var(--dash-border)] rounded-2xl bg-[var(--dash-surface)] p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold">{offer.title}</h4>
                        {offer.price ? (
                          <span className="text-sm font-semibold text-[var(--dash-strong)]">
                            {offer.price}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm text-[var(--dash-muted)] mt-2">
                        {offer.description}
                      </p>
                      {offerStatus === "sent" ? <p className="mt-3 rounded-lg bg-[var(--dash-surface-2)] p-3 text-xs text-[var(--dash-muted)]">Review the scope and amount above. Accepting records your agreement; payment is a separate step.</p> : null}
                      {offerStatus === "accepted" ? <p className="mt-3 rounded-lg bg-[var(--dash-surface-2)] p-3 text-xs text-[var(--dash-muted)]">You accepted the agreed scope. Complete payment to start the order.</p> : null}
                      <div className="mt-3 text-xs text-[var(--dash-muted)] flex flex-wrap gap-3">
                        {offer.deliveryDate ? (
                          <span>Delivery: {offer.deliveryDate}</span>
                        ) : null}
                        {offer.revisions ? (
                          <span>Revisions: {offer.revisions}</span>
                        ) : null}
                      </div>
                      {offer.deliverables ? (
                        <div className="mt-3 text-xs text-[var(--dash-muted)]">
                          Deliverables: {offer.deliverables}
                        </div>
                      ) : null}

                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-xs text-[var(--dash-muted)]">
                          {offerStatus === "sent" && "Offer sent"}
                          {offerStatus === "accepted" && "Offer accepted"}
                          {offerStatus === "paid" && "Paid"}
                          {offerStatus === "rejected" && "Offer rejected"}
                          {offerStatus === "withdrawn" && "Offer withdrawn"}
                        </div>
                        <div className="flex items-center gap-2">
                          {offerStatus === "sent" ? (
                            <>
                              <button
                                type="button"
                                onClick={async () => {
                                  setAcceptingOfferId(offer.offerId);
                                  const accepted = await updateOfferStatus(offer.offerId, "accepted");
                                  if (!accepted) setAcceptingOfferId(null);
                                }}
                                disabled={acceptingOfferId === offer.offerId}
                                className="text-xs px-3 py-2 rounded-lg bg-slate-900 text-white"
                              >
                                {acceptingOfferId === offer.offerId ? "Accepting…" : "Accept offer"}
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  setAcceptingOfferId(offer.offerId);
                                  const rejected = await updateOfferStatus(offer.offerId, "rejected");
                                  if (!rejected) setAcceptingOfferId(null);
                                }}
                                disabled={acceptingOfferId === offer.offerId}
                                className="text-xs px-3 py-2 rounded-lg border border-[var(--dash-border)]"
                              >
                                {acceptingOfferId === offer.offerId ? "Updating…" : "Reject offer"}
                              </button>
                            </>
                          ) : null}
                          {offerStatus === "accepted" && payingOfferId !== offer.offerId ? (
                            <>
                              <button type="button" onClick={() => { setPayingOfferId(offer.offerId); void (async () => {
                                const { data } = await supabase.auth.getSession();
                                const token = data.session?.access_token;
                                if (!token) { setError("Please sign in again to continue."); setPayingOfferId(null); return; }
                                const response = await fetch("/api/stripe/checkout", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ offerId: offer.offerId }) });
                                const payload = await response.json();
                                if (response.ok && payload.url) window.location.href = payload.url;
                                else { setError(payload.error || "Unable to start payment."); setPayingOfferId(null); }
                              })(); }} disabled={payingOfferId === offer.offerId} className="text-xs px-3 py-2 rounded-lg bg-slate-900 text-white disabled:opacity-60">Pay now</button>
                            </>
                          ) : null}
                          {offerStatus === "accepted" && payingOfferId === offer.offerId ? <span className="text-xs text-[var(--dash-muted)]">Opening Stripe Checkout…</span> : null}
                          {offerStatus === "paid" ? <><span aria-disabled="true" className="cursor-not-allowed text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-500">Offer accepted</span>{offerOrder ? <button type="button" onClick={() => router.push(`/dashboard/orders?order=${encodeURIComponent(offerOrder.orderId)}`)} className="text-xs px-3 py-2 rounded-lg bg-slate-900 text-white">View order</button> : null}</> : null}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={message.id}
                  className={`flex ${isAgent ? "justify-start" : "justify-end"} group`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 ${
                      isAgent
                        ? "bg-[var(--dash-surface)] text-[var(--dash-text)] border border-[var(--dash-border)]"
                        : "bg-slate-900 text-white"
                    }`}
                  >
                    {renderMessageBody(message.body)}
                    <div
                      className={`mt-2 flex items-center gap-3 text-xs ${
                        isAgent ? "text-[var(--dash-muted)]" : "text-slate-300"
                      }`}
                    >
                      <span>
                        {isAgent ? "Flowbridge" : "You"} ·{" "}
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setReplyTo({
                            author: isAgent ? "Flowbridge" : "You",
                            excerpt: replyExcerpt,
                          })
                        }
                        className="opacity-0 group-hover:opacity-100 transition text-xs"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {agentTyping ? (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-3 bg-[var(--dash-surface)] border border-[var(--dash-border)] text-[var(--dash-muted)]">
                  <div className="typing-indicator">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              </div>
            ) : null}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <div className="border border-[var(--dash-border)] rounded-2xl p-4 bg-[var(--dash-surface)]">
        <div className="flex flex-col gap-3">
          {replyTo ? (
            <div className="flex items-center justify-between rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-2)] px-3 py-2 text-xs text-[var(--dash-muted)]">
              <span>Replying to {replyTo.author}</span>
              <button type="button" onClick={() => setReplyTo(null)}>
                ✕
              </button>
            </div>
          ) : null}
          <textarea
            rows={3}
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              sendTyping();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your message..."
            className="w-full border border-[var(--dash-border)] bg-transparent rounded-xl px-4 py-3 text-sm text-[var(--dash-text)] placeholder:text-[var(--dash-muted)] focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          {error && <div className="text-sm text-red-600">{error}</div>}
          {attachments.length ? <div className="flex flex-wrap gap-2">{attachments.map((item) => <span key={item.path} className="rounded-full bg-[var(--dash-surface-2)] px-3 py-1 text-xs">{item.voice ? "Voice" : "File"}: {item.name}<button type="button" aria-label={`Remove ${item.name}`} onClick={() => setAttachments((current) => current.filter((entry) => entry.path !== item.path))} className="ml-2">×</button></span>)}</div> : null}
          {attachmentError ? <div role="alert" className="text-sm text-red-600">{attachmentError}</div> : null}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-[var(--dash-muted)]">
              We typically respond within 1 business day.
            </p>
            <div className="flex items-center gap-2">
              <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,.csv,.doc,.docx,.xls,.xlsx,.ppt,.pptx" onChange={handleFileChange} />
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading || sending} className="h-10 w-10 rounded-full border border-[var(--dash-border)] hover:bg-[var(--dash-surface-2)] disabled:opacity-50" title="Attach a file" aria-label="Attach a file">📎</button>
              <button type="button" onClick={recording ? stopRecording : () => void startRecording()} disabled={uploading || sending} className={`h-10 w-10 rounded-full border border-[var(--dash-border)] hover:bg-[var(--dash-surface-2)] disabled:opacity-50 ${recording ? "text-red-600" : ""}`} title={recording ? "Stop voice recording" : "Record a voice note"} aria-label={recording ? "Stop voice recording" : "Record a voice note"}>{recording ? "■" : "🎙️"}</button>
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || uploading || (!draft.trim() && attachments.length === 0)}
              className="px-5 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition disabled:opacity-60"
            >
              {uploading ? "Uploading…" : sending ? "Sending..." : "Send"}
            </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
