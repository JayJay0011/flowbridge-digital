import { NextResponse } from "next/server";
import { supabasePublic } from "../../lib/supabasePublic";

type AiSupportMessage = {
  role: "user" | "assistant";
  content: string;
};

type GigContext = {
  title: string;
  slug: string;
  summary: string | null;
  price_text: string | null;
};

type ServiceContext = {
  title: string;
  slug: string;
  description: string | null;
};

const bookingUrl =
  "https://cal.com/flow-bridge-digital-tee44g/systems-strategy-consultation";

function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://flowbridgedigital.org"
  );
}

async function getBusinessContext() {
  const siteUrl = getSiteUrl();
  const [{ data: gigs }, { data: services }] = await Promise.all([
    supabasePublic
      .from("gigs")
      .select("title,slug,summary,price_text")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(12),
    supabasePublic
      .from("services")
      .select("title,slug,description")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  const gigLines = ((gigs ?? []) as GigContext[])
    .map(
      (gig) =>
        `- ${gig.title}: ${gig.summary || "Service gig"}${
          gig.price_text ? ` (${gig.price_text})` : ""
        } | ${siteUrl}/gigs/${gig.slug}`
    )
    .join("\n");

  const serviceLines = ((services ?? []) as ServiceContext[])
    .map(
      (service) =>
        `- ${service.title}: ${service.description || "Flowbridge service"} | ${siteUrl}/services/${service.slug}`
    )
    .join("\n");

  return `
Current Flowbridge links:
- Strategy consultation booking: ${bookingUrl}
- Browse all gigs: ${siteUrl}/gigs
- Search Zapier-related gigs: ${siteUrl}/gigs?q=zapier
- Contact page: ${siteUrl}/contact
- Sign in / create account: ${siteUrl}/login
- Account inbox: ${siteUrl}/dashboard/messages
- Account orders: ${siteUrl}/dashboard/orders

Published gigs:
${gigLines || "- No published gigs loaded."}

Published services:
${serviceLines || "- No published services loaded."}
`;
}

function buildSystemPrompt(businessContext: string) {
  return `
You are Flowbridge Digital's website support assistant.
Flowbridge Digital builds automation systems, CRM pipelines, growth infrastructure, platform dashboards, and operational support systems for businesses.
Answer briefly, practically, and in a helpful sales-support tone.
Use only the concrete links and service/gig context below. Never output placeholders like "[Insert link]".
Do not invent pricing, delivery guarantees, legal terms, or private company details.
You do not have permission to access private accounts, private orders, Stripe payment records, or hidden admin data.
You cannot create orders, modify orders, issue refunds, take payments, or change account data.
If the visitor asks about an active order, refund, revision, account issue, or payment issue, tell them to use Message team or open their dashboard inbox/orders.
If the visitor asks for the booking link, provide the exact strategy consultation booking URL.
If the visitor asks for Zapier, automation, CRM, or a gig link, provide the most relevant published gig/service link from the context. If no exact match exists, use the all-gigs or search link.
If the visitor seems ready to buy, recommend browsing services or booking a strategy consultation.

${businessContext}
`;
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI support is not configured yet." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as { messages?: AiSupportMessage[] };
    const messages = (body.messages ?? [])
      .filter(
        (message) =>
          (message.role === "user" || message.role === "assistant") &&
          message.content.trim()
      )
      .slice(-8);

    if (!messages.length) {
      return NextResponse.json(
        { error: "Please enter a question." },
        { status: 400 }
      );
    }

    const businessContext = await getBusinessContext();
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_SUPPORT_MODEL || "gpt-4.1-mini",
        instructions: buildSystemPrompt(businessContext),
        input: messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        max_output_tokens: 450,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || "AI support is unavailable." },
        { status: response.status }
      );
    }

    const text =
      data.output_text ||
      data.output
        ?.flatMap((item: { content?: Array<{ text?: string }> }) => item.content ?? [])
        .map((content: { text?: string }) => content.text)
        .filter(Boolean)
        .join("\n")
        ?.trim();

    return NextResponse.json({
      reply:
        text ||
        "I can help with Flowbridge services, orders, and next steps. What would you like to do?",
    });
  } catch (error) {
    console.error("AI support error:", error);
    return NextResponse.json(
      { error: "AI support is unavailable right now." },
      { status: 500 }
    );
  }
}
