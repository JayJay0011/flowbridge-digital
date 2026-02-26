"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { playNotification } from "../../lib/notifications";

type Message = {
  id: string;
  subject: string | null;
  body: string;
  status: string | null;
  created_at: string;
};

const offerPrefix = "__offer__:";

export default function DashboardMessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [agentTyping, setAgentTyping] = useState(false);
  const [agentOnline, setAgentOnline] = useState(false);
  const [replyTo, setReplyTo] = useState<{ author: string; excerpt: string } | null>(
    null
  );
  const [offersById, setOffersById] = useState<Record<string, { status: string }>>(
    {}
  );
  const typingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const lastTypingSentRef = useRef<number>(0);
  const endRef = useRef<HTMLDivElement | null>(null);

  const loadMessages = async (clientId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("id,subject,body,status,created_at")
      .eq("client_id", clientId)
      .order("created_at", { ascending: true });
    setMessages(data ?? []);
    setLoading(false);
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
        .some((item: any) => item.role === "agent");
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
    endRef.current?.scrollIntoView({ behavior: "smooth" });
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
    if (!draft.trim() || !userId) return;
    setSending(true);
    setError(null);

    const replyPrefix = replyTo
      ? `Replying to: ${replyTo.author}: "${replyTo.excerpt}"\n---\n`
      : "";

    const { data, error: insertError } = await supabase
      .from("messages")
      .insert({
        client_id: userId,
        subject: "Chat",
        body: `${replyPrefix}${draft.trim()}`,
        status: "new",
      })
      .select("id,subject,body,status,created_at");

    if (insertError) {
      setError(insertError.message);
      setSending(false);
      return;
    }

    (data ?? []).forEach((item) => upsertMessage(item));
    setDraft("");
    setReplyTo(null);
    setSending(false);
  };

  const updateOfferStatus = async (offerId: string, status: string) => {
    const { data, error } = await supabase
      .from("offers")
      .update({ status })
      .eq("id", offerId)
      .select("id,status")
      .single();

    if (error || !data) return;
    setOffersById((prev) => ({ ...prev, [data.id]: { status: data.status } }));
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
            /^(Attachment|Voice note):\s*(https?:\/\/\S+)/i
          );
          if (match) {
            const label = match[1];
            const url = match[2];
            return (
              <div key={`${label}-${index}`} className="text-xs">
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
      const { data } = await supabase
        .from("offers")
        .select("id,status")
        .in("id", uniqueIds);

      if (!data) return;
      setOffersById((prev) => {
        const next = { ...prev };
        data.forEach((row) => {
          next[row.id] = { status: row.status };
        });
        return next;
      });
    };

    loadOffers();
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

      <div className="border border-[var(--dash-border)] rounded-2xl p-6 bg-[var(--dash-surface-2)]">
        {loading ? (
          <div className="text-[var(--dash-muted)]">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-[var(--dash-muted)]">
            No messages yet. Start a conversation below.
          </div>
        ) : (
          <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2">
            {messages.map((message) => {
              const isAgent = message.status === "replied";
              const parsed = parseReply(message.body);
              const replyExcerpt = parsed.reply
                ? parsed.reply.slice(0, 120)
                : message.body.slice(0, 120);
              const offer = parseOffer(message.body);

              if (offer) {
                const offerStatus = offersById[offer.offerId]?.status ?? "sent";
                return (
                  <div key={message.id} className="flex justify-start">
                    <div className="max-w-[70%] w-full border border-[var(--dash-border)] rounded-2xl bg-[var(--dash-surface)] p-4 shadow-sm">
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
                          {offerStatus === "rejected" && "Offer rejected"}
                          {offerStatus === "withdrawn" && "Offer withdrawn"}
                        </div>
                        <div className="flex items-center gap-2">
                          {offerStatus === "sent" ? (
                            <>
                              <button
                                type="button"
                                onClick={async () => {
                                  await updateOfferStatus(offer.offerId, "accepted");
                                  if (offer.gigSlug) {
                                    router.push(`/checkout/${offer.gigSlug}`);
                                  }
                                }}
                                className="text-xs px-3 py-2 rounded-lg bg-slate-900 text-white"
                              >
                                Accept offer
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  updateOfferStatus(offer.offerId, "rejected")
                                }
                                className="text-xs px-3 py-2 rounded-lg border border-[var(--dash-border)]"
                              >
                                Reject offer
                              </button>
                            </>
                          ) : null}
                          {offerStatus === "accepted" ? (
                            <>
                              <button
                                type="button"
                                onClick={() => router.push("/dashboard/orders")}
                                className="text-xs underline text-[var(--dash-strong)]"
                              >
                                View order
                              </button>
                              <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">
                                Offer accepted
                              </span>
                            </>
                          ) : null}
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
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
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
            className="w-full border border-[var(--dash-border)] bg-transparent rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex items-center justify-between">
            <p className="text-xs text-[var(--dash-muted)]">
              We typically respond within 1 business day.
            </p>
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || !draft.trim()}
              className="px-5 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition disabled:opacity-60"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
