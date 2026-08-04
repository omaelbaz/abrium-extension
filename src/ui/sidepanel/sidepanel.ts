/**
 * Side Panel Gallery controller.
 *
 * Owns the model, wires events, and asks templates.ts for markup. All strings
 * come from i18n, all formatting from /lib/format, all reads from /lib/storage.
 */

import type { Artifact, FilterValue, GalleryModel } from '../../types/index.ts';
import { ARTIFACT_TYPES } from '../../types/index.ts';
import { applyDocumentLocale, hydrate, t, tPlural } from '../../lib/i18n.ts';
import { formatBytes, formatCount, formatDate } from '../../lib/format.ts';
import {
  deleteArtifact,
  getArtifactBytes,
  getArtifactSizes,
  getUsedBytes,
  onArtifactsChanged,
  readArtifact,
  readArtifacts,
  setPinned,
} from '../../lib/storage.ts';
import {
  downloadArtifact,
  downloadArtifactsAsZip,
  exportArtifactsJson,
} from '../../lib/download.ts';
import { icon } from '../icons.ts';
import type { RenderContext } from './templates.ts';
import { listAttributes, renderActionBar, renderBody, renderHeader } from './templates.ts';
import type { DetailModel } from './detail.ts';
import { renderDetail } from './detail.ts';
import type { SettingsModel } from './settings.ts';
import { renderSettings } from './settings.ts';
import type { LocalePreference, Settings, ThemePreference } from '../../lib/settings.ts';
import {
  DEFAULT_SETTINGS,
  applyLocale,
  applyTheme,
  loadAndApplySettings,
  readSettings,
  writeSettings,
} from '../../lib/settings.ts';

const SEARCH_DEBOUNCE_MS = 120;
const LONG_PRESS_MS = 500;

const ctx: RenderContext = {
  t,
  tPlural,
  formatDate,
  formatBytes,
  formatCount,
};

/* -------------------------------------------------------------------------
   Model
   ------------------------------------------------------------------------- */

/** The panel hosts two views; the gallery keeps its state while detail is up. */
interface DetailState {
  status: DetailModel['status'];
  id: string | null;
  artifact: Artifact | null;
  sizeBytes: number | null;
  confirmingDelete: boolean;
}

interface SettingsState {
  status: SettingsModel['status'];
  settings: Settings;
}

interface State {
  view: 'gallery' | 'detail' | 'settings';
  detail: DetailState;
  settingsView: SettingsState;
  status: GalleryModel['status'];
  all: Artifact[];
  /** Real disk usage from getBytesInUse(); null when it could not be measured. */
  usedBytes: number | null;
  /** Real per-artifact disk usage from getBytesInUse(), keyed by artifact id. */
  sizes: ReadonlyMap<string, number>;
  filter: FilterValue;
  query: string;
  batchMode: boolean;
  selected: Set<string>;
  previewHintActive: boolean;
  previewHintDismissed: boolean;
}

const state: State = {
  view: 'gallery',
  detail: {
    status: 'loading',
    id: null,
    artifact: null,
    sizeBytes: null,
    confirmingDelete: false,
  },
  settingsView: { status: 'loading', settings: { ...DEFAULT_SETTINGS } },
  status: 'loading',
  all: [],
  usedBytes: 0,
  sizes: new Map(),
  filter: 'all',
  query: '',
  batchMode: false,
  selected: new Set(),
  previewHintActive: false,
  previewHintDismissed: false,
};

function matchesQuery(artifact: Artifact, needle: string): boolean {
  if (needle === '') return true;
  return (
    artifact.title.toLowerCase().includes(needle) ||
    artifact.filename.toLowerCase().includes(needle) ||
    (artifact.language ?? '').toLowerCase().includes(needle)
  );
}

function buildModel(): GalleryModel {
  const needle = state.query.trim().toLowerCase();
  const visible = state.all.filter(
    (artifact) =>
      (state.filter === 'all' || artifact.type === state.filter) && matchesQuery(artifact, needle),
  );

  const counts = { all: state.all.length } as Record<FilterValue, number>;
  for (const type of ARTIFACT_TYPES) {
    counts[type] = state.all.filter((artifact) => artifact.type === type).length;
  }

  return {
    status: state.status,
    visible,
    totalCount: state.all.length,
    totalBytes: state.usedBytes,
    sizes: state.sizes,
    counts,
    activeFilter: state.filter,
    query: state.query,
    batchMode: state.batchMode,
    selected: state.selected,
    showPreviewHint: state.previewHintActive && !state.previewHintDismissed,
  };
}

