import { NextResponse } from "next/server";

type StrategyCallRequest = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  businessModel?: string;
  pains?: string;
  goals?: string;
  timeline?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as StrategyCallRequest;
    const requiredFields = [
      body.firstName,
      body.lastName,
      body.email,
      body.businessModel,
      body.pains,
      body.goals,
      body.timeline,
    ];

    if (requiredFields.some((field) => !field?.trim())) {
      return NextResponse.json(
        { error: "Please complete all required fields." },
        { status: 400 }
      );
    }

    const webhookUrl = process.env.ZAPIER_STRATEGY_CALL_WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json(
        { error: "Consultation submission is not configured yet." },
        { status: 500 }
      );
    }

    const zapierResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...body,
        source: "flowbridgedigital.org strategy consultation",
        submittedAt: new Date().toISOString(),
      }),
      cache: "no-store",
    });

    if (!zapierResponse.ok) {
      return NextResponse.json(
        { error: "Unable to submit your consultation request right now." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Strategy call submission error:", error);
    return NextResponse.json(
      { error: "Unable to submit your consultation request right now." },
      { status: 500 }
    );
  }
}
