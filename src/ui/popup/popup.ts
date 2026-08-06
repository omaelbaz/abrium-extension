/**
 * Popup controller.
 *
 * Quick access only: search, the most recent few artifacts, and a route into
 * the side panel. All strings come from i18n, all formatting from /lib/format,
 * all reads from /lib/storage.
 */

import type { Artifact } from '../../types/index.ts';
import { applyDocumentLocale, hydrate, t, tPlural } from '../../lib/i18n.ts';
import { formatBytes, formatCount, formatDate } from '../../lib/format.ts';
import { getArtifactSizes, onArtifactsChanged, readArtifacts } from '../../lib/storage.ts';
import { downloadArtifact } from '../../lib/download.ts';
import { loadAndApplySettings } from '../../lib/settings.ts';
import { createAnnouncer, createClearButtonSync, createRequired, matchesQuery } from '../shared/dom.ts';
import type { PopupModel, RenderContext } from './templates.ts';
import {
  POPUP_LIMIT,
  renderBody,
  renderFooter,
  renderHeader,
  renderListHeading,
} from './templates.ts';

const SEARCH_DEBOUNCE_MS = 120;

const ctx: RenderContext = { t, tPlural, formatDate, formatBytes, formatCount };

/* -------------------------------------------------------------------------
   Model
   ------------------------------------------------------------------------- */

interface State {
  status: PopupModel['status'];
  all: Artifact[];
  sizes: ReadonlyMap<string, number>;
  query: string;
}

const state: State = {
  status: 'loading',
  all: [],
  sizes: new Map(),
  query: '',
};

/**
 * Window the popup belongs to, resolved at boot.
 *
 * chrome.sidePanel.open() must run inside a user gesture, and awaiting the
 * window lookup inside the click handler would spend it. Caching the id up
 * front keeps the handler synchronous.
 */
let currentWindowId: number | undefined;

function buildModel(): PopupModel {
  const needle = state.query.trim().toLowerCase();
  // readArtifacts() already returns newest first, so "last 5" is just a slice.
  const visible = state.all.filter((artifact) => matchesQuery(artifact, needle)).slice(0, POPUP_LIMIT);
  return {
    status: state.status,
    visible,
    totalCount: state.all.length,
    sizes: state.sizes,
    query: state.query,
  };
}

/* -------------------------------------------------------------------------
   DOM handles
   ------------------------------------------------------------------------- */

const required = createRequired('Popup shell');

const dom = {
  header: required<HTMLElement>('#pop-header'),
  heading: required<HTMLElement>('#pop-heading'),
  results: required<HTMLUListElement>('#pop-results'),
  footer: required<HTMLElement>('#pop-footer'),
  live: required<HTMLElement>('#pop-live'),
};

const announce = createAnnouncer(dom.live);

/* -------------------------------------------------------------------------
   Render
   ------------------------------------------------------------------------- */

/** List + heading. Used while typing; never touches the focused search input. */
function renderResults(model: PopupModel = buildModel()): void {
  dom.results.innerHTML = renderBody(model, ctx);
  dom.results.setAttribute('aria-busy', String(model.status === 'loading'));
  dom.heading.innerHTML = renderListHeading(model, ctx);
}

/** Full render, restoring search focus and caret if the field had them. */
function renderAll(): void {
  const model = buildModel();
  const active = document.activeElement;
  const searchWasFocused = active instanceof HTMLInputElement && active.id === 'pop-search';
  const caret = searchWasFocused ? active.selectionStart : null;

  dom.header.innerHTML = renderHeader(model, ctx);
  dom.footer.innerHTML = renderFooter(ctx);
  renderResults(model);

  if (searchWasFocused) {
    const input = document.querySelector<HTMLInputElement>('#pop-search');
    if (input) {
      input.focus();
      if (caret !== null) input.setSelectionRange(caret, caret);
    }
  }
}

/* -------------------------------------------------------------------------
   Data
   ------------------------------------------------------------------------- */

async function load(): Promise<void> {
  state.status = 'loading';
  renderAll();
  try {
    const artifacts = await readArtifacts();
    state.all = artifacts;
    // Only the rows this surface can show need measuring.
    state.sizes = await getArtifactSizes(artifacts.slice(0, POPUP_LIMIT).map((a) => a.id));
    state.status = 'ready';
  } catch (error) {
    state.status = 'error';
    console.error('[abrium] Failed to load artifacts', error);
  }
  renderAll();

  if (state.status === 'ready') {
    const model = buildModel();
    announce(tPlural('artifact_count', model.visible.length, formatCount(model.visible.length)));
  }
}

