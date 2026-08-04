/**
 * Bundled message tables for the manual language override.
 *
 * chrome.i18n cannot switch locale at runtime — it resolves once, from the
 * browser UI language. So an in-app language picker needs the message table
 * itself, and these are imported statically rather than fetched: a fetch would
 * be a (local) network call this codebase does not permit anywhere, and the
 * bundler can prove a static import correct at build time.
 *
 * /_locales still ships as the source of truth for the manifest's __MSG_ keys
 * and for the default, auto-detected path. These are the same files.
 */

import type { MessageTable, SupportedLocale } from './i18n.ts';

import ar from '../../_locales/ar/messages.json' with { type: 'json' };
import en from '../../_locales/en/messages.json' with { type: 'json' };
import es from '../../_locales/es/messages.json' with { type: 'json' };
import fr from '../../_locales/fr/messages.json' with { type: 'json' };
import pt from '../../_locales/pt/messages.json' with { type: 'json' };

/** chrome.i18n's on-disk shape: { key: { message, description? } }. */
type RawTable = Record<string, { message: string }>;

function flatten(raw: RawTable): MessageTable {
  return Object.fromEntries(Object.entries(raw).map(([key, entry]) => [key, entry.message]));
}

export const LOCALE_TABLES: Readonly<Record<SupportedLocale, MessageTable>> = {
  en: flatten(en as RawTable),
  ar: flatten(ar as RawTable),
  fr: flatten(fr as RawTable),
  es: flatten(es as RawTable),
  pt: flatten(pt as RawTable),
};

/** Endonyms — a language picker always lists languages in their own language. */
export const LOCALE_ENDONYMS: Readonly<Record<SupportedLocale, string>> = {
  en: 'English',
  ar: 'العربية',
  fr: 'Français',
  es: 'Español',
  pt: 'Português',
};
