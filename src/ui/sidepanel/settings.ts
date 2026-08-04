/**
 * Settings / About templates — pure functions, no DOM, no chrome APIs.
 *
 * A third view inside the side panel, alongside the gallery and the detail
 * view. Reuses the shared notice block and the canonical component classes.
 */

import type { LocalePreference, Settings, ThemePreference } from '../../lib/settings.ts';
import { LOCALE_CHOICES, THEME_CHOICES } from '../../lib/settings.ts';
import { LOCALE_ENDONYMS } from '../../lib/locales.ts';
import type { IconName } from '../icons.ts';
import { icon } from '../icons.ts';
import type { RenderContext } from '../shared/templates.ts';
import { escapeHtml, notice } from '../shared/templates.ts';

/* ==========================================================================
   OUTBOUND LINKS — one is still a PLACEHOLDER. Check before public release.
   These are the only outbound links in this screen, they are plain <a href>
   navigations (never fetched), and they are listed together so none can hide
   in the markup. `support` and `repository` are live and real. `changelog`
   is not: abrium.onl does not resolve yet (NXDOMAIN as of 2026-08-04).
   It must stay a placeholder until the domain is live — never point it at a
   dev server. A localhost URL here ships a dead link to every user, and
   tools/verify-dist.mjs fails the build if one reaches dist/.
   ========================================================================== */
export const PLACEHOLDER_LINKS = {
  support: 'https://patreon.com/OmarElbaz',
  repository: 'https://github.com/omaelbaz/abrium-extension',
  /** TODO(real-url): website changelog page not reachable yet (domain not live). */
  changelog: 'https://abrium.onl/changelog',
} as const;

export interface SettingsModel {
  status: 'loading' | 'error' | 'ready';
  settings: Settings;
  /** Unfiltered vault count, for the storage summary. */
  totalCount: number;
  /** Real disk usage from getBytesInUse(); null when unmeasurable. */
  totalBytes: number | null;
  /** From chrome.runtime.getManifest(). */
  version: string;
}

const THEME_ICON: Record<ThemePreference, IconName> = {
  system: 'display',
  light: 'sun',
  dark: 'moon',
};

const THEME_LABEL_KEY: Record<ThemePreference, string> = {
  system: 'theme_system',
  light: 'theme_light',
  dark: 'theme_dark',
};

function localeLabel(choice: LocalePreference, ctx: RenderContext): string {
  // Languages are listed by endonym; only "system" is a translated phrase.
  return choice === 'system' ? ctx.t('language_system') : LOCALE_ENDONYMS[choice];
}

/* -------------------------------------------------------------------------
   Sections
   ------------------------------------------------------------------------- */

function section(titleKey: string, ctx: RenderContext, body: string): string {
  return `
    <section class="abr-card abr-card--static sp-settings__group">
      <p class="abr-overline">${escapeHtml(ctx.t(titleKey))}</p>
      ${body}
    </section>`;
}

function languageSection(model: SettingsModel, ctx: RenderContext): string {
  const options = LOCALE_CHOICES.map(
    (choice) => `
      <option value="${choice}" ${choice === model.settings.locale ? 'selected' : ''}>${escapeHtml(
        localeLabel(choice, ctx),
      )}</option>`,
  ).join('');

  return section(
    'settings_language',
    ctx,
    `<select
       class="abr-select"
       id="sp-locale"
       data-action="set-locale"
       aria-label="${escapeHtml(ctx.t('settings_language'))}"
     >${options}</select>`,
  );
}

function themeSection(model: SettingsModel, ctx: RenderContext): string {
  const chips = THEME_CHOICES.map((choice) => {
    const active = choice === model.settings.theme;
    return `
      <button
        class="abr-chip"
        type="button"
        role="radio"
        data-action="set-theme"
        data-theme-choice="${choice}"
        aria-checked="${active}"
        aria-pressed="${active}"
      >${icon(THEME_ICON[choice])}${escapeHtml(ctx.t(THEME_LABEL_KEY[choice]))}</button>`;
  }).join('');

  return section(
    'settings_theme',
    ctx,
    `<div class="abr-chip-row sp-settings__chips" role="radiogroup"
          aria-label="${escapeHtml(ctx.t('settings_theme'))}">${chips}</div>`,
  );
}

