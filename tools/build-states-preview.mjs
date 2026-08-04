/**
 * Generates sidepanel-states.html — every state of the Side Panel Gallery,
 * rendered from the SAME templates.ts the extension uses and the SAME
 * /_locales message files that ship in the build.
 *
 * Nothing here re-declares markup or copy, so the preview cannot drift from
 * the screen. Regenerate with:  node tools/build-states-preview.mjs
 *
 * Requires Node 22.6+ (native TypeScript type stripping).
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { renderPanel } from '../src/ui/sidepanel/templates.ts';
import { POPUP_LIMIT, renderPopup } from '../src/ui/popup/templates.ts';
import { renderDetail } from '../src/ui/sidepanel/detail.ts';
import { renderSettings } from '../src/ui/sidepanel/settings.ts';
import {
  ARTIFACT_FIXTURES,
  ARTIFACT_FIXTURES_AR,
  FIXTURE_USED_BYTES,
  fixtureStorageBytes,
} from '../tests/fixtures/artifacts.ts';
import { ARTIFACT_TYPES } from '../src/types/index.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/* --- locale plumbing ------------------------------------------------------ */

async function loadMessages(locale) {
  const raw = await readFile(path.join(root, '_locales', locale, 'messages.json'), 'utf8');
  return Object.fromEntries(
    Object.entries(JSON.parse(raw)).map(([key, entry]) => [key, entry.message]),
  );
}

function makeContext(locale, table) {
  const subst = (message, subs) =>
    subs.length === 0
      ? message
      : message.replace(/\$(\d+)/g, (whole, i) => subs[Number(i) - 1] ?? whole);

  const t = (key, subs = []) => (table[key] === undefined ? key : subst(table[key], subs));

  const plurals = new Intl.PluralRules(locale);
  const dateFmt = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const countFmt = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });

  return {
    t,
    tPlural: (base, count, formatted) => {
      const category = plurals.select(count);
      const specific = t(`${base}_${category}`, [formatted]);
      return specific === `${base}_${category}` ? t(`${base}_other`, [formatted]) : specific;
    },
    formatDate: (ms) => dateFmt.format(new Date(ms)),
    formatCount: (n) => countFmt.format(n),
    formatBytes: (bytes) => {
      const steps = [
        [1024, 'byte', 1],
        [1024 * 1024, 'kilobyte', 1024],
        [Infinity, 'megabyte', 1024 * 1024],
      ];
      const [, unit, divisor] = steps.find(([limit]) => bytes < limit);
      return new Intl.NumberFormat(locale, {
        style: 'unit',
        unit,
        unitDisplay: 'short',
        maximumFractionDigits: unit === 'byte' ? 0 : 1,
      }).format(bytes / divisor);
    },
  };
}

/* --- model builder -------------------------------------------------------- */

function model(overrides = {}) {
  const all = overrides.all ?? ARTIFACT_FIXTURES;
  const counts = { all: all.length };
  for (const type of ARTIFACT_TYPES) {
    counts[type] = all.filter((a) => a.type === type).length;
  }
  // Per-card sizes emulate getBytesInUse() exactly as the extension reads it,
  // so the header total is the sum of the figures on the cards below it.
  const sizes = new Map(all.map((a) => [a.id, fixtureStorageBytes(a)]));
  return {
    status: 'ready',
    visible: all,
    totalCount: all.length,
    totalBytes: all.length === 0 ? 0 : FIXTURE_USED_BYTES,
    sizes,
    counts,
    activeFilter: 'all',
    query: '',
    batchMode: false,
    selected: new Set(),
    ...overrides,
  };
}

/* --- the state matrix ----------------------------------------------------- */

const STATES = [
  { id: 'populated', label: 'Populated', model: () => model() },
  {
    id: 'loading',
    label: 'Loading',
    model: () => model({ status: 'loading', visible: [], totalCount: 0, totalBytes: 0 }),
  },
  {
    id: 'empty',
    label: 'Empty',
    model: () => model({ all: [], visible: [], totalCount: 0, totalBytes: 0 }),
  },
  {
    id: 'error',
    label: 'Error',
    model: () => model({ status: 'error', visible: [], totalCount: 0, totalBytes: 0 }),
  },
  {
    id: 'batch',
    label: 'Batch selection active',
    model: () =>
      model({
        batchMode: true,
        selected: new Set([ARTIFACT_FIXTURES[0].id, ARTIFACT_FIXTURES[2].id]),
      }),
  },
  {
    id: 'search',
    label: 'Search + filter, no matches',
    model: () => model({ query: 'kubernetes', activeFilter: 'svg', visible: [] }),
  },
];

/* --- popup model ---------------------------------------------------------- */

