/**
 * Popup templates — pure functions, no DOM, no chrome APIs.
 *
 * The popup is deliberately the smaller surface: search, the most recent few
 * artifacts, and a way into the full gallery. No filters, no batch selection,
 * no settings — those live only in the side panel.
 *
 * Search field, artifact card and the empty/error blocks come from
 * ui/shared/templates.ts, the same definitions the side panel renders.
 */

import type { Artifact } from '../../types/index.ts';
import { icon } from '../icons.ts';
import type { RenderContext } from '../shared/templates.ts';
import {
  artifactCard,
  escapeHtml,
  notice,
  searchField,
  skeletonCards,
} from '../shared/templates.ts';

export type { RenderContext };

/** How many artifacts the popup shows. The IA calls for the last 5. */
export const POPUP_LIMIT = 5;

export interface PopupModel {
  status: 'loading' | 'error' | 'ready';
  /** At most POPUP_LIMIT artifacts, already filtered by `query`. */
  visible: Artifact[];
  /** Whether the vault holds anything at all, regardless of the query. */
  totalCount: number;
  /** Real per-artifact disk usage from getBytesInUse(), keyed by artifact id. */
  sizes: ReadonlyMap<string, number>;
  query: string;
}

export function renderHeader(model: PopupModel, ctx: RenderContext): string {
  return searchField(ctx, {
    query: model.query,
    inputId: 'pop-search',
    controlsId: 'pop-results',
  });
}

/**
 * Three skeletons — the popup is shorter than the panel, and promising five
 * rows before the read completes would make the list jump.
 */
export function renderLoading(): string {
  return skeletonCards(3);
}

export function renderBody(model: PopupModel, ctx: RenderContext): string {
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

  // Same copy and behaviour as the gallery's empty state.
  if (model.totalCount === 0) {
    return notice({ titleKey: 'empty_title', bodyKey: 'empty_body', ctx });
  }

  if (model.visible.length === 0) {
    // The popup has no filters, so the only thing to undo is the query.
    return notice({
      titleKey: 'no_results_title',
      bodyKey: 'no_results_body',
      ctx,
      action: { key: 'search_clear', name: 'clear-search', glyph: 'close' },
    });
  }

  return model.visible
    .map((artifact) => artifactCard(artifact, ctx, model.sizes.get(artifact.id)))
    .join('');
}

/**
 * Section label above the list. Only meaningful when the list really is "the
 * most recent" — once a query narrows it, the search field is the context.
 */
export function renderListHeading(model: PopupModel, ctx: RenderContext): string {
  const show = model.status === 'ready' && model.query === '' && model.visible.length > 0;
  return show
    ? `<p class="abr-overline pop-heading">${escapeHtml(ctx.t('popup_recent_heading'))}</p>`
    : '';
}

/** Footer: the one route out of the popup and into the full gallery. */
export function renderFooter(ctx: RenderContext): string {
  return `
    <div class="abr-actionbar">
      <button
        class="abr-btn abr-btn--primary abr-btn--block"
        type="button"
        data-action="open-vault"
      >${escapeHtml(ctx.t('action_view_vault'))}${icon('chevronForward')}</button>
    </div>`;
}

/**
 * Whole-popup render. The controller patches the body independently while
 * typing; this is used for first paint and by the state-matrix preview.
 */
export function renderPopup(model: PopupModel, ctx: RenderContext): string {
  return `
    <header class="abr-toolbar pop-header">
      ${renderHeader(model, ctx)}
    </header>
    <main class="pop-body">
      ${renderListHeading(model, ctx)}
      <ul
        class="abr-stack pop-list"
        id="pop-results"
        role="list"
        aria-label="${escapeHtml(ctx.t('popup_recent_heading'))}"
        aria-busy="${model.status === 'loading'}"
      >${renderBody(model, ctx)}</ul>
    </main>
    ${renderFooter(ctx)}`;
}