function storageSection(model: SettingsModel, ctx: RenderContext): string {
  const count = ctx.tPlural('artifact_count', model.totalCount, ctx.formatCount(model.totalCount));
  // Same rule as everywhere: real disk usage, or a placeholder. Never bytes.
  const size =
    model.totalBytes === null ? ctx.t('size_unavailable') : ctx.formatBytes(model.totalBytes);
  const empty = model.totalCount === 0;

  return section(
    'settings_storage',
    ctx,
    `<p class="abr-body">${escapeHtml(ctx.t('stats_summary', [count, size]))}</p>
     <div class="sp-settings__actions">
       <button class="abr-btn abr-btn--secondary abr-btn--sm" type="button" data-action="view-all">
         ${escapeHtml(ctx.t('action_view_all'))}
       </button>
       <button
         class="abr-btn abr-btn--secondary abr-btn--sm"
         type="button"
         data-action="export-backup"
         ${empty ? 'disabled' : ''}
       >${icon('download')}${escapeHtml(ctx.t('action_export_backup'))}</button>
     </div>`,
  );
}

function privacySection(ctx: RenderContext): string {
  return section('settings_privacy', ctx, `<p class="abr-body">${escapeHtml(ctx.t('privacy_note'))}</p>`);
}

/**
 * External link. These navigate; nothing here is ever fetched.
 * `rel="noopener noreferrer"` on every one, and the accessible name says the
 * link opens a new tab so it is not a surprise for screen-reader users.
 */
function externalLink(href: string, labelKey: string, glyph: IconName, ctx: RenderContext): string {
  const label = ctx.t(labelKey);
  return `
    <a
      class="sp-link"
      href="${escapeHtml(href)}"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="${escapeHtml(`${label} — ${ctx.t('link_opens_new_tab')}`)}"
    >${icon(glyph)}${escapeHtml(label)}${icon('external')}</a>`;
}

declare const __BUILD_TIMESTAMP__: string;

function aboutSection(model: SettingsModel, ctx: RenderContext): string {
  const buildInfo = typeof __BUILD_TIMESTAMP__ !== 'undefined' ? `Built: ${__BUILD_TIMESTAMP__}` : '';
  return section(
    'settings_about',
    ctx,
    `<p class="abr-caption">${escapeHtml(ctx.t('about_version', [model.version]))} &bull; ${escapeHtml(buildInfo)}</p>
     <p class="abr-body">${escapeHtml(ctx.t('about_open_source'))}</p>
     <div class="sp-settings__links">
       ${externalLink(PLACEHOLDER_LINKS.support, 'about_support', 'heart', ctx)}
       ${externalLink(PLACEHOLDER_LINKS.repository, 'about_repository', 'external', ctx)}
       ${externalLink(PLACEHOLDER_LINKS.changelog, 'about_changelog', 'refresh', ctx)}
     </div>`,
  );
}

/* -------------------------------------------------------------------------
   View
   ------------------------------------------------------------------------- */

function loadingBody(): string {
  return `
    <div class="sp-settings__group" aria-hidden="true">
      <div class="abr-skeleton" style="inline-size:40%;block-size:13px"></div>
      <div class="abr-skeleton" style="block-size:36px"></div>
      <div class="abr-skeleton" style="inline-size:60%"></div>
      <div class="abr-skeleton" style="block-size:36px"></div>
    </div>`;
}

export function renderSettingsBody(model: SettingsModel, ctx: RenderContext): string {
  if (model.status === 'loading') return loadingBody();

  if (model.status === 'error') {
    return notice({
      titleKey: 'settings_error_title',
      bodyKey: 'error_body',
      ctx,
      action: { key: 'action_retry', name: 'retry-settings' },
      tone: 'error',
    });
  }

  return `
    <h2 class="abr-heading">${escapeHtml(ctx.t('settings_title'))}</h2>
    ${languageSection(model, ctx)}
    ${themeSection(model, ctx)}
    ${storageSection(model, ctx)}
    ${privacySection(ctx)}
    ${aboutSection(model, ctx)}`;
}

/** Whole settings view — first paint and the state-matrix preview. */
export function renderSettings(model: SettingsModel, ctx: RenderContext): string {
  return `
    <header class="abr-toolbar sp-detail__bar">
      <button
        class="abr-icon-btn"
        type="button"
        data-action="back"
        aria-label="${escapeHtml(ctx.t('action_back'))}"
      >${icon('chevronBack')}</button>
      <span class="abr-toolbar__spacer"></span>
    </header>
    <main
      class="sp-body sp-settings"
      id="sp-settings"
      aria-label="${escapeHtml(ctx.t('settings_label'))}"
      aria-busy="${model.status === 'loading'}"
    >${renderSettingsBody(model, ctx)}</main>`;
}
