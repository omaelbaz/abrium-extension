/**
 * Side-panel gallery templates — pure functions, no DOM, no chrome APIs.
 *
 * Only what is specific to the gallery lives here: the filter chip row, the
 * summary line, batch-mode cards and the batch action bar. The search field,
 * the default artifact card and the empty/error blocks come from
 * ui/shared/templates.ts, which the popup renders from too.
 */

import type { Artifact, FilterValue, GalleryModel } from '../../types/index.ts';
import { ARTIFACT_TYPES } from '../../types/index.ts';
import { icon } from '../icons.ts';
import type { RenderContext } from '../shared/templates.ts';
import {
  TYPE_LABEL_KEY,
  artifactCard,
  cardMeta,
  escapeHtml,
  notice,
  searchField,
  skeletonCards,
} from '../shared/templates.ts';

export type { RenderContext };

/** Chip order. 'all' leads; the rest follow the IA's stated order. */
export const FILTER_ORDER: readonly FilterValue[] = ['all', ...ARTIFACT_TYPES];

/* -------------------------------------------------------------------------
   HEADER
   ------------------------------------------------------------------------- */

function filterChips(model: GalleryModel, ctx: RenderContext): string {
  const chips = FILTER_ORDER.map((value) => {
    const count = model.counts[value] ?? 0;
    const active = model.activeFilter === value;
    // A filter that can never match anything is disabled rather than hidden,
    // so the row's shape stays stable as the vault fills up.
    const disabled = value !== 'all' && count === 0;
    return `
      <button
        class="abr-chip"
        type="button"
        role="radio"
        data-action="filter"
        data-filter="${value}"
        aria-checked="${active}"
        aria-pressed="${active}"
        ${disabled ? 'disabled' : ''}
      >${escapeHtml(ctx.t(TYPE_LABEL_KEY[value]))} <span class="abr-chip__count">${escapeHtml(
        ctx.formatCount(count),
      )}</span></button>`;
  }).join('');

  return `
    <div
      class="abr-chip-row"
      role="radiogroup"
      aria-label="${escapeHtml(ctx.t('filter_group_label'))}"
    >${chips}</div>`;
}

function summaryLine(model: GalleryModel, ctx: RenderContext): string {
  const artifacts = ctx.tPlural(
    'artifact_count',
    model.totalCount,
    ctx.formatCount(model.totalCount),
  );
  // An unmeasurable total renders as a placeholder, matching how a card omits
  // a size it could not measure — never a confident-looking "0 bytes".
  const size =
    model.totalBytes === null ? ctx.t('size_unavailable') : ctx.formatBytes(model.totalBytes);
  // The separator lives in the message, not in code, so RTL locales can move
  // or drop it. $1 = count phrase, $2 = size.
  return escapeHtml(ctx.t('stats_summary', [artifacts, size]));
}

export function renderHeader(model: GalleryModel, ctx: RenderContext): string {
  const busy = model.status === 'loading';
  return `
    <div class="sp-header__bar">
      ${searchField(ctx, { query: model.query, inputId: 'sp-search', controlsId: 'sp-results' })}
      <button
        class="abr-icon-btn"
        type="button"
        data-action="settings"
        aria-label="${escapeHtml(ctx.t('action_settings'))}"
      >${icon('settings')}</button>
    </div>

    ${filterChips(model, ctx)}

    <div class="sp-header__stats">
      <p class="abr-caption abr-truncate" id="sp-summary">${
        busy ? escapeHtml(ctx.t('loading_label')) : summaryLine(model, ctx)
      }</p>
      <button
        class="abr-btn abr-btn--ghost abr-btn--sm"
        type="button"
        data-action="toggle-batch"
        aria-pressed="${model.batchMode}"
        ${model.status === 'ready' && model.totalCount > 0 ? '' : 'disabled'}
      >${escapeHtml(ctx.t(model.batchMode ? 'action_done' : 'action_select'))}</button>
    </div>`;
}

/* -------------------------------------------------------------------------
   CARD — batch mode only; browse mode uses the shared artifactCard
   ------------------------------------------------------------------------- */

/**
 * Batch mode: the card itself becomes the option. Inner controls are removed
 * rather than hidden, so there is nothing to tab into and the roving-tabindex
 * listbox owns keyboard movement.
 */
function selectCard(
  artifact: Artifact,
  ctx: RenderContext,
  sizeBytes: number | undefined,
  selected: boolean,
  focusable: boolean,
): string {
  return `
    <li>
      <article
        class="abr-card"
        role="option"
        tabindex="${focusable ? '0' : '-1'}"
        aria-selected="${selected}"
        data-id="${escapeHtml(artifact.id)}"
      >
        <div class="abr-card__head">
          <span class="sp-check" data-checked="${selected}" aria-hidden="true">${
            selected ? icon('check') : ''
          }</span>
          <div class="abr-card__title abr-card__body">
            <h3 class="abr-subhead abr-truncate">${escapeHtml(artifact.title)}</h3>
            ${cardMeta(artifact, ctx, sizeBytes)}
          </div>
        </div>
      </article>
    </li>`;
}

