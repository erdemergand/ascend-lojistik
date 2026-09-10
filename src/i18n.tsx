import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { defaultLocale, getContent, type Content, type Locale } from "./content";

type I18nValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  c: Content;
  available: Locale[];
};

const fallbackValue: I18nValue = {
  locale: defaultLocale,
  setLocale: () => undefined,
  c: getContent(defaultLocale),
  available: ["tr"],
};

const I18nContext = createContext<I18nValue>(fallbackValue);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  const value = useMemo<I18nValue>(
    () => ({ locale, setLocale, c: getContent(locale), available: ["tr"] }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  return useContext(I18nContext);
}
