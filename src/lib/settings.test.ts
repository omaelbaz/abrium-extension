import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { t, clearLocaleOverride } from './i18n.ts';
import {
  DEFAULT_SETTINGS,
  applyLocale,
  applySettings,
  applyTheme,
  loadAndApplySettings,
  readSettings,
  writeSettings,
} from './settings.ts';

/**
 * Minimal in-memory chrome.storage.local, shaped like the real API surface
 * lib/storage.ts actually calls (get/set/getBytesInUse). Mirrors the shim
 * tools/extract-test.html uses for the same purpose, kept local to this file
 * since settings.test.ts is (so far) the only unit test that needs it.
 */
function installChromeStorageMock(): Map<string, unknown> {
  const vault = new Map<string, unknown>();
  const mock = {
    storage: {
      local: {
        get: async (query?: string | string[] | null) => {
          if (query === null || query === undefined) return Object.fromEntries(vault);
          const keys = Array.isArray(query) ? query : [query];
          return Object.fromEntries(keys.filter((key) => vault.has(key)).map((key) => [key, vault.get(key)]));
        },
        set: async (items: Record<string, unknown>) => {
          for (const [key, value] of Object.entries(items)) vault.set(key, value);
        },
        remove: async (query: string | string[]) => {
          for (const key of Array.isArray(query) ? query : [query]) vault.delete(key);
        },
        getBytesInUse: async () => 0,
      },
      onChanged: { addListener: () => {}, removeListener: () => {} },
    },
  };
  globalThis.chrome = mock as unknown as typeof chrome;
  return vault;
}

let vault: Map<string, unknown>;

beforeEach(() => {
  vault = installChromeStorageMock();
});

afterEach(() => {
  // @ts-expect-error -- test-only teardown; chrome does not exist outside an
  // extension context and other test files rely on that being true.
  delete globalThis.chrome;
  clearLocaleOverride();
});

describe('readSettings / writeSettings', () => {
  it('returns the defaults when nothing has been saved yet', async () => {
    expect(await readSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('round-trips a written settings object', async () => {
    await writeSettings({ locale: 'fr', theme: 'dark' });
    expect(await readSettings()).toEqual({ locale: 'fr', theme: 'dark' });
  });

  it('falls back to the default per-field when the stored record has invalid values', async () => {
    // Simulates a future-version record with an unrecognised value, written
    // directly to bypass writeSettings()'s own validation.
    vault.set('abrium.settings.v1', { locale: 'klingon', theme: 42 });
    expect(await readSettings()).toEqual(DEFAULT_SETTINGS);
  });
});

describe('applyTheme', () => {
  it('stamps data-theme for an explicit choice', () => {
    const doc = document.implementation.createHTMLDocument('test');
    applyTheme('dark', doc);
    expect(doc.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('removes data-theme for "system" so the CSS media-query fallback applies', () => {
    const doc = document.implementation.createHTMLDocument('test');
    doc.documentElement.setAttribute('data-theme', 'light');
    applyTheme('system', doc);
    expect(doc.documentElement.hasAttribute('data-theme')).toBe(false);
  });
});

describe('applyLocale', () => {
  it('installs an override table for an explicit locale', () => {
    const doc = document.implementation.createHTMLDocument('test');
    applyLocale('ar', doc);
    expect(doc.documentElement.getAttribute('lang')).toBe('ar');
    expect(doc.documentElement.getAttribute('dir')).toBe('rtl');
  });

  it('clears the override for "system", falling back to the raw key lookup', () => {
    const doc = document.implementation.createHTMLDocument('test');
    applyLocale('ar', doc);
    applyLocale('system', doc);
    // No override installed and no chrome.i18n in this test env -> t()
    // degrades to returning the key itself, proving the override was cleared.
    expect(t('probe_key')).toBe('probe_key');
  });
});

describe('applySettings', () => {
  it('applies both locale and theme in one call', () => {
    const doc = document.implementation.createHTMLDocument('test');
    applySettings({ locale: 'es', theme: 'light' }, doc);
    expect(doc.documentElement.getAttribute('lang')).toBe('es');
    expect(doc.documentElement.getAttribute('dir')).toBe('ltr');
    expect(doc.documentElement.getAttribute('data-theme')).toBe('light');
  });
});

describe('loadAndApplySettings', () => {
  it('reads, applies, and returns the stored settings', async () => {
    await writeSettings({ locale: 'pt', theme: 'dark' });
    const doc = document.implementation.createHTMLDocument('test');
    const result = await loadAndApplySettings(doc);
    expect(result).toEqual({ locale: 'pt', theme: 'dark' });
    expect(doc.documentElement.getAttribute('lang')).toBe('pt');
    expect(doc.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('falls back to defaults and still renders instead of throwing when storage read fails', async () => {
    globalThis.chrome.storage.local.get = () => Promise.reject(new Error('storage unavailable'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const doc = document.implementation.createHTMLDocument('test');

    const result = await loadAndApplySettings(doc);

    expect(result).toEqual(DEFAULT_SETTINGS);
    expect(doc.documentElement.hasAttribute('data-theme')).toBe(false);
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