export function renderCard(
  artifact: Artifact,
  ctx: RenderContext,
  model: GalleryModel,
  focusable: boolean,
): string {
  const sizeBytes = model.sizes.get(artifact.id);
  return model.batchMode
    ? selectCard(artifact, ctx, sizeBytes, model.selected.has(artifact.id), focusable)
    : artifactCard(artifact, ctx, sizeBytes);
}

/** Four skeletons: enough to fill a 380×600 panel without implying a count. */
export function renderLoading(): string {
  return skeletonCards(4);
}

/* -------------------------------------------------------------------------
   BODY + ACTION BAR
   ------------------------------------------------------------------------- */

export function renderBody(model: GalleryModel, ctx: RenderContext): string {
  if (model.status === 'loading') return renderLoading();

  if (model.status === 'error') {
    return notice({
      titleKey: 'error_title',
      bodyKey: 'error_body',
      ctx,
      action: { key: 'action_retry', name: 'retry' },
      tone: 'error',
    });
  }

  let out = '';
  if (model.showPreviewHint) {
    out += `<li>${notice({
      titleKey: 'preview_hint_title',
      bodyKey: 'preview_hint_body',
      ctx,
      action: { key: 'action_dismiss', name: 'dismiss-preview-hint', glyph: 'close' },
    })}</li>`;
  }

  if (model.totalCount === 0) {
    return out + notice({ titleKey: 'empty_title', bodyKey: 'empty_body', ctx });
  }

  if (model.visible.length === 0) {
    return out + notice({
      titleKey: 'no_results_title',
      bodyKey: 'no_results_body',
      ctx,
      action: { key: 'action_reset_filters', name: 'reset-filters' },
    });
  }

  out += model.visible
    .map((artifact, index) => renderCard(artifact, ctx, model, index === 0))
    .join('');

  return out;
}

export function renderActionBar(model: GalleryModel, ctx: RenderContext): string {
  if (!model.batchMode) return '';

  const count = model.selected.size;
  const label = ctx.tPlural('selected_count', count, ctx.formatCount(count));
  const allVisibleSelected =
    model.visible.length > 0 && model.visible.every((a) => model.selected.has(a.id));

  return `
    <div class="abr-actionbar" role="group" aria-label="${escapeHtml(
      ctx.t('batch_bar_label'),
    )}">
      <div class="abr-actionbar__row">
        <p class="abr-caption abr-truncate" role="status">${escapeHtml(label)}</p>
        <span class="abr-toolbar__spacer"></span>
        <button
          class="abr-btn abr-btn--ghost abr-btn--sm"
          type="button"
          data-action="${allVisibleSelected ? 'clear-selection' : 'select-all'}"
        >${escapeHtml(ctx.t(allVisibleSelected ? 'action_clear_selection' : 'action_select_all'))}</button>
      </div>
      <div class="abr-actionbar__row">
        <button
          class="abr-btn abr-btn--ghost abr-btn--sm"
          type="button"
          data-action="cancel-batch"
        >${escapeHtml(ctx.t('action_cancel'))}</button>
        <button
          class="abr-btn abr-btn--secondary abr-btn--sm sp-grow"
          type="button"
          data-action="export"
          ${count === 0 ? 'disabled' : ''}
        >${escapeHtml(ctx.t('action_export'))}</button>
        <button
          class="abr-btn abr-btn--primary abr-btn--sm sp-grow"
          type="button"
          data-action="download-zip"
          ${count === 0 ? 'disabled' : ''}
        >${icon('archive')}${escapeHtml(ctx.t('action_download_zip'))}</button>
      </div>
    </div>`;
}

/** Attributes the results list carries, which differ between the two modes. */
export function listAttributes(model: GalleryModel, ctx: RenderContext): string {
  const populated = model.status === 'ready' && model.visible.length > 0;
  if (model.batchMode && populated) {
    return `role="listbox" aria-multiselectable="true" aria-label="${escapeHtml(
      ctx.t('gallery_label'),
    )}"`;
  }
  return `role="list" aria-label="${escapeHtml(ctx.t('gallery_label'))}"`;
}

/**
 * Whole-panel render. The extension patches header/body/bar independently on
 * most interactions; this is used for first paint and by the preview build.
 */
export function renderPanel(model: GalleryModel, ctx: RenderContext): string {
  return `
    <header class="abr-toolbar abr-toolbar--stack sp-header">
      ${renderHeader(model, ctx)}
    </header>
    <main class="sp-body">
      <ul class="abr-stack sp-list" id="sp-results" ${listAttributes(model, ctx)} aria-busy="${
        model.status === 'loading'
      }">
        ${renderBody(model, ctx)}
      </ul>
    </main>
    ${renderActionBar(model, ctx)}`;
}
