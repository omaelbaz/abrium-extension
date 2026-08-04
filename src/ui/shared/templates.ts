/**
 * Markup shared by every surface — pure functions, no DOM, no chrome APIs.
 *
 * The side panel and the popup render the same search field, the same artifact
 * card and the same empty/error blocks. Those live here so there is exactly one
 * definition of each (CLAUDE.md — "no remixing"). Surface-specific chrome —
 * filter chips, the batch action bar, the popup footer — stays in that
 * surface's own templates file.
 *
 * Everything user-facing arrives through the injected RenderContext, so this
 * module is locale-agnostic and renders identically for the extension, for
 * tests, and for the static state-matrix preview.
 */

import type { Artifact, ArtifactType, FilterValue } from '../../types/index.ts';
import type { IconName } from '../icons.ts';
import { icon } from '../icons.ts';

export interface RenderContext {
  t: (key: string, subs?: readonly string[]) => string;
  tPlural: (base: string, count: number, formatted: string) => string;
  formatDate: (epochMs: number) => string;
  formatBytes: (bytes: number) => string;
  formatCount: (value: number) => string;
}

/** Message key for a type's chip label and card badge. */
export const TYPE_LABEL_KEY: Record<FilterValue, string> = {
  all: 'filter_all',
  code: 'filter_code',
  html: 'filter_html',
  markdown: 'filter_markdown',
  svg: 'filter_svg',
  react: 'filter_react',
};

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Escape a value that is being placed in a double-quoted attribute whose
 * content is itself parsed as markup — specifically iframe `srcdoc`.
 *
 * Only `&` and `"` may be encoded: escaping `<` would turn the embedded
 * document into literal text instead of rendering it. Never use this for
 * ordinary attributes or for text content — use escapeHtml there.
 */
export function escapeSrcdoc(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

/* -------------------------------------------------------------------------
   SEARCH FIELD
   ------------------------------------------------------------------------- */

export interface SearchFieldOptions {
  /** Current query text. */
  query: string;
  /** id for the <input>; the surface's controller focuses it by this id. */
  inputId: string;
  /** id of the results list this field filters, for aria-controls. */
  controlsId: string;
}

export function searchField(ctx: RenderContext, options: SearchFieldOptions): string {
  const hasQuery = options.query.length > 0;
  return `
    <div class="abr-field abr-field--search">
      ${icon('search', { className: 'abr-field__icon' })}
      <input
        class="abr-input"
        id="${escapeHtml(options.inputId)}"
        type="search"
        autocomplete="off"
        spellcheck="false"
        placeholder="${escapeHtml(ctx.t('search_placeholder'))}"
        aria-label="${escapeHtml(ctx.t('search_label'))}"
        aria-controls="${escapeHtml(options.controlsId)}"
        value="${escapeHtml(options.query)}"
      />
      ${
        hasQuery
          ? `<button
               class="abr-icon-btn abr-icon-btn--sm abr-field__clear"
               type="button"
               data-action="clear-search"
               aria-label="${escapeHtml(ctx.t('search_clear'))}"
             >${icon('close')}</button>`
          : ''
      }
    </div>`;
}

/* -------------------------------------------------------------------------
   ARTIFACT CARD
   ------------------------------------------------------------------------- */

/**
 * The two metadata rows under a card title.
 *
 * `sizeBytes` is real disk usage from getBytesInUse(), passed down from the
 * model. It is undefined when the measurement failed, in which case the size is
 * omitted — `artifact.bytes` must never stand in for it (CLAUDE.md, Rules).
 */
export function cardMeta(
  artifact: Artifact,
  ctx: RenderContext,
  sizeBytes: number | undefined,
): string {
  const typeLabel = ctx.t(TYPE_LABEL_KEY[artifact.type as ArtifactType]);
  const size =
    sizeBytes === undefined
      ? ''
      : `<span class="abr-bidi-isolate">${escapeHtml(ctx.formatBytes(sizeBytes))}</span>`;
  return `
    <div class="abr-card__meta abr-caption">
      <span class="abr-badge abr-badge--type">${escapeHtml(typeLabel)}</span>
      <span class="abr-truncate">${escapeHtml(artifact.filename)}</span>
    </div>
    <div class="abr-card__meta abr-caption">
      ${size}
      <span>${escapeHtml(ctx.formatDate(artifact.createdAt))}</span>
    </div>`;
}

/**
 * The default artifact card, used by the side panel in browse mode and by the
 * whole popup.
 *
 * The title is the activation target and its ::after overlay covers the whole
 * card, so the entire surface is clickable while keyboard focus lands on
 * exactly one control. The download button sits above the overlay.
 */
export function artifactCard(
  artifact: Artifact,
  ctx: RenderContext,
  sizeBytes: number | undefined,
): string {
  return `
    <li>
      <article class="abr-card" data-id="${escapeHtml(artifact.id)}">
        <div class="abr-card__head">
          <div class="abr-card__title abr-card__body">
            <h3 class="abr-subhead abr-truncate">
              <button class="abr-card__open" type="button" data-action="open">${escapeHtml(
                artifact.title,
              )}</button>
            </h3>
            ${cardMeta(artifact, ctx, sizeBytes)}
          </div>
          <div class="abr-card__actions">
            <button
              class="abr-icon-btn abr-icon-btn--sm"
              type="button"
              data-action="download"
              aria-label="${escapeHtml(ctx.t('action_download_named', [artifact.title]))}"
            >${icon('download')}</button>
          </div>
        </div>
      </article>
    </li>`;
}

/* -------------------------------------------------------------------------
   NON-POPULATED STATES
   ------------------------------------------------------------------------- */

export interface NoticeOptions {
  titleKey: string;
  bodyKey: string;
  ctx: RenderContext;
  bodySubs?: readonly string[];
  action?: { key: string; name: string; glyph?: IconName };
  tone?: 'error';
}

/** Text-only empty / no-results / error block. */
export function notice(options: NoticeOptions): string {
  const { ctx } = options;
  return `
    <div class="abr-notice" ${options.tone === 'error' ? 'role="alert"' : ''}>
      ${options.tone === 'error' ? `<span class="abr-notice__icon">${icon('alert')}</span>` : ''}
      <p class="abr-subhead">${escapeHtml(ctx.t(options.titleKey))}</p>
      <p class="abr-body">${escapeHtml(ctx.t(options.bodyKey, options.bodySubs))}</p>
      ${
        options.action
          ? `<button
               class="abr-btn abr-btn--secondary"
               type="button"
               data-action="${options.action.name}"
             >${icon(options.action.glyph ?? 'refresh')}${escapeHtml(
               ctx.t(options.action.key),
             )}</button>`
          : ''
      }
    </div>`;
}

/** Loading skeletons. The caller picks the count that fills its surface. */
export function skeletonCards(count: number): string {
  const card = `
    <li>
      <article class="abr-card abr-card--static" aria-hidden="true">
        <div class="abr-skeleton" style="inline-size:70%;block-size:13px"></div>
        <div class="abr-skeleton" style="inline-size:45%"></div>
        <div class="abr-skeleton" style="inline-size:30%"></div>
      </article>
    </li>`;
  return card.repeat(count);
}
