import { afterEach, describe, expect, it } from 'vitest';

import {
  activeDir,
  activeLocale,
  applyDocumentLocale,
  clearLocaleOverride,
  hydrate,
  resolveLocale,
  t,
  tPlural,
  useLocale,
} from './i18n.ts';
import type { MessageTable } from './i18n.ts';

// These tests run with no `chrome` global at all (jsdom, not an extension
// context), which exercises the same fallback path a preview build or a
// broken/absent chrome.i18n takes — t() must degrade to the key, never throw.
afterEach(() => {
  clearLocaleOverride();
});

describe('t', () => {
  it('resolves a key from the installed override table and applies $1-style substitutions', () => {
    const table: MessageTable = { greeting: 'Hello, $1!' };
    useLocale('en', table);
    expect(t('greeting', ['Omar'])).toBe('Hello, Omar!');
  });

  it('returns the key itself when it is missing, instead of an empty or thrown result', () => {
    useLocale('en', { known: 'Known' });
    expect(t('totally_unknown_key')).toBe('totally_unknown_key');
  });

  it('returns the key itself when there is no override and no chrome.i18n available', () => {
    expect(t('some_key')).toBe('some_key');
  });
});

describe('tPlural', () => {
  it('resolves the CLDR category for the active locale', () => {
    useLocale('en', { artifact_count_one: '$1 artifact', artifact_count_other: '$1 artifacts' });
    expect(tPlural('artifact_count', 1, '1')).toBe('1 artifact');
    expect(tPlural('artifact_count', 5, '5')).toBe('5 artifacts');
  });

  it('falls back to the _other key when the specific category is missing', () => {
    // Arabic has zero/one/two/few/many/other; only _other is supplied here to
    // prove the fallback fires rather than surfacing a raw missing-key string.
    useLocale('ar', { artifact_count_other: '$1 artifacts (ar)' });
    expect(tPlural('artifact_count', 3, '3')).toBe('3 artifacts (ar)');
  });
});

describe('resolveLocale', () => {
  it('maps a BCP-47 tag to its supported base language', () => {
    expect(resolveLocale('fr-CA')).toBe('fr');
    expect(resolveLocale('PT-br')).toBe('pt');
  });

  it('defaults to English for an unsupported language tag', () => {
    expect(resolveLocale('de-DE')).toBe('en');
  });
});

describe('activeLocale / activeDir', () => {
  it('reflects an installed override', () => {
    useLocale('ar', {});
    expect(activeLocale()).toBe('ar');
    expect(activeDir()).toBe('rtl');
  });

  it('defaults to ltr for a non-RTL override locale', () => {
    useLocale('fr', {});
    expect(activeDir()).toBe('ltr');
  });
});

describe('hydrate', () => {
  it('replaces {{key}} placeholders in text nodes and translatable attributes', () => {
    useLocale('en', { title_key: 'Vault', label_key: 'Open the vault' });
    const root = document.createElement('div');
    root.innerHTML = '<button aria-label="{{label_key}}">{{title_key}}</button>';
    hydrate(root);
    const button = root.querySelector('button')!;
    expect(button.textContent).toBe('Vault');
    expect(button.getAttribute('aria-label')).toBe('Open the vault');
  });

  it('leaves a subtree with no placeholders unchanged', () => {
    useLocale('en', { unused_key: 'Unused' });
    const root = document.createElement('div');
    root.innerHTML = '<p>Plain text, no braces here.</p>';
    hydrate(root);
    expect(root.querySelector('p')!.textContent).toBe('Plain text, no braces here.');
  });
});

describe('applyDocumentLocale', () => {
  it('stamps lang and dir on the document root from the active locale', () => {
    useLocale('ar', {});
    const doc = document.implementation.createHTMLDocument('test');
    applyDocumentLocale(doc);
    expect(doc.documentElement.getAttribute('lang')).toBe('ar');
    expect(doc.documentElement.getAttribute('dir')).toBe('rtl');
  });
});
