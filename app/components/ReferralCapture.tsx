"use client";

import { useEffect } from "react";

export default function ReferralCapture() {
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("ref")?.trim().toUpperCase();
    if (code && /^[A-F0-9]{10}$/.test(code)) {
      window.localStorage.setItem("flowbridge-referral-code", code);
    }
  }, []);
  return null;
}
