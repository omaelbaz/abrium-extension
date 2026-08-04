/**
 * Artifact Detail templates — pure functions, no DOM, no chrome APIs.
 *
 * Rendered inside the side panel, replacing the gallery. Reuses the shared
 * notice/skeleton blocks and the canonical component classes; only the detail
 * layout itself is new.
 */

import type { Artifact, ArtifactType } from '../../types/index.ts';
import { icon } from '../icons.ts';
import type { RenderContext } from '../shared/templates.ts';
import { TYPE_LABEL_KEY, escapeHtml, escapeSrcdoc, notice } from '../shared/templates.ts';

export interface DetailModel {
  status: 'loading' | 'error' | 'missing' | 'ready';
  artifact: Artifact | null;
  /** Real disk usage from getBytesInUse(); null when it could not be measured. */
  sizeBytes: number | null;
  /** Delete is two-step; this is the armed state. */
  confirmingDelete: boolean;
}

/**
 * Above this, a rendered preview is refused and the download notice is shown
 * instead. A multi-megabyte document would lock up a 380px panel, and the file
 * is one click away regardless.
 */
const PREVIEW_MAX_CHARS = 512 * 1024;

/** Types shown as monospace source rather than rendered. */
const SOURCE_TYPES: ReadonlySet<string> = new Set(['code', 'markdown', 'react']);

/* -------------------------------------------------------------------------
   CONVERSATION LINK
   ------------------------------------------------------------------------- */

/**
 * conversationId arrives from captured page content, so it is never trusted
 * into an href. Only an opaque id shape is allowed through; anything else
 * drops the link entirely rather than risking a javascript: or off-host URL.
 * The host is a constant here, never taken from the artifact.
 */
export function conversationUrl(conversationId: string | null): string | null {
  if (!conversationId) return null;
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(conversationId)) return null;
  return `https://claude.ai/chat/${conversationId}`;
}

/* -------------------------------------------------------------------------
   CONTENT PREVIEW
   ------------------------------------------------------------------------- */

export function canRenderPreview(artifact: Artifact): boolean {
  if (artifact.type !== 'html' && artifact.type !== 'svg') return false;
  if (artifact.content.trim().length === 0) return false;
  return artifact.content.length <= PREVIEW_MAX_CHARS;
}

/**
 * Sandboxed render of a captured HTML/SVG artifact.
 *
 * Captured content is hostile by assumption. Four independent layers keep it
 * inert, and the preview is only reached when every one of them applies:
 *
 *  1. `sandbox=""` — every restriction on. No allow-scripts, so no inline
 *     handlers, no <script>, no SVG <script>; no allow-same-origin, so the
 *     frame gets an opaque origin and cannot touch extension storage or the
 *     parent document. This is a browser guarantee, not a CSP nicety.
 *  2. `csp` attribute — the embedder-enforced policy the frame must run under.
 *  3. A matching <meta> CSP as the very first thing in the document, so the
 *     policy is in force before any markup that could request a subresource.
 *     `default-src 'none'` is what stops a captured <img src="https://…">
 *     from beaconing out; only inline styles and data: images/fonts survive.
 *  4. `referrerpolicy="no-referrer"` so nothing leaks even if a request were
 *     somehow attempted.
 *
 * If any doubt remains about a given artifact — wrong type, empty, or too
 * large — canRenderPreview() returns false and the caller shows the download
 * notice instead. There is deliberately no path that executes captured script.
 */
const FRAME_CSP = "default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:";

function sandboxedPreview(artifact: Artifact, ctx: RenderContext): string {
  const document_ = [
    '<!doctype html><html><head>',
    `<meta http-equiv="Content-Security-Policy" content="${FRAME_CSP}">`,
    '<meta charset="utf-8">',
    '<style>html,body{margin:0;padding:8px;font:13px system-ui,sans-serif;}',
    'img,svg{max-width:100%;height:auto;}</style>',
    '</head><body>',
    artifact.content,
    '</body></html>',
  ].join('');

  return `
    <iframe
      class="sp-detail__frame"
      sandbox=""
      csp="${escapeHtml(FRAME_CSP)}"
      referrerpolicy="no-referrer"
      loading="lazy"
      title="${escapeHtml(ctx.t('detail_preview_label'))}"
      srcdoc="${escapeSrcdoc(document_)}"
    ></iframe>`;
}

function sourceBlock(artifact: Artifact): string {
  return `<pre class="abr-code abr-code--full">${escapeHtml(artifact.content)}</pre>`;
}

export function renderPreview(artifact: Artifact, ctx: RenderContext): string {
  const isSource = SOURCE_TYPES.has(artifact.type as ArtifactType);
  const heading = isSource ? 'detail_source_label' : 'detail_preview_label';

  let body: string;
  if (isSource) {
    body =
      artifact.content.trim().length > 0
        ? sourceBlock(artifact)
        : notice({
            titleKey: 'detail_preview_unavailable_title',
            bodyKey: 'detail_preview_unavailable_body',
            ctx,
          });
  } else if (canRenderPreview(artifact)) {
    body = sandboxedPreview(artifact, ctx);
  } else {
    // Wrong shape, empty, or too big to render safely/usefully in the panel.
    body = notice({
      titleKey: 'detail_preview_unavailable_title',
      bodyKey: 'detail_preview_unavailable_body',
      ctx,
    });
  }

  return `
    <section class="sp-detail__section">
      <p class="abr-overline">${escapeHtml(ctx.t(heading))}</p>
      ${body}
    </section>`;
}

/* -------------------------------------------------------------------------
   HEADER / META / ACTIONS
   ------------------------------------------------------------------------- */