function popupModel(overrides = {}) {
  const all = overrides.all ?? ARTIFACT_FIXTURES;
  return {
    status: 'ready',
    visible: all.slice(0, POPUP_LIMIT),
    totalCount: all.length,
    sizes: new Map(all.map((a) => [a.id, fixtureStorageBytes(a)])),
    query: '',
    ...overrides,
  };
}

const POPUP_STATES = [
  { id: 'pop-populated', label: 'Popup — populated (last 5)', model: () => popupModel() },
  {
    id: 'pop-loading',
    label: 'Popup — loading',
    model: () => popupModel({ status: 'loading', visible: [] }),
  },
  {
    id: 'pop-empty',
    label: 'Popup — empty',
    model: () => popupModel({ all: [], visible: [], totalCount: 0 }),
  },
  {
    id: 'pop-error',
    label: 'Popup — error',
    model: () => popupModel({ status: 'error', visible: [] }),
  },
  {
    id: 'pop-search',
    label: 'Popup — search, no matches',
    model: () => popupModel({ query: 'kubernetes', visible: [] }),
  },
];

/* --- detail model --------------------------------------------------------- */

function detailModel(overrides = {}) {
  const artifact = overrides.artifact ?? ARTIFACT_FIXTURES[0];
  return {
    status: 'ready',
    artifact,
    sizeBytes: artifact ? fixtureStorageBytes(artifact) : null,
    confirmingDelete: false,
    ...overrides,
  };
}

// One fixture per preview branch: React → source, SVG → sandboxed render.
const REACT_FIXTURE = ARTIFACT_FIXTURES.find((a) => a.type === 'react');
const SVG_FIXTURE = ARTIFACT_FIXTURES.find((a) => a.type === 'svg');

const DETAIL_STATES = [
  {
    id: 'det-source',
    label: 'Detail — source view (React)',
    model: () => detailModel({ artifact: REACT_FIXTURE }),
  },
  {
    id: 'det-preview',
    label: 'Detail — sandboxed render (SVG)',
    model: () => detailModel({ artifact: SVG_FIXTURE }),
  },
  {
    id: 'det-confirm',
    label: 'Detail — delete confirmation armed',
    model: () => detailModel({ artifact: REACT_FIXTURE, confirmingDelete: true }),
  },
  {
    id: 'det-pinned',
    label: 'Detail — pinned, size unmeasurable',
    model: () =>
      detailModel({ artifact: { ...REACT_FIXTURE, pinned: true }, sizeBytes: null }),
  },
  {
    id: 'det-loading',
    label: 'Detail — loading',
    model: () => detailModel({ status: 'loading', artifact: null, sizeBytes: null }),
  },
  {
    id: 'det-missing',
    label: 'Detail — artifact no longer exists',
    model: () => detailModel({ status: 'missing', artifact: null, sizeBytes: null }),
  },
  {
    id: 'det-error',
    label: 'Detail — error',
    model: () => detailModel({ status: 'error', artifact: null, sizeBytes: null }),
  },
];

/* --- settings model ------------------------------------------------------- */

function settingsModel(overrides = {}) {
  return {
    status: 'ready',
    settings: { locale: 'system', theme: 'system' },
    totalCount: ARTIFACT_FIXTURES.length,
    totalBytes: FIXTURE_USED_BYTES,
    version: '0.1.0',
    ...overrides,
  };
}

const SETTINGS_STATES = [
  { id: 'set-ready', label: 'Settings — defaults (system language + theme)', model: () => settingsModel() },
  {
    id: 'set-explicit',
    label: 'Settings — explicit language + dark theme selected',
    model: () => settingsModel({ settings: { locale: 'fr', theme: 'dark' } }),
  },
  {
    id: 'set-empty',
    label: 'Settings — empty vault (export disabled)',
    model: () => settingsModel({ totalCount: 0, totalBytes: 0 }),
  },
  {
    id: 'set-nosize',
    label: 'Settings — storage size unmeasurable',
    model: () => settingsModel({ totalBytes: null }),
  },
  { id: 'set-loading', label: 'Settings — loading', model: () => settingsModel({ status: 'loading' }) },
  { id: 'set-error', label: 'Settings — error', model: () => settingsModel({ status: 'error' }) },
];

const LOCALES = ['en', 'ar', 'fr', 'es', 'pt'];
const DIR_OF = { ar: 'rtl' };

function column(locale, theme) {
  const dir = DIR_OF[locale] ?? 'ltr';
  return {
    theme,
    dir,
    locale,
    label: `${theme} · ${dir} (${locale})`,
  };
}

/**
 * Two sections. The theme/direction axis is exercised across every state in
 * en + ar; the remaining three locales are swept across the text-heavy states,
 * where long Romance-language labels are most likely to break the layout.
 */
