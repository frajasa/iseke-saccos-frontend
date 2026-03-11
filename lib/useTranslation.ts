"use client";

import { useState, useEffect, useCallback } from "react";
import en from "@/messages/en.json";
import sw from "@/messages/sw.json";

const messages: Record<string, Record<string, Record<string, string>>> = { en, sw };

type MessageKey = string;

export function useTranslation() {
  const [locale, setLocale] = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem("locale") || "en";
    setLocale(saved);
  }, []);

  const t = useCallback(
    (key: MessageKey): string => {
      const parts = key.split(".");
      if (parts.length !== 2) return key;

      const [namespace, messageKey] = parts;
      const localeMessages = messages[locale] || messages.en;
      const nsMessages = localeMessages[namespace];

      if (!nsMessages) return key;
      return nsMessages[messageKey] || key;
    },
    [locale]
  );

  const switchLocale = useCallback((newLocale: string) => {
    localStorage.setItem("locale", newLocale);
    setLocale(newLocale);
  }, []);

  return { t, locale, switchLocale };
}
