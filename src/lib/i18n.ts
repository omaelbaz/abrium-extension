/**
 * i18n — the ONLY place chrome.i18n is touched.
 *
 * Every user-facing string in the extension resolves through `t()`. Static
 * markup carries `{{message_key}}` placeholders which `hydrate()` replaces, so
 * templates stay free of English and plug straight into /_locales.
 *
 * Plurals: chrome.i18n has no plural support, so a plural message is stored as
 * one key per CLDR category (`artifact_count_one`, `_other`, and for Arabic
 * `_zero/_two/_few/_many` as well). `tPlural()` picks the category with
 * Intl.PluralRules for the active locale and falls back to `_other`.
 */

export type Substitutions = readonly string[];

/** Locales shipping in v1.0. Order is the settings-menu order. */
export const SUPPORTED_LOCALES = ['en', 'ar', 'fr', 'es', 'pt'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const RTL_LOCALES: ReadonlySet<string> = new Set(['ar']);

/** Message tables injected by non-extension contexts (tests, preview build). */
export type MessageTable = Readonly<Record<string, string>>;

let overrideLocale: SupportedLocale | null = null;
let overrideTable: MessageTable | null = null;

function hasChromeI18n(): boolean {
  return (
    typeof chrome !== 'undefined' &&
    typeof chrome.i18n !== 'undefined' &&
    typeof chrome.i18n.getMessage === 'function'
  );
}

/**
 * Install an explicit locale + message table. Used by the settings override
 * (chrome.i18n cannot switch locale at runtime) and by the preview build.
 */
export function useLocale(locale: SupportedLocale, table: MessageTable): void {
  overrideLocale = locale;
  overrideTable = table;
}

/**
 * Drop any manual override and fall back to chrome.i18n auto-detection.
 * This is what the settings "System" language choice selects.
 */
export function clearLocaleOverride(): void {
  overrideLocale = null;
  overrideTable = null;
}

export function activeLocale(): string {
  if (overrideLocale) return overrideLocale;
  if (hasChromeI18n()) return chrome.i18n.getUILanguage();
  return typeof navigator !== 'undefined' ? navigator.language : 'en';
}

export function activeDir(): 'ltr' | 'rtl' {
  const base = activeLocale().split('-')[0]!.toLowerCase();
  return RTL_LOCALES.has(base) ? 'rtl' : 'ltr';
}

/** Nearest supported locale for a BCP-47 tag, defaulting to English. */
export function resolveLocale(tag: string): SupportedLocale {
  const base = tag.split('-')[0]!.toLowerCase();
  const hit = SUPPORTED_LOCALES.find((l) => l === base);
  return hit ?? 'en';
}

/** Replace `$1`, `$2`, … the way chrome.i18n does, for the fallback path. */
function applySubs(message: string, subs: Substitutions): string {
  if (subs.length === 0) return message;
  return message.replace(/\$(\d+)/g, (whole, index: string) => {
    const value = subs[Number(index) - 1];
    return value === undefined ? whole : value;
  });
}

/**
 * Look up a message. Returns the key itself if it is missing, which makes an
 * untranslated string loudly visible in review instead of silently English.
 */
export function t(key: string, subs: Substitutions = []): string {
  if (overrideTable) {
    const raw = overrideTable[key];
    return raw === undefined ? key : applySubs(raw, subs);
  }
  if (hasChromeI18n()) {
    const message = chrome.i18n.getMessage(key, subs as string[]);
    return message === '' ? key : message;
  }
  return key;
}

/**
 * Plural-aware lookup. `base` is the key stem: tPlural('artifact_count', 14)
 * resolves `artifact_count_other` in English and `artifact_count_many` in
 * Arabic. The count is passed as $1, already locale-formatted by the caller.
 */
export function tPlural(base: string, count: number, formatted: string): string {
  let category: Intl.LDMLPluralRule = 'other';
  try {
    category = new Intl.PluralRules(activeLocale()).select(count);
  } catch {
    /* Unknown locale tag — 'other' is the safe universal bucket. */
  }
  const specific = t(`${base}_${category}`, [formatted]);
  if (specific !== `${base}_${category}`) return specific;
  return t(`${base}_other`, [formatted]);
}

/** Attributes hydrate() will scan for `{{key}}` in addition to text nodes. */
const I18N_ATTRIBUTES = [
  'aria-label',
  'aria-description',
  'placeholder',
  'title',
  'alt',
  'value',
] as const;

const PLACEHOLDER = /\{\{([a-z0-9_]+)\}\}/gi;

/**
 * Replace every `{{message_key}}` in a subtree's text and translatable
 * attributes. Safe to call repeatedly; already-resolved text has no braces
 * left to match.
 */
export function hydrate(root: ParentNode & Node): void {
  const doc = root.ownerDocument ?? (root as unknown as Document);
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const pending: Text[] = [];
  let node = walker.nextNode();
  while (node) {
    if (PLACEHOLDER.test(node.nodeValue ?? '')) pending.push(node as Text);
    PLACEHOLDER.lastIndex = 0;
    node = walker.nextNode();
  }
  for (const textNode of pending) {
    textNode.nodeValue = (textNode.nodeValue ?? '').replace(
      PLACEHOLDER,
      (_whole, key: string) => t(key),
    );
  }

  const scope = root instanceof Element ? [root] : [];
  const elements = [...scope, ...root.querySelectorAll('*')];
  for (const element of elements) {
    for (const attribute of I18N_ATTRIBUTES) {
      const value = element.getAttribute(attribute);
      if (value === null || !value.includes('{{')) continue;
      element.setAttribute(
        attribute,
        value.replace(PLACEHOLDER, (_whole, key: string) => t(key)),
      );
    }
  }
}

/** Stamp lang + dir on the document root so RTL and fonts resolve correctly. */
export function applyDocumentLocale(doc: Document = document): void {
  const locale = activeLocale();
  doc.documentElement.setAttribute('lang', locale);
  doc.documentElement.setAttribute('dir', activeDir());
}
