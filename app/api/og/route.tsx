import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export function GET(request: NextRequest) {
  const title =
    request.nextUrl.searchParams.get("title")?.slice(0, 100) ||
    "Flowbridge Digital";
  const subtitle =
    request.nextUrl.searchParams.get("subtitle")?.slice(0, 180) ||
    "Automation, CRM, and operational systems built for clarity and growth.";

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background: "linear-gradient(135deg, #020617 0%, #0f172a 62%, #164e63 100%)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
          padding: "72px 84px",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, fontWeight: 700 }}>
          Flowbridge Digital
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 980 }}>
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 700,
              letterSpacing: "-2px",
              lineHeight: 1.08,
            }}
          >
            {title}
          </div>
          <div
            style={{
              color: "#cbd5e1",
              display: "flex",
              fontSize: 28,
              lineHeight: 1.35,
              marginTop: 28,
            }}
          >
            {subtitle}
          </div>
        </div>
        <div style={{ color: "#67e8f9", display: "flex", fontSize: 22 }}>
          flowbridgedigital.org
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
