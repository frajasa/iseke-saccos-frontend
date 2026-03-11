"use client";

import { useState, useEffect } from "react";
import { Globe } from "lucide-react";

const locales = [
  { code: "en", name: "English", flag: "EN" },
  { code: "sw", name: "Kiswahili", flag: "SW" },
];

export default function LanguageSwitcher() {
  const [currentLocale, setCurrentLocale] = useState("en");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("locale") || "en";
    setCurrentLocale(saved);
  }, []);

  const switchLocale = (locale: string) => {
    localStorage.setItem("locale", locale);
    setCurrentLocale(locale);
    setIsOpen(false);
    // Reload to apply new locale
    window.location.reload();
  };

  const current = locales.find((l) => l.code === currentLocale);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-border"
      >
        <Globe className="w-3.5 h-3.5" />
        <span>{current?.flag}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-50 min-w-[140px] py-1">
            {locales.map((locale) => (
              <button
                key={locale.code}
                onClick={() => switchLocale(locale.code)}
                className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted transition-colors ${
                  currentLocale === locale.code
                    ? "text-primary font-medium"
                    : "text-foreground"
                }`}
              >
                <span className="text-xs font-bold w-6">{locale.flag}</span>
                <span>{locale.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
