"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { type Locale, translate, locales } from "./dictionaries";

type Ctx = {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<Ctx | null>(null);

const STORAGE_KEY = "estate-locale";
const COOKIE_NAME = "estate-locale";

function detectLocale(): Locale {
  if (typeof window === "undefined") return "th";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && locales.some((l) => l.code === stored)) return stored;
  } catch {
    /* ignore */
  }
  const nav = window.navigator?.language || "";
  if (nav.startsWith("zh")) return "zh";
  if (nav.startsWith("en")) return "en";
  return "th";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("th");

  useEffect(() => {
    const detected = detectLocale();
    setLocaleState(detected);
    document.documentElement.setAttribute("lang", detected);
  }, []);

  const setLocale = useCallback((loc: Locale) => {
    setLocaleState(loc);
    try {
      window.localStorage.setItem(STORAGE_KEY, loc);
      document.cookie = `${COOKIE_NAME}=${loc}; Path=/; Max-Age=${60 * 60 * 24 * 365}`;
      document.documentElement.setAttribute("lang", loc);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new CustomEvent("estate:locale-changed", { detail: { locale: loc } }));
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      locale,
      setLocale,
      t: (key: string, vars?: Record<string, string | number>) =>
        translate(locale, key, vars),
    }),
    [locale, setLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Fail-soft fallback so components don't crash if provider is missing.
    return {
      locale: "th" as Locale,
      setLocale: () => undefined,
      t: (key: string, vars?: Record<string, string | number>) => translate("th", key, vars),
    };
  }
  return ctx;
}
