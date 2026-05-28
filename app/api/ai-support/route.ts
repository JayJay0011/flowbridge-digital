import { NextResponse } from "next/server";

type AiSupportMessage = {
  role: "user" | "assistant";
  content: string;
};

const systemPrompt = `
You are Flowbridge Digital's website support assistant.
Flowbridge Digital builds automation systems, CRM pipelines, growth infrastructure, platform dashboards, and operational support systems for businesses.
Answer briefly, practically, and in a helpful sales-support tone.
Do not invent pricing, delivery guarantees, legal terms, or private company details.
If the visitor asks about pricing, timelines, complex scope, account issues, refunds, or an active order, direct them to message the Flowbridge team or book a strategy call.
If the visitor seems ready to buy, recommend browsing services or booking a strategy consultation.
`;

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

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_SUPPORT_MODEL || "gpt-4.1-mini",
        instructions: systemPrompt,
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