function detailHeader(model: DetailModel, ctx: RenderContext): string {
  const pinned = model.artifact?.pinned === true;
  const canPin = model.status === 'ready' && model.artifact !== null;
  return `
    <button
      class="abr-icon-btn"
      type="button"
      data-action="back"
      aria-label="${escapeHtml(ctx.t('action_back'))}"
    >${icon('chevronBack')}</button>
    <span class="abr-toolbar__spacer"></span>
    <button
      class="abr-icon-btn"
      type="button"
      data-action="toggle-pin"
      aria-pressed="${pinned}"
      aria-label="${escapeHtml(ctx.t(pinned ? 'action_unpin' : 'action_pin'))}"
      ${canPin ? '' : 'disabled'}
    >${icon(pinned ? 'pinFilled' : 'pin')}</button>`;
}

function metaRows(artifact: Artifact, model: DetailModel, ctx: RenderContext): string {
  const typeLabel = ctx.t(TYPE_LABEL_KEY[artifact.type as ArtifactType]);
  // Same rule as everywhere: real disk usage, or omitted. Never artifact.bytes.
  const size =
    model.sizeBytes === null
      ? ''
      : `<span class="abr-bidi-isolate">${escapeHtml(ctx.formatBytes(model.sizeBytes))}</span>`;
  const url = conversationUrl(artifact.conversationId);

  return `
    <div class="abr-card__meta abr-caption">
      <span class="abr-badge abr-badge--type">${escapeHtml(typeLabel)}</span>
      <span class="abr-truncate">${escapeHtml(artifact.filename)}</span>
    </div>
    <div class="abr-card__meta abr-caption">
      ${size}
      <span>${escapeHtml(ctx.formatDate(artifact.createdAt))}</span>
    </div>
    ${
      url
        ? `<a
             class="sp-link abr-caption"
             href="${escapeHtml(url)}"
             target="_blank"
             rel="noopener noreferrer"
           >${escapeHtml(ctx.t('detail_open_conversation'))}${icon('external')}</a>`
        : ''
    }`;
}

export function renderActions(model: DetailModel, ctx: RenderContext): string {
  if (model.status !== 'ready' || !model.artifact) return '';

  if (model.confirmingDelete) {
    return `
      <div class="abr-actionbar" role="group" aria-label="${escapeHtml(
        ctx.t('delete_confirm_title'),
      )}">
        <div class="abr-actionbar__row">
          <p class="abr-caption" role="alert">${escapeHtml(
            ctx.t('delete_confirm_title'),
          )} ${escapeHtml(ctx.t('delete_confirm_body'))}</p>
        </div>
        <div class="abr-actionbar__row">
          <button
            class="abr-btn abr-btn--ghost abr-btn--sm sp-grow"
            type="button"
            data-action="cancel-delete"
          >${escapeHtml(ctx.t('action_cancel'))}</button>
          <button
            class="abr-btn abr-btn--danger abr-btn--sm sp-grow"
            type="button"
            data-action="confirm-delete"
          >${icon('trash')}${escapeHtml(ctx.t('action_confirm_delete'))}</button>
        </div>
      </div>`;
  }

  return `
    <div class="abr-actionbar">
      <div class="abr-actionbar__row">
        <button
          class="abr-btn abr-btn--danger abr-btn--sm"
          type="button"
          data-action="request-delete"
        >${icon('trash')}${escapeHtml(ctx.t('action_delete'))}</button>
        <button
          class="abr-btn abr-btn--primary abr-btn--sm sp-grow"
          type="button"
          data-action="download-one"
        >${icon('download')}${escapeHtml(ctx.t('action_download'))}</button>
      </div>
    </div>`;
}

/* -------------------------------------------------------------------------
   BODY + WHOLE VIEW
   ------------------------------------------------------------------------- */

/** Skeleton shaped like the detail layout, not like a list of cards. */
function loadingBody(): string {
  return `
    <div class="sp-detail__section" aria-hidden="true">
      <div class="abr-skeleton" style="inline-size:80%;block-size:17px"></div>
      <div class="abr-skeleton" style="inline-size:55%"></div>
      <div class="abr-skeleton" style="inline-size:35%"></div>
      <div class="abr-skeleton" style="block-size:160px"></div>
    </div>`;
}

export function renderDetailBody(model: DetailModel, ctx: RenderContext): string {
  if (model.status === 'loading') return loadingBody();

  if (model.status === 'missing') {
    // Quota eviction or a delete from another surface between listing and
    // opening. A real outcome, so it gets its own copy and a way back.
    return notice({
      titleKey: 'detail_missing_title',
      bodyKey: 'detail_missing_body',
      ctx,
      action: { key: 'action_back', name: 'back', glyph: 'chevronBack' },
    });
  }

  if (model.status === 'error' || !model.artifact) {
    return notice({
      titleKey: 'detail_error_title',
      bodyKey: 'error_body',
      ctx,
      action: { key: 'action_retry', name: 'retry-detail' },
      tone: 'error',
    });
  }

  const artifact = model.artifact;
  return `
    <h2 class="abr-heading sp-detail__title">${escapeHtml(artifact.title)}</h2>
    <div class="sp-detail__meta">${metaRows(artifact, model, ctx)}</div>
    ${renderPreview(artifact, ctx)}`;
}

/** Whole detail view — used for first paint and by the state-matrix preview. */
export function renderDetail(model: DetailModel, ctx: RenderContext): string {
  return `
    <header class="abr-toolbar sp-detail__bar">
      ${detailHeader(model, ctx)}
    </header>
    <main
      class="sp-body sp-detail"
      id="sp-detail"
      aria-label="${escapeHtml(ctx.t('detail_label'))}"
      aria-busy="${model.status === 'loading'}"
    >${renderDetailBody(model, ctx)}</main>
    ${renderActions(model, ctx)}`;
}