const SECTIONS = [
  {
    title: 'Side panel — state matrix (theme × direction)',
    surface: 'sidepanel',
    stateIds: ['populated', 'loading', 'empty', 'error', 'batch', 'search'],
    columns: [column('en', 'light'), column('en', 'dark'), column('ar', 'light'), column('ar', 'dark')],
  },
  {
    title: 'Artifact detail — state matrix (theme × direction)',
    surface: 'detail',
    stateIds: ['det-source', 'det-preview', 'det-confirm', 'det-pinned', 'det-loading', 'det-missing', 'det-error'],
    columns: [column('en', 'light'), column('en', 'dark'), column('ar', 'light'), column('ar', 'dark')],
  },
  {
    title: 'Artifact detail — locale sweep (fr · es · pt)',
    surface: 'detail',
    stateIds: ['det-source', 'det-confirm', 'det-missing'],
    columns: [
      column('fr', 'light'),
      column('fr', 'dark'),
      column('es', 'light'),
      column('es', 'dark'),
      column('pt', 'light'),
      column('pt', 'dark'),
    ],
  },
  {
    title: 'Settings / About — state matrix (theme × direction)',
    surface: 'settings',
    stateIds: ['set-ready', 'set-explicit', 'set-empty', 'set-nosize', 'set-loading', 'set-error'],
    columns: [column('en', 'light'), column('en', 'dark'), column('ar', 'light'), column('ar', 'dark')],
  },
  {
    title: 'Settings / About — locale sweep (fr · es · pt)',
    surface: 'settings',
    stateIds: ['set-ready', 'set-empty'],
    columns: [
      column('fr', 'light'),
      column('fr', 'dark'),
      column('es', 'light'),
      column('es', 'dark'),
      column('pt', 'light'),
      column('pt', 'dark'),
    ],
  },
  {
    title: 'Popup — state matrix (theme × direction)',
    surface: 'popup',
    stateIds: ['pop-populated', 'pop-loading', 'pop-empty', 'pop-error', 'pop-search'],
    columns: [column('en', 'light'), column('en', 'dark'), column('ar', 'light'), column('ar', 'dark')],
  },
  {
    title: 'Popup — locale sweep (fr · es · pt)',
    surface: 'popup',
    stateIds: ['pop-populated', 'pop-empty'],
    columns: [
      column('fr', 'light'),
      column('fr', 'dark'),
      column('es', 'light'),
      column('es', 'dark'),
      column('pt', 'light'),
      column('pt', 'dark'),
    ],
  },
  {
    title: 'Side panel — locale sweep (fr · es · pt)',
    surface: 'sidepanel',
    stateIds: ['populated', 'batch', 'empty', 'error'],
    columns: [
      column('fr', 'light'),
      column('fr', 'dark'),
      column('es', 'light'),
      column('es', 'dark'),
      column('pt', 'light'),
      column('pt', 'dark'),
    ],
  },
];

/* --- page ----------------------------------------------------------------- */

const PAGE_CSS = `
  body { background:#12110F; padding:24px; font-family:var(--font-sans); }
  .matrix { display:flex; flex-direction:column; gap:32px; max-width:1720px; margin:0 auto; }
  .state-row { }
  .state-name {
    font:600 12px/1 var(--font-sans); letter-spacing:.08em; text-transform:uppercase;
    color:#B6B0A3; margin:0 0 12px 2px;
  }
  .cols { display:flex; gap:16px; flex-wrap:wrap; align-items:flex-start; }
  .col-label { font:500 10px/1 var(--font-mono); color:#7C776D; margin:0 0 6px 2px; }
  .frame--sidepanel { inline-size:380px; }
  .frame--popup     { inline-size:360px; block-size:auto; max-block-size:600px; }
  .frame--detail    { inline-size:380px; }
  .frame--settings  { inline-size:380px; }
  .frame {
    inline-size:380px; block-size:620px; overflow:auto;
    border:1px solid #3A3630; border-radius:10px;
    background:var(--color-bg); color:var(--color-text);
  }
  .frame::-webkit-scrollbar { width:8px; }
  .frame::-webkit-scrollbar-thumb { background:#3A3630; border-radius:4px; }
  .page-title { font:600 16px/1.4 var(--font-sans); color:#F3F1EC; text-align:center; margin:0 0 4px; }
  .section-title { font:600 13px/1.4 var(--font-sans); color:#F3F1EC; margin:8px 0 4px; padding-block-end:8px; border-block-end:1px solid #3A3630; }
  .page-sub { font:400 12px/1.5 var(--font-sans); color:#7C776D; text-align:center; margin:0 0 28px; }
`;

