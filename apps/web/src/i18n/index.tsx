import { LOCALES, translate, type Locale, type ShortcutPlugin } from '@keydojo/core';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { store } from '../storage';
import { en, type UIMessages } from './en';
import { zh } from './zh';

const UI: Record<Locale, UIMessages> = { en, zh };

const isLocale = (v: string | null | undefined): v is Locale => LOCALES.includes(v as Locale);

/** `?lang=zh` in the URL wins (handy for sharing), then the saved choice, then the browser. */
export function initialLocale(): Locale {
  const fromUrl = new URLSearchParams(location.search).get('lang');
  if (isLocale(fromUrl)) {
    store.setLocale(fromUrl);
    return fromUrl;
  }
  const saved = store.locale();
  if (isLocale(saved)) return saved;
  return navigator.languages.some((l) => l.toLowerCase().startsWith('zh')) ? 'zh' : 'en';
}

interface I18n {
  locale: Locale;
  setLocale(l: Locale): void;
  /** UI text. */
  m: UIMessages;
  /** Translate a plugin's own text. */
  p(plugin: ShortcutPlugin, text: string): string;
}

const Ctx = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState(initialLocale);
  useEffect(() => {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
  }, [locale]);
  const setLocale = (l: Locale) => {
    store.setLocale(l);
    setLocaleState(l);
  };
  const value: I18n = { locale, setLocale, m: UI[locale], p: (plugin, text) => translate(plugin, locale, text) };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18n {
  const v = useContext(Ctx);
  if (!v) throw new Error('useI18n outside I18nProvider');
  return v;
}

export const LOCALE_NAMES: Record<Locale, string> = { en: en.languageName, zh: zh.languageName };
