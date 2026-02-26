import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      firstName,
      lastName,
      email,
      phone,
      businessModel,
      pains,
      goals,
      timeline,
    } = body;

    // 🔐 Make sure your env variable exists
    const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

    if (!HUBSPOT_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: "Missing HubSpot access token" },
        { status: 500 }
      );
    }

    // 🚀 Send to HubSpot
    const hubspotRes = await fetch(
      "https://api.hubapi.com/crm/v3/objects/contacts",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          properties: {
            firstname: firstName,
            lastname: lastName,
            email: email,
            phone: phone,
            business_model: businessModel || "",
            operational_pains: pains || "",
            desired_results: goals || "",
            implementation_timeline: timeline || "",
          },
        }),
      }
    );

    const data = await hubspotRes.json();

    if (!hubspotRes.ok) {
      console.error("HubSpot error:", data);
      return NextResponse.json(
        { error: "HubSpot API failed", details: data },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, contact: data },
      { status: 200 }
    );
  } catch (error) {
    console.log("ENV TOKEN:", process.env.HUBSPOT_ACCESS_TOKEN);
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
