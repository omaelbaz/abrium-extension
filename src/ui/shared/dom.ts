/**
 * Small DOM-interaction helpers shared by every surface — a required()
 * shell-lookup, an aria-live announcer, the search-field clear-button
 * toggle, and the artifact search predicate.
 *
 * Popup and side panel each had byte-identical copies of these until
 * Prompt 29's audit flagged it (CLAUDE.md — "no remixing"). The lookup/
 * announcer/clear-button helpers are exposed as small factories rather than
 * bare functions because their original bodies closed over each surface's
 * own module-local `dom`/`state` objects, which don't exist here — each
 * surface binds one once at boot (`const required = createRequired(...)`)
 * and every call site downstream is unchanged.
 */

import type { Artifact } from '../../types/index.ts';
import { t } from '../../lib/i18n.ts';
import { icon } from '../icons.ts';

/** Bind a typed, required querySelector to a shell name used in its error message. */
export function createRequired(context: string) {
  return function required<T extends Element>(selector: string): T {
    const element = document.querySelector<T>(selector);
    if (!element) throw new Error(`${context} is missing ${selector}`);
    return element;
  };
}

/** Bind an aria-live announcer to a specific live region element. */
export function createAnnouncer(liveRegion: HTMLElement) {
  return function announce(message: string): void {
    // Reassigning identical text does not re-announce; clear first.
    liveRegion.textContent = '';
    window.setTimeout(() => {
      liveRegion.textContent = message;
    }, 50);
  };
}

/** Add or remove the clear button without re-rendering the focused input. */
export function createClearButtonSync(hasQuery: () => boolean) {
  return function syncClearButton(): void {
    const field = document.querySelector<HTMLElement>('.abr-field--search');
    if (!field) return;
    const existing = field.querySelector<HTMLElement>('[data-action="clear-search"]');
    const needed = hasQuery();
    if (needed && !existing) {
      const button = document.createElement('button');
      button.className = 'abr-icon-btn abr-icon-btn--sm abr-field__clear';
      button.type = 'button';
      button.dataset['action'] = 'clear-search';
      button.setAttribute('aria-label', t('search_clear'));
      button.innerHTML = icon('close');
      field.append(button);
    } else if (!needed && existing) {
      existing.remove();
    }
  };
}

export function matchesQuery(artifact: Artifact, needle: string): boolean {
  if (needle === '') return true;
  return (
    artifact.title.toLowerCase().includes(needle) ||
    artifact.filename.toLowerCase().includes(needle) ||
    (artifact.language ?? '').toLowerCase().includes(needle)
  );
}
