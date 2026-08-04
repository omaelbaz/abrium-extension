/**
 * User settings: language override and theme preference.
 *
 * Persistence goes through lib/storage.ts like everything else; this module
 * owns the schema, the defaults, the validation, and applying a setting to a
 * live document. Every surface calls applySettings() on boot, so the popup and
 * the side panel always agree.
 */

import type { SupportedLocale } from './i18n.ts';
import { SUPPORTED_LOCALES, applyDocumentLocale, clearLocaleOverride, useLocale } from './i18n.ts';
import { LOCALE_TABLES } from './locales.ts';
import { readSettingsRecord, writeSettingsRecord } from './storage.ts';

/** 'system' defers to chrome.i18n.getUILanguage() / prefers-color-scheme. */
export type LocalePreference = SupportedLocale | 'system';
export type ThemePreference = 'light' | 'dark' | 'system';

export interface Settings {
  locale: LocalePreference;
  theme: ThemePreference;
}

export const DEFAULT_SETTINGS: Settings = { locale: 'system', theme: 'system' };

export const LOCALE_CHOICES: readonly LocalePreference[] = ['system', ...SUPPORTED_LOCALES];
export const THEME_CHOICES: readonly ThemePreference[] = ['system', 'light', 'dark'];

function isLocalePreference(value: unknown): value is LocalePreference {
  return typeof value === 'string' && (LOCALE_CHOICES as readonly string[]).includes(value);
}

function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === 'string' && (THEME_CHOICES as readonly string[]).includes(value);
}

/**
 * Read settings, falling back to defaults per-field.
 *
 * A record written by a future version with an unknown value must not brick the
 * UI, so each field is validated independently rather than the whole object
 * being accepted or rejected.
 */
export async function readSettings(): Promise<Settings> {
  const record = await readSettingsRecord();
  if (!record) return { ...DEFAULT_SETTINGS };
  return {
    locale: isLocalePreference(record['locale']) ? record['locale'] : DEFAULT_SETTINGS.locale,
    theme: isThemePreference(record['theme']) ? record['theme'] : DEFAULT_SETTINGS.theme,
  };
}

export async function writeSettings(settings: Settings): Promise<void> {
  await writeSettingsRecord({ locale: settings.locale, theme: settings.theme });
}

/**
 * Stamp the theme on <html>.
 *
 * tokens.css keys off `[data-theme]`, and `:root:not([data-theme])` falls back
 * to prefers-color-scheme — so "system" is expressed by REMOVING the attribute,
 * not by resolving the media query here.
 */
export function applyTheme(theme: ThemePreference, doc: Document = document): void {
  if (theme === 'system') doc.documentElement.removeAttribute('data-theme');
  else doc.documentElement.setAttribute('data-theme', theme);
}

/**
 * Install the language override (or clear it) and re-stamp lang/dir.
 *
 * Callers re-render afterwards; nothing here touches the DOM beyond the root
 * attributes, so a caller can apply and repaint in one frame.
 */
export function applyLocale(locale: LocalePreference, doc: Document = document): void {
  if (locale === 'system') clearLocaleOverride();
  else useLocale(locale, LOCALE_TABLES[locale]);
  applyDocumentLocale(doc);
}

/** Apply both. Every surface calls this before its first paint. */
export function applySettings(settings: Settings, doc: Document = document): void {
  applyLocale(settings.locale, doc);
  applyTheme(settings.theme, doc);
}

/**
 * Read and apply in one step, tolerating a storage failure.
 *
 * A settings read that fails must not stop a surface from rendering — the
 * defaults are a perfectly usable state.
 */
export async function loadAndApplySettings(doc: Document = document): Promise<Settings> {
  let settings = { ...DEFAULT_SETTINGS };
  try {
    settings = await readSettings();
  } catch (error) {
    console.error('[abrium] Could not load settings — using defaults', error);
  }
  applySettings(settings, doc);
  return settings;
}