async function build() {
  const contexts = {};
  for (const locale of LOCALES) {
    contexts[locale] = makeContext(locale, await loadMessages(locale));
  }

  let frameCount = 0;
  const frames = [];

  const sections = SECTIONS.map((section) => {
    const rows = section.stateIds
      .map((stateId) => {
        const pool =
          section.surface === 'popup'
            ? POPUP_STATES
            : section.surface === 'detail'
              ? DETAIL_STATES
              : section.surface === 'settings'
                ? SETTINGS_STATES
                : STATES;
        const state = pool.find((candidate) => candidate.id === stateId);
        if (!state) throw new Error(`Unknown state id: ${stateId}`);

        const cols = section.columns
          .map((col) => {
            frameCount += 1;
            const ctx = contexts[col.locale];
            const base = state.model();
            // Arabic columns get Arabic artifact titles so mirroring and
            // bidi isolation are exercised against real RTL content.
            const arFixtures =
              section.surface === 'popup'
                ? ARTIFACT_FIXTURES_AR.slice(0, POPUP_LIMIT)
                : ARTIFACT_FIXTURES_AR;
            if (section.surface === 'settings') {
              return `
                <div>
                  <p class="col-label">${col.label}</p>
                  <div class="frame frame--settings" data-theme="${col.theme}" dir="${col.dir}" lang="${col.locale}">
                    <div class="sp-shell"><div class="sp-view">${renderSettings(base, ctx)}</div></div>
                  </div>
                </div>`;
            }
            if (section.surface === 'detail') {
              frames.push(col);
              const arArtifact =
                base.artifact &&
                ARTIFACT_FIXTURES_AR.find((a) => a.id === base.artifact.id);
              const model =
                col.locale === 'ar' && arArtifact
                  ? { ...base, artifact: { ...arArtifact, pinned: base.artifact.pinned } }
                  : base;
              return `
                <div>
                  <p class="col-label">${col.label}</p>
                  <div class="frame frame--detail" data-theme="${col.theme}" dir="${col.dir}" lang="${col.locale}">
                    <div class="sp-shell"><div class="sp-view">${renderDetail(model, ctx)}</div></div>
                  </div>
                </div>`;
            }
            const localised =
              col.locale === 'ar' && base.totalCount > 0
                ? {
                    ...base,
                    visible: base.visible.length > 0 ? arFixtures : [],
                    all: ARTIFACT_FIXTURES_AR,
                    // Arabic titles serialise to a different byte length, so
                    // the sizes are recomputed rather than reused.
                    sizes: new Map(
                      ARTIFACT_FIXTURES_AR.map((a) => [a.id, fixtureStorageBytes(a)]),
                    ),
                    totalBytes: ARTIFACT_FIXTURES_AR.reduce(
                      (total, a) => total + fixtureStorageBytes(a),
                      0,
                    ),
                  }
                : base;
            return `
              <div>
                <p class="col-label">${col.label}</p>
                <div class="frame frame--${section.surface}" data-theme="${col.theme}" dir="${col.dir}" lang="${col.locale}">
                  ${
                    section.surface === 'popup'
                      ? `<div class="pop-shell">${renderPopup(localised, ctx)}</div>`
                      : `<div class="sp-shell">${renderPanel(localised, ctx)}</div>`
                  }
                </div>
              </div>`;
          })
          .join('');

        return `
          <section class="state-row" id="state-${state.id}">
            <p class="state-name">${state.label}</p>
            <div class="cols">${cols}</div>
          </section>`;
      })
      .join('');

    return `<h2 class="section-title">${section.title}</h2>${rows}`;
  }).join('');

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Abrium — Side Panel Gallery states</title>
<link rel="stylesheet" href="src/ui/styles/tokens.css">
<link rel="stylesheet" href="src/ui/styles/base.css">
<link rel="stylesheet" href="src/ui/styles/components.css">
<link rel="stylesheet" href="src/ui/sidepanel/sidepanel.css">
<link rel="stylesheet" href="src/ui/popup/popup.css">
<style>${PAGE_CSS}</style>
</head>
<body>
<p class="page-title">Side Panel Gallery — state matrix</p>
<p class="page-sub">
  GENERATED FILE — do not edit. Rendered from src/ui/sidepanel/templates.ts and /_locales
  by tools/build-states-preview.mjs. Frames are 380px, the true side-panel width.
</p>
<div class="matrix">${sections}</div>
</body>
</html>
`;

  const out = path.join(root, 'sidepanel-states.html');
  await writeFile(out, html, 'utf8');
  console.log(`wrote ${path.relative(root, out)} — ${frameCount} frames`);
}

await build();
