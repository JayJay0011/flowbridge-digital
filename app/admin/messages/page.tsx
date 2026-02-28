"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { playNotification } from "../../lib/notifications";
import Link from "next/link";

type Message = {
  id: string;
  client_id: string;
  body: string;
  status: string | null;
  created_at: string;
};

type Profile = {
  id: string;
  username: string | null;
  company_name: string | null;
  avatar_url: string | null;
};

type Gig = {
  id: string;
  title: string;
  price_text: string | null;
  slug: string;
};

type ReplyTarget = {
  id: string;
  author: string;
  excerpt: string;
};

type UploadAttachment = {
  name: string;
  url: string;
};

const quickMessages = [
  "Thanks for the update! I'll review and get back to you shortly.",
  "Got it. I have everything I need to proceed.",
  "I have a few quick follow-up questions before we start.",
];

const emojiOptions = ["😀", "👍", "🚀", "✅", "✨", "💡"];
const offerPrefix = "__offer__:";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [clientTyping, setClientTyping] = useState(false);
  const [clientOnline, setClientOnline] = useState(false);
  const [replyTo, setReplyTo] = useState<ReplyTarget | null>(null);
  const [showQuick, setShowQuick] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [offerForm, setOfferForm] = useState({
    description: "",
    gigId: "",
    deliveryDate: "",
    revisions: "2",
    deliverables: "",
    price: "",
  });
  const [attachments, setAttachments] = useState<UploadAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [offersById, setOffersById] = useState<Record<string, { status: string }>>(
    {}
  );
  const profilesRef = useRef<Record<string, Profile>>({});
  const typingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const lastTypingSentRef = useRef<number>(0);
  const presenceKeyRef = useRef<string>(
    `agent-${Math.random().toString(36).slice(2)}`
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    profilesRef.current = profiles;
  }, [profiles]);

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

  const ensureProfile = async (clientId: string) => {
    if (profilesRef.current[clientId]) return;
    const { data: row } = await supabase
      .from("profiles")
      .select("id,username,company_name,avatar_url")
      .eq("id", clientId)
      .single();
    if (row) {
      setProfiles((prev) => ({ ...prev, [row.id]: row }));
    }
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const { data } = await supabase
        .from("messages")
        .select("id,client_id,body,status,created_at")
        .order("created_at", { ascending: true });

      const clientIds = Array.from(
        new Set((data ?? []).map((item) => item.client_id))
      );

      let profileMap: Record<string, Profile> = {};
      if (clientIds.length > 0) {
        const { data: profileRows } = await supabase
          .from("profiles")
          .select("id,username,company_name,avatar_url")
          .in("id", clientIds);

        profileMap =
          profileRows?.reduce((acc, row) => {
            acc[row.id] = row;
            return acc;
          }, {} as Record<string, Profile>) ?? {};
      }

      const { data: gigRows } = await supabase
        .from("gigs")
        .select("id,title,price_text,slug")
        .eq("status", "published");

      if (isMounted) {
        setMessages(data ?? []);
        setProfiles(profileMap);
        setSelectedClientId((prev) => prev ?? clientIds[0] ?? null);
        setGigs(gigRows ?? []);
        setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("messages-admin")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const incoming = payload.new as Message;
          upsertMessage(incoming);
          ensureProfile(incoming.client_id);
          setSelectedClientId((prev) => prev ?? incoming.client_id);
          if (incoming.status === "new") {
            playNotification();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const conversations = useMemo(() => {
    const map = new Map<
      string,
      { clientId: string; lastMessage: Message; total: number; hasAgentReply: boolean }
    >();

    messages.forEach((message) => {
      const existing = map.get(message.client_id);
      const hasAgentReply = existing?.hasAgentReply || message.status === "replied";
      if (!existing) {
        map.set(message.client_id, {
          clientId: message.client_id,
          lastMessage: message,
          total: 1,
          hasAgentReply,
        });
      } else {
        const latest =
          new Date(message.created_at) > new Date(existing.lastMessage.created_at)
            ? message
            : existing.lastMessage;
        map.set(message.client_id, {
          clientId: message.client_id,
          lastMessage: latest,
          total: existing.total + 1,
          hasAgentReply,
        });
      }
    });

    return Array.from(map.values()).sort(
      (a, b) =>
        new Date(b.lastMessage.created_at).getTime() -
        new Date(a.lastMessage.created_at).getTime()
    );
  }, [messages]);

  const filteredConversations = conversations.filter((conversation) => {
    if (!search.trim()) return true;
    const profile = profiles[conversation.clientId];
    const name = profile?.company_name || profile?.username || "Client";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const selectedMessages = messages.filter(
    (message) => message.client_id === selectedClientId
  );

  const lastClientMessage = useMemo(
    () =>
      [...selectedMessages]
        .reverse()
        .find((message) => message.status === "new"),
    [selectedMessages]
  );

  const sendTyping = () => {
    if (!typingChannelRef.current) return;
    const now = Date.now();
    if (now - lastTypingSentRef.current < 1500) return;
    typingChannelRef.current.send({
      type: "broadcast",
      event: "typing",
      payload: { role: "agent" },
    });
    lastTypingSentRef.current = now;
  };

  const uploadAttachment = async (file: File) => {
    if (!selectedClientId) return;
    setUploading(true);
    try {
      const safeName = file.name.replace(/\s+/g, "-").toLowerCase();
      const path = `admin-attachments/${selectedClientId}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from("public-assets")
        .upload(path, file, { upsert: true });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data: publicUrl } = supabase.storage
        .from("public-assets")
        .getPublicUrl(path);

      setAttachments((prev) => [
        ...prev,
        { name: file.name, url: publicUrl.publicUrl },
      ]);
    } catch {
      // Ignore upload errors for now
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadAttachment(file);
    event.target.value = "";
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
        gigId?: string;
        gigSlug?: string;
        gigTitle?: string;
        price?: string;
        deliveryDate?: string;
        revisions?: string;
        deliverables?: string;
      };
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (!selectedClientId) return;
    setClientTyping(false);
    setClientOnline(false);

    const typingChannel = supabase.channel(`typing-${selectedClientId}`, {
      config: { broadcast: { self: true } },
    });

    typingChannel.on("broadcast", { event: "typing" }, (payload) => {
      if (payload.payload?.role !== "client") return;
      setClientTyping(true);
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = window.setTimeout(() => {
        setClientTyping(false);
      }, 2000);
    });

    typingChannel.subscribe();
    typingChannelRef.current = typingChannel;

    const presenceChannel = supabase.channel(`presence-${selectedClientId}`, {
      config: { presence: { key: presenceKeyRef.current } },
    });

    presenceChannel.on("presence", { event: "sync" }, () => {
      const state = presenceChannel.presenceState();
      const online = Object.values(state)
        .flat()
        .some((item: any) => item.role === "client");
      setClientOnline(online);
    });

    presenceChannel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        presenceChannel.track({
          role: "agent",
          last_seen: new Date().toISOString(),
        });
      }
    });

    return () => {
      supabase.removeChannel(typingChannel);
      supabase.removeChannel(presenceChannel);
      typingChannelRef.current = null;
    };
  }, [selectedClientId]);

  const handleSend = async () => {
    if (!draft.trim() || !selectedClientId) return;
    setSending(true);

    const baseText = draft.trim();
    const replyPrefix = replyTo
      ? `Replying to: ${replyTo.author}: "${replyTo.excerpt}"\n---\n`
      : "";
    const attachmentLines =
      attachments.length > 0
        ? attachments.map((item) => `Attachment: ${item.url}`).join("\n")
        : "";
    const body = [replyPrefix + baseText, attachmentLines]
      .filter(Boolean)
      .join("\n\n");

    const { data, error } = await supabase
      .from("messages")
      .insert({
        client_id: selectedClientId,
        subject: "Support reply",
        body,
        status: "replied",
      })
      .select("id,client_id,body,status,created_at");

    if (error) {
      setSending(false);
      return;
    }

    (data ?? []).forEach((item) => upsertMessage(item));
    setDraft("");
    setReplyTo(null);
    setAttachments([]);
    setSending(false);
  };

  const handleCreateOffer = async () => {
    if (!selectedClientId) return;
    const gig = gigs.find((item) => item.id === offerForm.gigId);

    const { data: offerData, error: offerError } = await supabase
      .from("offers")
      .insert({
        client_id: selectedClientId,
        gig_id: gig?.id ?? null,
        title: gig?.title || "Custom offer",
        description: offerForm.description || "Custom scope",
        price: offerForm.price || null,
        delivery_date: offerForm.deliveryDate || null,
        revisions: offerForm.revisions ? Number(offerForm.revisions) : null,
        deliverables: offerForm.deliverables || null,
        status: "sent",
      })
      .select("id,status")
      .single();

    if (offerError || !offerData) {
      setOfferOpen(false);
      return;
    }

    const payload = {
      offerId: offerData.id,
      title: gig?.title || "Custom offer",
      description: offerForm.description || "Custom scope",
      gigId: gig?.id,
      gigSlug: gig?.slug,
      gigTitle: gig?.title,
      price: offerForm.price || "",
      deliveryDate: offerForm.deliveryDate || "",
      revisions: offerForm.revisions || "",
      deliverables: offerForm.deliverables || "",
    };

    const { data, error } = await supabase
      .from("messages")
      .insert({
        client_id: selectedClientId,
        subject: "Offer",
        body: `${offerPrefix}${JSON.stringify(payload)}`,
        status: "replied",
      })
      .select("id,client_id,body,status,created_at");

    if (error) {
      setOfferOpen(false);
      return;
    }

    setOffersById((prev) => ({
      ...prev,
      [offerData.id]: { status: offerData.status },
    }));
    (data ?? []).forEach((item) => upsertMessage(item));
    setOfferForm({
      description: "",
      gigId: "",
      deliveryDate: "",
      revisions: "2",
      deliverables: "",
      price: "",
    });
    setOfferOpen(false);
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

  const renderLines = (text: string) => {
    return text.split("\n").map((line, index) => {
      const trimmed = line.trim();
      const match = trimmed.match(/^(Attachment|Voice note):\s*(https?:\/\/\S+)/i);
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
    });
  };

  const renderMessageBody = (body: string) => {
    const parsed = parseReply(body);
    return (
      <div className="space-y-2">
        {parsed.reply ? (
          <div className="text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600">
            Replying to {parsed.reply}
          </div>
        ) : null}
        {renderLines(parsed.content)}
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
    const channel = supabase
      .channel("offers-admin")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "offers" },
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
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Admin Inbox
            </p>
            <h1 className="text-3xl font-semibold mt-3">Client Messages</h1>
          </div>
          <div className="text-sm text-slate-500">
            Manage active conversations in one place.
          </div>
        </div>

        <div className="mt-6 bg-white rounded-2xl border border-slate-200 overflow-visible">
          {loading ? (
            <div className="p-8 text-slate-500">Loading messages...</div>
          ) : (
            <div className="grid lg:grid-cols-[260px_1fr_320px]">
              <aside className="border-r border-slate-200 bg-white">
                <div className="p-4 border-b border-slate-200 flex items-center gap-2">
                  <select className="text-sm font-medium text-slate-700">
                    <option>All messages</option>
                  </select>
                  <div className="ml-auto text-slate-400">⌕</div>
                </div>
                <div className="p-4 border-b border-slate-200">
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search clients"
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div className="max-h-[640px] overflow-y-auto">
                  {filteredConversations.length === 0 ? (
                    <div className="p-4 text-sm text-slate-500">
                      No conversations yet.
                    </div>
                  ) : (
                    filteredConversations.map((conversation) => {
                      const profile = profiles[conversation.clientId];
                      const name =
                        profile?.company_name || profile?.username || "Client";
                      const selected =
                        selectedClientId === conversation.clientId;
                      const isNewRequest =
                        !conversation.hasAgentReply &&
                        conversation.total === 1 &&
                        conversation.lastMessage.status === "new";
                      const isUnread =
                        conversation.lastMessage.status === "new" &&
                        !conversation.hasAgentReply;
                      const offerPreview = parseOffer(conversation.lastMessage.body);
                      const previewText = offerPreview
                        ? `Offer: ${offerPreview.title}`
                        : conversation.lastMessage.body;
                      return (
                        <button
                          key={conversation.clientId}
                          type="button"
                          onClick={() => setSelectedClientId(conversation.clientId)}
                          className={`w-full text-left px-4 py-4 border-b border-slate-100 transition ${
                            selected ? "bg-slate-50" : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {profile?.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={profile.avatar_url}
                                alt={name}
                                className="h-10 w-10 rounded-full object-cover border border-slate-200"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
                                {name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold">{name}</p>
                                <span className="text-xs text-slate-400">
                                  {new Date(
                                    conversation.lastMessage.created_at
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-slate-500 truncate max-w-[150px]">
                                  {previewText}
                                </p>
                                {isNewRequest ? (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                    New request
                                  </span>
                                ) : null}
                                {isUnread && !isNewRequest ? (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                                    New
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </aside>

              <section className="flex flex-col border-r border-slate-200">
                {selectedClientId ? (
                  <>
                    <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">
                          {profiles[selectedClientId]?.company_name ||
                            profiles[selectedClientId]?.username ||
                            "Client"}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              clientOnline ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          {clientOnline
                            ? "Online"
                            : lastClientMessage
                            ? `Last seen ${new Date(
                                lastClientMessage.created_at
                              ).toLocaleString()}`
                            : "Offline"}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-slate-400">
                        <span>✎</span>
                        <span>☆</span>
                        <span>⋯</span>
                      </div>
                    </div>

                    <div className="flex-1 px-6 py-6 space-y-4 overflow-y-auto max-h-[520px] bg-slate-50">
                      {selectedMessages.map((message) => {
                        const isAgent = message.status === "replied";
                        const profile =
                          profiles[selectedClientId]?.company_name ||
                          profiles[selectedClientId]?.username ||
                          "Client";
                        const offer = parseOffer(message.body);
                        const parsed = parseReply(message.body);
                        const replyExcerpt = parsed.reply
                          ? parsed.reply.slice(0, 120)
                          : message.body.slice(0, 120);

                        if (offer) {
                          const offerStatus =
                            offersById[offer.offerId]?.status ?? "sent";
                          return (
                            <div
                              key={message.id}
                              className="flex justify-end"
                            >
                              <div className="max-w-[70%] w-full border border-slate-200 rounded-2xl bg-white p-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-semibold">
                                    {offer.title}
                                  </h4>
                                  {offer.price ? (
                                    <span className="text-sm font-semibold text-slate-900">
                                      {offer.price}
                                    </span>
                                  ) : null}
                                </div>
                                <p className="text-sm text-slate-600 mt-2">
                                  {offer.description}
                                </p>
                                <div className="mt-3 text-xs text-slate-500 flex flex-wrap gap-3">
                                  {offer.deliveryDate ? (
                                    <span>Delivery: {offer.deliveryDate}</span>
                                  ) : null}
                                  {offer.revisions ? (
                                    <span>Revisions: {offer.revisions}</span>
                                  ) : null}
                                </div>
                                {offer.deliverables ? (
                                  <div className="mt-3 text-xs text-slate-500">
                                    Deliverables: {offer.deliverables}
                                  </div>
                                ) : null}

                                <div className="mt-4 flex items-center justify-between">
                                  <div className="text-xs text-slate-500">
                                    {offerStatus === "sent" && "Offer sent"}
                                    {offerStatus === "accepted" && "Offer accepted"}
                                    {offerStatus === "rejected" && "Offer rejected"}
                                    {offerStatus === "withdrawn" && "Offer withdrawn"}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {offerStatus === "sent" ? (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          updateOfferStatus(offer.offerId, "withdrawn")
                                        }
                                        className="text-xs px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
                                      >
                                        Withdraw offer
                                      </button>
                                    ) : null}
                                    {offerStatus === "accepted" ? (
                                      <>
                                        <Link
                                          href="/admin/orders"
                                          className="text-xs underline"
                                        >
                                          View order
                                        </Link>
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
                            className={`flex ${isAgent ? "justify-end" : "justify-start"} group`}
                          >
                            <div
                              className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                                isAgent
                                  ? "bg-slate-900 text-white"
                                  : "bg-white text-slate-900 border border-slate-200"
                              }`}
                            >
                              {renderMessageBody(message.body)}
                              <div
                                className={`mt-2 flex items-center gap-3 text-[11px] ${
                                  isAgent ? "text-slate-300" : "text-slate-500"
                                }`}
                              >
                                <span>
                                  {new Date(message.created_at).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setReplyTo({
                                      id: message.id,
                                      author: isAgent ? "You" : profile,
                                      excerpt: replyExcerpt,
                                    })
                                  }
                                  className="opacity-0 group-hover:opacity-100 transition text-[11px]"
                                >
                                  Reply
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {clientTyping ? (
                        <div className="flex justify-start">
                          <div className="rounded-2xl px-4 py-3 bg-white text-slate-500 border border-slate-200">
                            <div className="typing-indicator">
                              <span className="typing-dot" />
                              <span className="typing-dot" />
                              <span className="typing-dot" />
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="px-6 py-4 border-t border-slate-200 bg-white space-y-3">
                      {replyTo ? (
                        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                          <span>Replying to {replyTo.author}</span>
                          <button
                            type="button"
                            onClick={() => setReplyTo(null)}
                            className="text-slate-500"
                          >
                            ✕
                          </button>
                        </div>
                      ) : null}

                      {attachments.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {attachments.map((item) => (
                            <span
                              key={item.url}
                              className="text-[11px] px-2 py-1 rounded-full bg-slate-100 text-slate-600"
                            >
                              {item.name}
                            </span>
                          ))}
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
                        placeholder="Type a message..."
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="h-9 w-9 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                            disabled={uploading}
                            title="Upload"
                          >
                            📎
                          </button>

                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setShowQuick((prev) => !prev)}
                              className="h-9 w-9 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                              title="Quick message"
                            >
                              ⚡
                            </button>
                            {showQuick ? (
                              <div className="absolute bottom-full mb-2 w-64 rounded-xl border border-slate-200 bg-white shadow-lg z-50">
                                {quickMessages.map((text) => (
                                  <button
                                    key={text}
                                    type="button"
                                    onClick={() => {
                                      setDraft((prev) =>
                                        prev ? `${prev}\n\n${text}` : text
                                      );
                                      setShowQuick(false);
                                    }}
                                    className="w-full text-left px-4 py-3 text-xs hover:bg-slate-50"
                                  >
                                    {text}
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </div>

                          <a
                            href="https://cal.com/flow-bridge-digital-tee44g/systems-strategy-consultation"
                            target="_blank"
                            rel="noreferrer"
                            className="h-9 w-9 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                            title="Zoom call"
                          >
                            🎥
                          </a>

                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setShowEmoji((prev) => !prev)}
                              className="h-9 w-9 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                              title="Emoji"
                            >
                              🙂
                            </button>
                            {showEmoji ? (
                              <div className="absolute bottom-full mb-2 flex gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg z-50">
                                {emojiOptions.map((emoji) => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => {
                                      setDraft((prev) => `${prev}${emoji}`);
                                      setShowEmoji(false);
                                    }}
                                    className="text-lg"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setOfferOpen(true)}
                            className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold hover:bg-slate-50"
                          >
                            Create offer
                          </button>
                          <button
                            type="button"
                            onClick={handleSend}
                            disabled={sending || !draft.trim()}
                            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition disabled:opacity-60"
                          >
                            {sending ? "Sending..." : "Send"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-slate-500">
                    Select a conversation to view messages.
                  </div>
                )}
              </section>

              <aside className="bg-white p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">
                    About{" "}
                    {selectedClientId
                      ? profiles[selectedClientId]?.company_name ||
                        profiles[selectedClientId]?.username ||
                        "Client"
                      : "Client"}
                  </h3>
                  <span className="text-xs text-slate-400">Activity</span>
                </div>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Completed orders</span>
                    <span className="font-semibold text-slate-900">—</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Average rating</span>
                    <span className="font-semibold text-slate-900">—</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Last order</span>
                    <span className="font-semibold text-slate-900">—</span>
                  </div>
                </div>

                <div className="mt-8 border-t border-slate-200 pt-4">
                  <h4 className="text-sm font-semibold">Notes</h4>
                  <p className="text-sm text-slate-500 mt-2">
                    Keep track of client preferences, project status, and follow-up dates.
                  </p>
                </div>
              </aside>
            </div>
          )}
        </div>
      </div>

      {offerOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Create offer</h3>
              <button type="button" onClick={() => setOfferOpen(false)}>
                ✕
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Project description</label>
                <textarea
                  rows={3}
                  value={offerForm.description}
                  onChange={(event) =>
                    setOfferForm({ ...offerForm, description: event.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Attach a gig</label>
                <select
                  value={offerForm.gigId}
                  onChange={(event) =>
                    setOfferForm({ ...offerForm, gigId: event.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm"
                >
                  <option value="">Select a gig</option>
                  {gigs.map((gig) => (
                    <option key={gig.id} value={gig.id}>
                      {gig.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Delivery date</label>
                  <input
                    type="date"
                    value={offerForm.deliveryDate}
                    onChange={(event) =>
                      setOfferForm({ ...offerForm, deliveryDate: event.target.value })
                    }
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Revisions</label>
                  <input
                    type="number"
                    value={offerForm.revisions}
                    onChange={(event) =>
                      setOfferForm({ ...offerForm, revisions: event.target.value })
                    }
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Deliverables</label>
                <textarea
                  rows={2}
                  value={offerForm.deliverables}
                  onChange={(event) =>
                    setOfferForm({ ...offerForm, deliverables: event.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm"
                  placeholder="Landing page, CRM pipeline, automation map"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Price</label>
                <input
                  type="text"
                  value={offerForm.price}
                  onChange={(event) =>
                    setOfferForm({ ...offerForm, price: event.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm"
                  placeholder="$1,200"
                />
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setOfferOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateOffer}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold"
              >
                Send offer
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