/* -------------------------------------------------------------------------
   DOM handles
   ------------------------------------------------------------------------- */

function required<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Side panel shell is missing ${selector}`);
  return element;
}

const dom = {
  gallery: required<HTMLElement>('#sp-gallery'),
  detailRoot: required<HTMLElement>('#sp-detail-root'),
  settingsRoot: required<HTMLElement>('#sp-settings-root'),
  header: required<HTMLElement>('#sp-header'),
  results: required<HTMLUListElement>('#sp-results'),
  actionbar: required<HTMLElement>('#sp-actionbar'),
  live: required<HTMLElement>('#sp-live'),
};

function announce(message: string): void {
  // Reassigning identical text does not re-announce; clear first.
  dom.live.textContent = '';
  window.setTimeout(() => {
    dom.live.textContent = message;
  }, 50);
}

/* -------------------------------------------------------------------------
   Render
   ------------------------------------------------------------------------- */

/** Body + action bar. Used on every model change; never touches the header. */
function renderResults(model: GalleryModel = buildModel()): void {
  dom.results.innerHTML = renderBody(model, ctx);
  dom.results.setAttribute('aria-busy', String(model.status === 'loading'));
  for (const attribute of ['role', 'aria-multiselectable', 'aria-label']) {
    dom.results.removeAttribute(attribute);
  }
  // listAttributes returns a serialised attribute list; apply it in one pass.
  const holder = document.createElement('div');
  holder.innerHTML = `<i ${listAttributes(model, ctx)}></i>`;
  const source = holder.firstElementChild;
  if (source) {
    for (const attribute of Array.from(source.attributes)) {
      dom.results.setAttribute(attribute.name, attribute.value);
    }
  }

  dom.actionbar.innerHTML = renderActionBar(model, ctx);
}

/**
 * Full render. Replaces the header too, so it restores search focus and caret
 * position — otherwise entering batch mode would steal focus mid-typing.
 */
function renderAll(): void {
  const model = buildModel();
  const active = document.activeElement;
  const searchWasFocused = active instanceof HTMLInputElement && active.id === 'sp-search';
  const caret = searchWasFocused ? (active as HTMLInputElement).selectionStart : null;

  dom.header.innerHTML = renderHeader(model, ctx);
  renderResults(model);

  if (searchWasFocused) {
    const input = document.querySelector<HTMLInputElement>('#sp-search');
    if (input) {
      input.focus();
      if (caret !== null) input.setSelectionRange(caret, caret);
    }
  }
}

/* -------------------------------------------------------------------------
   Artifact Detail — a view inside this panel, not a separate page
   ------------------------------------------------------------------------- */

function buildDetailModel(): DetailModel {
  return {
    status: state.detail.status,
    artifact: state.detail.artifact,
    sizeBytes: state.detail.sizeBytes,
    confirmingDelete: state.detail.confirmingDelete,
  };
}

function renderDetailView(): void {
  dom.detailRoot.innerHTML = renderDetail(buildDetailModel(), ctx);
}

/** Exactly one view is visible. Nothing else touches `hidden`. */
function applyView(): void {
  dom.gallery.hidden = state.view !== 'gallery';
  dom.detailRoot.hidden = state.view !== 'detail';
  dom.settingsRoot.hidden = state.view !== 'settings';
}

/** Card that opened the detail view, so Back can return focus to it. */
let returnFocusId: string | null = null;

async function loadDetail(id: string): Promise<void> {
  state.detail.id = id;
  state.detail.status = 'loading';
  state.detail.artifact = null;
  state.detail.sizeBytes = null;
  state.detail.confirmingDelete = false;
  renderDetailView();

  try {
    const artifact = await readArtifact(id);
    if (!artifact) {
      // Evicted for quota, or deleted from another surface, between the
      // gallery listing it and this read. Expected, not an error.
      state.detail.status = 'missing';
    } else {
      state.detail.artifact = artifact;
      state.detail.sizeBytes = await getArtifactBytes(id);
      state.detail.status = 'ready';
    }
  } catch (error) {
    state.detail.status = 'error';
    console.error('[abrium] Failed to load artifact %s', id, error);
  }

  // A late read must not overwrite a view the user has already left.
  if (state.detail.id !== id) return;
  renderDetailView();
  focusDetailStart();
}

function focusDetailStart(): void {
  dom.detailRoot.querySelector<HTMLButtonElement>('[data-action="back"]')?.focus();
}

function openDetail(id: string): void {
  returnFocusId = id;
  state.view = 'detail';
  applyView();
  void loadDetail(id);
}

function closeDetail(): void {
  state.view = 'gallery';
  state.detail.id = null;
  state.detail.artifact = null;
  state.detail.confirmingDelete = false;
  applyView();
  dom.detailRoot.innerHTML = '';

  // Return focus to the card that was opened, falling back to the search field
  // if it is gone (deleted, or filtered out by a query change).
  const card = returnFocusId
    ? dom.results.querySelector<HTMLElement>(`[data-id="${CSS.escape(returnFocusId)}"]`)
    : null;
  const target =
    card?.querySelector<HTMLButtonElement>('[data-action="open"]') ??
    document.querySelector<HTMLInputElement>('#sp-search');
  target?.focus();
  returnFocusId = null;
}

async function toggleDetailPin(): Promise<void> {
  const artifact = state.detail.artifact;
  if (!artifact) return;
  try {
    const updated = await setPinned(artifact.id, !artifact.pinned);
    if (!updated) {
      state.detail.status = 'missing';
      state.detail.artifact = null;
    } else {
      state.detail.artifact = updated;
    }
    renderDetailView();
    announce(t(updated?.pinned ? 'status_pinned' : 'status_unpinned'));
  } catch (error) {
    console.error('[abrium] Could not change the pinned state', error);
    announce(t('status_action_failed'));
  }
}

async function confirmDetailDelete(): Promise<void> {
  const artifact = state.detail.artifact;
  if (!artifact) return;
  try {
    await deleteArtifact(artifact.id);
    announce(t('status_deleted'));
    // Drop it from the gallery's own state so Back lands on a correct list
    // without waiting for the storage-change round trip.
    state.all = state.all.filter((candidate) => candidate.id !== artifact.id);
    state.selected.delete(artifact.id);
    returnFocusId = null;
    renderAll();
    closeDetail();
    void load();
  } catch (error) {
    console.error('[abrium] Delete failed', error);
    state.detail.confirmingDelete = false;
    renderDetailView();
    announce(t('status_action_failed'));
  }
}

/* -------------------------------------------------------------------------
   Settings / About — the third view
   ------------------------------------------------------------------------- */

function buildSettingsModel(): SettingsModel {
  return {
    status: state.settingsView.status,
    settings: state.settingsView.settings,
    totalCount: state.all.length,
    totalBytes: state.usedBytes,
    version: manifestVersion(),
  };
}

function manifestVersion(): string {
  try {
    return chrome.runtime.getManifest().version;
  } catch {
    return '0.0.0';
  }
}

function renderSettingsView(): void {
  dom.settingsRoot.innerHTML = renderSettings(buildSettingsModel(), ctx);
}

async function loadSettings(): Promise<void> {
  state.settingsView.status = 'loading';
  renderSettingsView();
  try {
    state.settingsView.settings = await readSettings();
    state.settingsView.status = 'ready';
  } catch (error) {
    state.settingsView.status = 'error';
    console.error('[abrium] Could not load settings', error);
  }
  renderSettingsView();
  focusSettingsStart();
}

function focusSettingsStart(): void {
  dom.settingsRoot.querySelector<HTMLButtonElement>('[data-action="back"]')?.focus();
}

function openSettings(): void {
  state.view = 'settings';
  applyView();
  void loadSettings();
}

function closeSettings(): void {
  state.view = 'gallery';
  applyView();
  dom.settingsRoot.innerHTML = '';
  document.querySelector<HTMLButtonElement>('[data-action="settings"]')?.focus();
}

/**
 * Persist a settings change and repaint every view in the new language/theme.
 *
 * The whole panel is re-rendered rather than reloaded: chrome.i18n cannot
 * switch locale at runtime, so the override is installed in memory and the
 * markup is regenerated from it immediately.
 */
async function updateSettings(patch: Partial<Settings>): Promise<void> {
  const next: Settings = { ...state.settingsView.settings, ...patch };
  state.settingsView.settings = next;

  if (patch.locale !== undefined) applyLocale(next.locale);
  if (patch.theme !== undefined) applyTheme(next.theme);

  // Re-rendering replaces the control that was just used, so remember it and
  // put focus back on the equivalent element — otherwise changing a setting
  // with the keyboard throws you to the Back button and you lose your place.
  const restore = focusTargetSelector(document.activeElement);

  // Repaint before the write so the change feels instant; a failed write is
  // reported separately rather than blocking the UI.
  renderAll();
  renderSettingsView();
  if (state.view === 'detail') renderDetailView();

  const target = restore
    ? dom.settingsRoot.querySelector<HTMLElement>(restore)
    : null;
  if (target) target.focus();
  else focusSettingsStart();

  try {
    await writeSettings(next);
    announce(t('status_settings_saved'));
  } catch (error) {
    console.error('[abrium] Could not save settings', error);
    announce(t('status_action_failed'));
  }
}

/**
 * A selector that will match the same control after the view is re-rendered.
 * Returns null when focus was somewhere that does not survive a repaint.
 */
function focusTargetSelector(active: Element | null): string | null {
  if (!(active instanceof HTMLElement)) return null;
  if (active.id === 'sp-locale') return '#sp-locale';
  const themeChoice = active.dataset['themeChoice'];
  if (themeChoice) return `[data-theme-choice="${CSS.escape(themeChoice)}"]`;
  const action = active.dataset['action'];
  if (action) return `[data-action="${CSS.escape(action)}"]`;
  return null;
}

async function exportBackup(): Promise<void> {
  try {
    exportArtifactsJson(state.all);
    announce(t('status_export_started'));
  } catch (error) {
    console.error('[abrium] Backup export failed', error);
    announce(t('status_action_failed'));
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
    // Both figures the UI shows are real disk usage, measured per key.
    const [usedBytes, sizes] = await Promise.all([
      getUsedBytes(),
      getArtifactSizes(artifacts.map((artifact) => artifact.id)),
    ]);
    state.usedBytes = usedBytes;
    state.sizes = sizes;
    state.status = 'ready';
    // Selections that no longer exist (deleted in another surface) are dropped.
    const ids = new Set(artifacts.map((artifact) => artifact.id));
    for (const id of state.selected) if (!ids.has(id)) state.selected.delete(id);
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

/* -------------------------------------------------------------------------
   Actions
   ------------------------------------------------------------------------- */

function artifactById(id: string): Artifact | undefined {
  return state.all.find((artifact) => artifact.id === id);
}

function cardIdFrom(target: Element): string | null {
  return target.closest<HTMLElement>('[data-id]')?.dataset['id'] ?? null;
}

function enterBatchMode(seedId?: string): void {
  state.batchMode = true;
  if (seedId) state.selected.add(seedId);
  renderAll();
  focusOption(0);
  announce(t('batch_mode_entered'));
}

function exitBatchMode(): void {
  state.batchMode = false;
  state.selected.clear();
  renderAll();
  document.querySelector<HTMLButtonElement>('[data-action="toggle-batch"]')?.focus();
  announce(t('batch_mode_exited'));
}

function toggleSelection(id: string): void {
  if (state.selected.has(id)) state.selected.delete(id);
  else state.selected.add(id);

  const model = buildModel();
  const card = dom.results.querySelector<HTMLElement>(`[data-id="${CSS.escape(id)}"]`);
  if (card) {
    const selected = state.selected.has(id);
    card.setAttribute('aria-selected', String(selected));
    const check = card.querySelector<HTMLElement>('.sp-check');
    if (check) {
      check.dataset['checked'] = String(selected);
      check.innerHTML = selected ? icon('check') : '';
    }
  }
  dom.actionbar.innerHTML = renderActionBar(model, ctx);
}

function selectedArtifacts(): Artifact[] {
  return state.all.filter((artifact) => state.selected.has(artifact.id));
}

async function runBatchAction(name: 'export' | 'download-zip'): Promise<void> {
  const chosen = selectedArtifacts();
  if (chosen.length === 0) return;
  try {
    if (name === 'export') {
      exportArtifactsJson(chosen);
      announce(t('status_export_started'));
    } else {
      await downloadArtifactsAsZip(chosen);
      announce(t('status_zip_started'));
    }
  } catch (error) {
    console.error('[abrium] Batch action failed', error);
    announce(t('status_action_failed'));
  }
}

/* -------------------------------------------------------------------------
   Events
   ------------------------------------------------------------------------- */

function onClick(event: MouseEvent): void {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const trigger = target.closest<HTMLElement>('[data-action]');
  if (!trigger) return;
  const action = trigger.dataset['action'];

  switch (action) {
    case 'clear-search': {
      state.query = '';
      renderAll();
      document.querySelector<HTMLInputElement>('#sp-search')?.focus();
      return;
    }
    case 'filter': {
      const value = trigger.dataset['filter'] as FilterValue | undefined;
      if (!value || value === state.filter) return;
      state.filter = value;
      renderAll();
      return;
    }
    case 'toggle-batch': {
      if (state.batchMode) exitBatchMode();
      else enterBatchMode();
      return;
    }
    case 'cancel-batch': {
      exitBatchMode();
      return;
    }
    case 'select-all': {
      for (const artifact of buildModel().visible) state.selected.add(artifact.id);
      renderAll();
      return;
    }
    case 'clear-selection': {
      state.selected.clear();
      renderAll();
      return;
    }
    case 'export':
    case 'download-zip': {
      void runBatchAction(action);
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
      // Dispatch rather than call openDetail() directly: the event is the
      // documented seam, and the popup raises the same one.
      if (id) document.dispatchEvent(new CustomEvent('abrium:open-artifact', { detail: { id } }));
      return;
    }
    case 'back': {
      if (state.view === 'settings') closeSettings();
      else closeDetail();
      return;
    }
    case 'retry-detail': {
      if (state.detail.id) void loadDetail(state.detail.id);
      return;
    }
    case 'toggle-pin': {
      void toggleDetailPin();
      return;
    }
    case 'download-one': {
      const artifact = state.detail.artifact;
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
    case 'request-delete': {
      // Two-step by design: deleting is irreversible, so the first click only
      // arms it. Focus moves to Cancel, not to the destructive button.
      state.detail.confirmingDelete = true;
      renderDetailView();
      dom.detailRoot.querySelector<HTMLButtonElement>('[data-action="cancel-delete"]')?.focus();
      return;
    }
    case 'cancel-delete': {
      state.detail.confirmingDelete = false;
      renderDetailView();
      dom.detailRoot.querySelector<HTMLButtonElement>('[data-action="request-delete"]')?.focus();
      return;
    }
    case 'confirm-delete': {
      void confirmDetailDelete();
      return;
    }
    case 'settings': {
      // Dispatch rather than call openSettings() directly — the event is the
      // documented seam, same as abrium:open-artifact.
      document.dispatchEvent(new CustomEvent('abrium:open-settings'));
      return;
    }
    case 'set-theme': {
      const choice = trigger.dataset['themeChoice'] as ThemePreference | undefined;
      if (choice) void updateSettings({ theme: choice });
      return;
    }
    case 'export-backup': {
      void exportBackup();
      return;
    }
    case 'view-all': {
      // Simple by design: clear any narrowing, then show the gallery.
      state.query = '';
      state.filter = 'all';
      renderAll();
      closeSettings();
      return;
    }
    case 'retry-settings': {
      void loadSettings();
      return;
    }
    case 'retry': {
      void load();
      return;
    }
    case 'dismiss-preview-hint': {
      state.previewHintActive = false;
      state.previewHintDismissed = true;
      renderAll();
      return;
    }
    case 'reset-filters': {
      state.query = '';
      state.filter = 'all';
      renderAll();
      return;
    }
    default:
      return;
  }
}

function onSelectChange(event: Event): void {
  const target = event.target;
  if (!(target instanceof HTMLSelectElement)) return;
  if (target.dataset['action'] !== 'set-locale') return;
  void updateSettings({ locale: target.value as LocalePreference });
}

function onSearchInput(event: Event): void {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || input.id !== 'sp-search') return;
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => {
    state.query = input.value;
    renderResults();
    syncClearButton();
    const model = buildModel();
    announce(tPlural('artifact_count', model.visible.length, formatCount(model.visible.length)));
  }, SEARCH_DEBOUNCE_MS);
}

let searchTimer = 0;

/** Add or remove the clear button without re-rendering the focused input. */
function syncClearButton(): void {
  const field = document.querySelector<HTMLElement>('.abr-field--search');
  if (!field) return;
  const existing = field.querySelector<HTMLElement>('[data-action="clear-search"]');
  const needed = state.query.length > 0;
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
}

/* --- keyboard: roving tabindex over the batch-mode listbox --------------- */

function options(): HTMLElement[] {
  return Array.from(dom.results.querySelectorAll<HTMLElement>('[role="option"]'));
}

function focusOption(index: number): void {
  const all = options();
  if (all.length === 0) return;
  const clamped = Math.max(0, Math.min(index, all.length - 1));
  for (const [position, option] of all.entries()) {
    option.tabIndex = position === clamped ? 0 : -1;
  }
  all[clamped]?.focus();
}

function onKeyDown(event: KeyboardEvent): void {
  if (state.view === 'settings') {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeSettings();
    }
    return;
  }

  // Detail owns Escape while it is up: first press backs out of an armed
  // delete, second leaves the view. The gallery's shortcuts stay dormant.
  if (state.view === 'detail') {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (state.detail.confirmingDelete) {
        state.detail.confirmingDelete = false;
        renderDetailView();
        dom.detailRoot.querySelector<HTMLButtonElement>('[data-action="request-delete"]')?.focus();
      } else {
        closeDetail();
      }
    }
    return;
  }

  if (event.key === 'Escape' && state.batchMode) {
    event.preventDefault();
    exitBatchMode();
    return;
  }

  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  // "/" focuses search, the convention for a search-first surface.
  if (event.key === '/' && !(target instanceof HTMLInputElement)) {
    event.preventDefault();
    document.querySelector<HTMLInputElement>('#sp-search')?.focus();
    return;
  }

  const option = target.closest<HTMLElement>('[role="option"]');
  if (!option) return;

  const all = options();
  const index = all.indexOf(option);

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      focusOption(index + 1);
      break;
    case 'ArrowUp':
      event.preventDefault();
      focusOption(index - 1);
      break;
    case 'Home':
      event.preventDefault();
      focusOption(0);
      break;
    case 'End':
      event.preventDefault();
      focusOption(all.length - 1);
      break;
    case ' ':
    case 'Enter': {
      event.preventDefault();
      const id = option.dataset['id'];
      if (id) toggleSelection(id);
      break;
    }
    default:
      break;
  }
}

function onListClick(event: MouseEvent): void {
  if (!state.batchMode) return;
  const target = event.target;
  if (!(target instanceof Element)) return;
  const option = target.closest<HTMLElement>('[role="option"]');
  const id = option?.dataset['id'];
  if (id) toggleSelection(id);
}

/* --- long press enters batch mode ---------------------------------------- */

let longPressTimer = 0;
let longPressCard: HTMLElement | null = null;

function cancelLongPress(): void {
  window.clearTimeout(longPressTimer);
  if (longPressCard) {
    delete longPressCard.dataset['longpress'];
    longPressCard = null;
  }
}

function onPointerDown(event: PointerEvent): void {
  if (state.view !== 'gallery' || state.batchMode || event.button !== 0) return;
  const target = event.target;
  if (!(target instanceof Element)) return;
  const card = target.closest<HTMLElement>('.abr-card[data-id]');
  if (!card) return;

  longPressCard = card;
  card.dataset['longpress'] = 'true';
  longPressTimer = window.setTimeout(() => {
    const id = card.dataset['id'];
    cancelLongPress();
    if (id) enterBatchMode(id);
  }, LONG_PRESS_MS);
}

/* -------------------------------------------------------------------------
   Boot
   ------------------------------------------------------------------------- */

function boot(): void {
  applyDocumentLocale();
  hydrate(document);

  document.addEventListener('click', onClick);
  document.addEventListener('change', onSelectChange);
  document.addEventListener('input', onSearchInput);
  document.addEventListener('keydown', onKeyDown);
  dom.results.addEventListener('click', onListClick);
  dom.results.addEventListener('pointerdown', onPointerDown);
  for (const name of ['pointerup', 'pointercancel', 'pointermove', 'scroll'] as const) {
    document.addEventListener(name, cancelLongPress, { passive: true });
  }

  // The gallery raises abrium:open-artifact; this is the listener that turns
  // it into a view change. Keeping them decoupled means the popup can raise
  // the same event once it can reach this panel.
  document.addEventListener('abrium:open-settings', () => {
    openSettings();
  });

  document.addEventListener('abrium:open-artifact', (event) => {
    const id = (event as CustomEvent<{ id?: string }>).detail?.id;
    if (typeof id === 'string' && id.length > 0) openDetail(id);
  });

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === 'capture:preview_hint') {
      if (!state.previewHintDismissed && !state.previewHintActive) {
        state.previewHintActive = true;
        renderAll();
      }
      return false;
    }
    return false;
  });

  onArtifactsChanged(() => {
    if (state.previewHintActive) {
      state.previewHintActive = false;
    }
    void load();
    // A background capture must not yank the detail view out from under the
    // reader; only re-read it if it is the one that changed away.
    if (state.view === 'detail' && state.detail.id) void loadDetail(state.detail.id);
  });

  applyView();
  // Settings decide the language and theme, so they must land before the first
  // paint or the panel would flash the auto-detected locale.
  void loadAndApplySettings().then((settings) => {
    state.settingsView.settings = settings;
    renderAll();
    return load();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
