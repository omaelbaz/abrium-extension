/**
 * Locale-aware formatting. Every date, byte size and count in the UI comes
 * from here — no component may build one by hand (CLAUDE.md, i18n section).
 *
 * Formatters are memoised per locale: Intl constructors are expensive and the
 * gallery re-renders on every keystroke of the search field.
 */

import { activeLocale } from './i18n.ts';

const dateCache = new Map<string, Intl.DateTimeFormat>();
const numberCache = new Map<string, Intl.NumberFormat>();

function dateFormatter(locale: string): Intl.DateTimeFormat {
  const hit = dateCache.get(locale);
  if (hit) return hit;
  const created = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  dateCache.set(locale, created);
  return created;
}

function numberFormatter(locale: string, key: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const cacheKey = `${locale}:${key}`;
  const hit = numberCache.get(cacheKey);
  if (hit) return hit;
  const created = new Intl.NumberFormat(locale, options);
  numberCache.set(cacheKey, created);
  return created;
}

/** "29 Jul 2026" / "٢٩ يوليو ٢٠٢٦" — never a hand-built string. */
export function formatDate(epochMs: number, locale: string = activeLocale()): string {
  if (!Number.isFinite(epochMs)) return '';
  return dateFormatter(locale).format(new Date(epochMs));
}

/** Plain integer with locale digits and grouping. */
export function formatCount(value: number, locale: string = activeLocale()): string {
  return numberFormatter(locale, 'count', { maximumFractionDigits: 0 }).format(value);
}

const UNIT_STEPS = [
  { limit: 1024, unit: 'byte', divisor: 1 },
  { limit: 1024 * 1024, unit: 'kilobyte', divisor: 1024 },
  { limit: Number.POSITIVE_INFINITY, unit: 'megabyte', divisor: 1024 * 1024 },
] as const;

/**
 * "2.1 MB" / "٢٫١ م.ب" — Intl unit formatting, so the unit label and the digit
 * system both follow the active locale.
 */
export function formatBytes(bytes: number, locale: string = activeLocale()): string {
  const safe = Number.isFinite(bytes) && bytes > 0 ? bytes : 0;
  const step = UNIT_STEPS.find((candidate) => safe < candidate.limit) ?? UNIT_STEPS[2];
  const value = safe / step.divisor;
  const options: Intl.NumberFormatOptions = {
    style: 'unit',
    unit: step.unit,
    unitDisplay: 'short',
    maximumFractionDigits: step.unit === 'byte' ? 0 : 1,
  };
  try {
    return numberFormatter(locale, `bytes:${step.unit}`, options).format(value);
  } catch {
    /* `style: 'unit'` is unsupported on very old engines — degrade, don't throw. */
    return `${formatCount(Math.round(value), locale)} ${step.unit}`;
  }
}