/**
 * Sizes are fetched for the first page only, so a query that surfaces older
 * artifacts needs their measurements too. Missing ids simply omit the figure
 * until this resolves — never a declared length.
 */
async function ensureSizesFor(artifacts: readonly Artifact[]): Promise<void> {
  const missing = artifacts.filter((a) => !state.sizes.has(a.id)).map((a) => a.id);
  if (missing.length === 0) return;
  try {
    const measured = await getArtifactSizes(missing);
    if (measured.size === 0) return;
    const merged = new Map(state.sizes);
    for (const [id, bytes] of measured) merged.set(id, bytes);
    state.sizes = merged;
    renderResults();
  } catch (error) {
    console.error('[abrium] Could not measure artifact sizes', error);
  }
}

/* -------------------------------------------------------------------------
   Actions
   ------------------------------------------------------------------------- */

function artifactById(id: string): Artifact | undefined {
  return state.all.find((artifact) => artifact.id === id);
}

function cardIdFrom(target: Element): string | null {
  return target.closest<HTMLElement>('[data-id]')?.dataset['id'] ?? null;
}

/** Opens the side panel and closes the popup. Must stay synchronous. */
function openVault(): void {
  if (currentWindowId === undefined) {
    console.error('[abrium] No window id — cannot open the side panel');
    announce(t('status_action_failed'));
    return;
  }
  chrome.sidePanel
    .open({ windowId: currentWindowId })
    .then(() => window.close())
    .catch((error: unknown) => {
      console.error('[abrium] Could not open the side panel', error);
      announce(t('status_action_failed'));
    });
}

function onClick(event: MouseEvent): void {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const trigger = target.closest<HTMLElement>('[data-action]');
  if (!trigger) return;

  switch (trigger.dataset['action']) {
    case 'open-vault': {
      openVault();
      return;
    }
    case 'clear-search': {
      state.query = '';
      renderAll();
      document.querySelector<HTMLInputElement>('#pop-search')?.focus();
      return;
    }
    case 'retry': {
      void load();
      return;
    }
    case 'download': {
      const id = cardIdFrom(trigger);
      const artifact = id ? artifactById(id) : undefined;
      if (!artifact) return;
      try {
        downloadArtifact(artifact);
        announce(t('status_download_started'));
      } catch (error) {
        console.error('[abrium] Download failed', error);
        announce(t('status_action_failed'));
      }
      return;
    }
    case 'open': {
      const id = cardIdFrom(trigger);
      // Artifact Detail is a later prompt. The popup dispatches the same intent
      // the gallery does, so one router will serve both surfaces.
      if (id) document.dispatchEvent(new CustomEvent('abrium:open-artifact', { detail: { id } }));
      return;
    }
    default:
      return;
  }
}

let searchTimer = 0;

function onSearchInput(event: Event): void {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || input.id !== 'pop-search') return;
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => {
    state.query = input.value;
    renderResults();
    syncClearButton();
    const model = buildModel();
    announce(tPlural('artifact_count', model.visible.length, formatCount(model.visible.length)));
    void ensureSizesFor(model.visible);
  }, SEARCH_DEBOUNCE_MS);
}

const syncClearButton = createClearButtonSync(() => state.query.length > 0);

function onKeyDown(event: KeyboardEvent): void {
  // Escape clears a query before Chrome closes the popup on the second press.
  if (event.key === 'Escape' && state.query !== '') {
    event.preventDefault();
    state.query = '';
    renderAll();
    document.querySelector<HTMLInputElement>('#pop-search')?.focus();
  }
}

/* -------------------------------------------------------------------------
   Boot
   ------------------------------------------------------------------------- */

async function resolveWindowId(): Promise<void> {
  try {
    currentWindowId = (await chrome.windows.getCurrent()).id;
  } catch (error) {
    console.error('[abrium] Could not resolve the current window', error);
  }
}

function boot(): void {
  applyDocumentLocale();
  hydrate(document);

  document.addEventListener('click', onClick);
  document.addEventListener('input', onSearchInput);
  document.addEventListener('keydown', onKeyDown);

  onArtifactsChanged(() => {
    void load();
  });

  void resolveWindowId();
  // The language/theme chosen in Settings applies to every surface, so it must
  // land before the first paint here too.
  void loadAndApplySettings().then(() => load());

  // Search-first surface: the field is the first thing a keyboard user wants.
  window.setTimeout(() => document.querySelector<HTMLInputElement>('#pop-search')?.focus(), 0);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
