"use client";

import { useEffect, useState } from "react";

type GoogleTranslateElement = {
  InlineLayout: {
    SIMPLE: number;
  };
  new (
    options: {
      pageLanguage: string;
      autoDisplay: boolean;
      layout: number;
    },
    elementId: string
  ): unknown;
};

type GoogleTranslateWindow = Window & {
  google?: {
    translate?: {
      TranslateElement?: GoogleTranslateElement;
    };
  };
  googleTranslateElementInit?: () => void;
};

const languages = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "pt", label: "Portuguese" },
  { code: "ar", label: "Arabic" },
  { code: "zh-CN", label: "Chinese" },
  { code: "hi", label: "Hindi" },
  { code: "yo", label: "Yoruba" },
  { code: "ha", label: "Hausa" },
  { code: "ig", label: "Igbo" },
  { code: "de", label: "German" },
  { code: "it", label: "Italian" },
  { code: "nl", label: "Dutch" },
  { code: "ru", label: "Russian" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "tr", label: "Turkish" },
  { code: "id", label: "Indonesian" },
  { code: "vi", label: "Vietnamese" },
  { code: "th", label: "Thai" },
  { code: "sw", label: "Swahili" },
  { code: "am", label: "Amharic" },
  { code: "zu", label: "Zulu" },
  { code: "af", label: "Afrikaans" },
  { code: "pl", label: "Polish" },
  { code: "uk", label: "Ukrainian" },
  { code: "bn", label: "Bengali" },
  { code: "ur", label: "Urdu" },
  { code: "fa", label: "Persian" },
];

function getCookie(name: string) {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

function getTranslatedLanguage() {
  const cookie = getCookie("googtrans");
  const parts = cookie.split("/");
  return parts[2] || "en";
}

function writeTranslateCookie(language: string) {
  const maxAge = language === "en" ? 0 : 60 * 60 * 24 * 365;
  const value = language === "en" ? "" : `/en/${language}`;
  const encoded = encodeURIComponent(value);
  const hostname = window.location.hostname.replace(/^www\./, "");

  document.cookie = `googtrans=${encoded};path=/;max-age=${maxAge}`;

  if (hostname.includes(".")) {
    document.cookie = `googtrans=${encoded};domain=.${hostname};path=/;max-age=${maxAge}`;
  }
}

export default function TranslateControl() {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLanguage(getTranslatedLanguage());
    }, 0);

    const translateWindow = window as GoogleTranslateWindow;
    translateWindow.googleTranslateElementInit = () => {
      const target = document.getElementById("google_translate_element");
      if (
        !target ||
        target.childNodes.length > 0 ||
        !translateWindow.google?.translate?.TranslateElement
      ) {
        return;
      }

      const TranslateElement = translateWindow.google.translate.TranslateElement;
      new TranslateElement(
        {
          pageLanguage: "en",
          autoDisplay: false,
          layout: TranslateElement.InlineLayout.SIMPLE,
        },
        "google_translate_element"
      );
    };

    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else {
      translateWindow.googleTranslateElementInit();
    }

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const handleChange = (nextLanguage: string) => {
    setLanguage(nextLanguage);
    writeTranslateCookie(nextLanguage);
    window.location.reload();
  };

  return (
    <div className="notranslate relative flex items-center gap-2">
      <div id="google_translate_element" aria-hidden="true" />
      <label htmlFor="site-language" className="sr-only">
        Translate website
      </label>
      <select
        id="site-language"
        value={language}
        onChange={(event) => handleChange(event.target.value)}
        className="h-10 max-w-[150px] rounded-full border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition hover:bg-slate-50 focus:ring-2 focus:ring-slate-900"
      >
        {languages.map((item) => (
          <option key={item.code} value={item.code}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}
