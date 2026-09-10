import { tr } from "./tr";

export type Locale = "tr" | "en";
export type Content = typeof tr;

// English translations can be added here later: { tr, en }
export const dictionaries: Partial<Record<Locale, Content>> & { tr: Content } = { tr };

export const defaultLocale: Locale = "tr";

export function getContent(locale: Locale): Content {
  return dictionaries[locale] ?? dictionaries.tr;
}
