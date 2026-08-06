# Abrium

## Platform & Stack
Platform: Chrome Extension (Manifest V3) — Chrome only, no Edge/Firefox submission planned
Language: TypeScript 5.x
Bundler: Vite + @crxjs/vite-plugin
Package manager: pnpm
Storage: chrome.storage.local only — NO external API, NO backend, NO network calls
Zip: JSZip (bundled locally, not CDN-loaded — MV3 CSP requires local bundling)

## Project Structure
/src
  /content        → content script: DOM detection + extraction logic
  /background     → service worker: message routing, install/update hooks
                    dev-seed.ts (dev fixture seeding, statically imported,
                    swapped for dev-seed.prod.ts — a no-op — on
                    production builds via vite.config.ts, so fixtures
                    can never ship to users)
  /ui
    /popup        → quick-access popup (recent artifacts, search bar)
    /sidepanel    → full gallery view (chrome.sidePanel)
  /lib
    /storage.ts   → typed wrapper around chrome.storage.local
    /extract.ts   → DOM parsing helpers, selector constants (isolated for
                    easy updates when claude.ai's DOM changes)
    /download.ts  → single + batch (zip) export logic
  /types          → shared TypeScript interfaces (Artifact, ArtifactType)
manifest.json     → MV3 manifest, host_permissions scoped to claude.ai only
LICENSE           → MIT License, Copyright (c) 2026 Omar Elbaz

## Conventions
- Strict TypeScript, no `any`
- All DOM selectors centralized in /lib/extract.ts — never inline queries
  elsewhere, so a claude.ai redesign means editing ONE file
- Every storage write goes through /lib/storage.ts — no raw chrome.storage
  calls scattered in components
- No external network requests anywhere in the codebase — enforce via a
  simple CI grep check for `fetch(` outside of local file/blob URLs
- Canonical component class names (components.css) — check here before
  inventing a new one: .abr-field--search (not .abr-search), .abr-card,
  .abr-chip, .abr-toolbar, .abr-toolbar--stack (multi-row header),
  .abr-actionbar (sticky bottom bar), .abr-notice (empty/error/no-match
  block), .abr-card__open (full-card activation overlay, position:relative
  on .abr-card)
- Icons: always call `icon()` from ui/icons.ts — never inline a raw `<svg>`
  in a screen/controller file, even for a "quick" checkmark or close glyph.
  Single source of truth for every icon glyph, no exceptions.

## Design System
Warm neutral base with a terracotta accent — editorial/calm feel, NOT a
generic SaaS blue-purple gradient look.

STATUS: Implemented and contrast-verified in Prompt 0 (155 text/bg pairs
tested against rendered CSS, 0 WCAG AA failures, tightest margin 4.51:1).
Files: src/ui/styles/tokens.css, base.css, components.css,
design-system.html (reference sheet, links the real stylesheets).

Light mode:
Background:        #EFECE4
Background alt:    #F7EAE4
Surface/cards:      #FAF9F6
Border:            #DDD8CD
Border subtle:     #E7E3DA
Accent (borders/icons/rules, non-text, 3.86:1): #BE5C3E
Accent solid (button fills, 5.07:1 on white text): #B0523A
Accent text (accent-colored text, 4.26:1+): #9C4829
Text primary:      #262420
Text secondary:    #4A463F
Text muted (glyphs/rules ONLY, 3.11:1 — do not use for readable text): #8A857A
Text-3 (placeholders/counts/timestamps, readable-text safe): #6F6A60

Dark mode:
Background:        #1B1A18
Surface/cards:     #232220
Border:            #3A3630
Accent:            #E9CDC1 (11.6:1 / 10.1:1 both directions — no
                    derivation needed, unlike light mode)
Text primary:      #F3F1EC
Text secondary:    #B6B0A3
Text muted:        #7C776D
Text-3:            #8E887C

Rule: `--color-text-muted` is for glyphs and rules only, never for text
a user reads (placeholders, counts, timestamps) — those use `--color-
text-3`. This distinction exists because the original muted token
measured below WCAG AA against the beige background; don't collapse
the two tokens back into one.

Typography:
Font stack: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif
Monospace (code previews): ui-monospace, Menlo, monospace
Base size: 14-15px (extension UI is compact — side panel ~380px, popup ~330px)

Border radius:   6-8px (soft, not bubbly)
Shadow style:    soft, minimal — avoid heavy drop shadows
Motion speed:    150-200ms transitions

Components implemented: button (primary/secondary/ghost/danger, each
with default/hover/active/disabled/focus-visible), icon button
(default/hover/active/focus-visible/pressed/disabled), search/input
field (default/focus+filled/error/disabled), filter chip (active/
inactive/hover/disabled), card (default/selected batch-mode/loading
skeleton), badge/count, surfaces reference block. Theme tokens are
scopable to any subtree, not just :root — needed for side-by-side
preview and will be needed again for the in-app theme picker.

RTL: verified geometrically (icon mirror via matrix transform on
directional icons only — download/pin/trash stay unmirrored), not just
visually. Code previews stay LTR inside Arabic layout. Same CSS drives
both directions, no separate RTL stylesheet.

Layout personality: calm utility tool, editorial warmth — never feels
like a "dashboard" or "SaaS product"; feels like a natural extension of
claude.ai's own interface.

## Internationalization — NON-NEGOTIABLE, v1.0 scope
Languages at launch: English (en), Arabic (ar), French (fr), Spanish (es),
Portuguese (pt). NO language is a "later" add-on — all 5 ship in v1.0.

- Use chrome.i18n (MV3 native i18n API) — NOT a hand-rolled string swap.
  /_locales/en/messages.json, /_locales/ar/messages.json, /_locales/fr/,
  /_locales/es/, /_locales/pt/ — each a complete, real translation, never
  a copy-pasted English fallback left untranslated.
- Arabic = full RTL layout, not mirrored text only. `dir="rtl"` on the
  root element when locale is ar; icons/arrows that imply direction
  (chevrons, back buttons) must flip; text alignment flips; the side
  panel's flex/grid direction must be logically reversed (use CSS
  logical properties — margin-inline-start, not margin-left — so RTL
  isn't a separate hacked stylesheet).
- Locale detection: chrome.i18n.getUILanguage() on first run, with a
  manual override in extension settings (don't force-lock to browser
  locale).
- No hardcoded UI strings anywhere in components — every user-facing
  string goes through the i18n message lookup, enforced by a CI grep
  check for raw quoted strings inside JSX/template text.
- Date/number formatting via Intl.DateTimeFormat / Intl.NumberFormat
  with the active locale — never manually formatted dates.

## Code Quality — NON-NEGOTIABLE
"No remixing" = single source of truth for every piece of logic. Never
duplicate the same function, selector, or formatting logic in more than
one file — if two places need it, it becomes one shared function in
/lib and both call it. Copy-pasted-with-small-tweaks code is treated as
a bug, not a shortcut.

"No bugs" = before any code is considered done:
- Every new function has at least one test covering its main path and
  one edge case (empty input, missing DOM element, storage full)
- Every async operation (storage read/write, DOM query after page load)
  has explicit error handling — no silent failures, no unhandled
  promise rejections
- Every UI state (loading / empty / error / populated) is manually
  verified before marking a screen complete
- Run through the MANDATORY SELF-AUDIT checklist (dates, icons,
  responsive, design patterns) before delivering any UI work
- Verify OUTCOMES, not the absence of exceptions. "No error was thrown"
  is not proof an operation succeeded — a write that silently drops
  data, or an async call that resolves without doing its job, produces
  a valid-looking-but-wrong state that's worse than a visible crash
  (this exact pattern caused both the Prompt 2.6 CSS bug and the
  Prompt 4.5 fixture-seeding bug). Where an operation's success matters,
  read back / measure the actual result and compare against what was
  expected, not just check that the call didn't throw.

## Rules — ALWAYS
- Read this file before writing any code
- host_permissions in manifest.json must stay scoped to https://claude.ai/*
  — never widen without explicit reason documented here
- manifest.json must request `unlimitedStorage` permission (removes the
  ~10MB chrome.storage.local ceiling — artifacts add up fast)
- Never send captured content anywhere except chrome.storage.local
- No payment flow, no license check, no accounts — the project is 100%
  free; a donation link is a plain external `<a href>`, never an
  in-extension flow
- Every UI screen: loading + empty + error state, in all 5 languages
- Every interactive element keyboard-accessible with visible focus state
  and an ARIA label if icon-only
- "Storage used" ALWAYS means `chrome.storage.local.getBytesInUse()` —
  real disk usage — everywhere it's displayed (header total AND any
  per-card figure). Never show `artifact.bytes` (declared content
  length) as a storage/size figure to the user; that number can diverge
  sharply from actual disk usage and would mislead the quota warning.
- (Website only) GA4 must never fire before explicit cookie consent —
  Accept/Reject banner, choice remembered, Reject truly blocks GA
- (Website only) every page ships self-referencing canonical +
  hreflang for all 5 languages + x-default; every schema.org block is
  validated with Google's Rich Results Test before launch
- Update ## Progress after each completed task
- Vault storage stays one chrome.storage.local key PER artifact
  (abrium.artifact.<id>) — never collapse back into a single array-under-
  one-key. Doing so silently re-breaks the storage figure rule above,
  since getBytesInUse() only measures per-key, not per-array-element.
- Any "size unavailable" case (header OR card) must render as an
  omitted/placeholder state ("—"), never a false "0 bytes" — a shown
  zero reads as "nothing is stored," which is worse than showing
  nothing. getUsedBytes() returning 0 on failure is a display bug, not
  acceptable fallback behavior.
- The Settings/About screen ALWAYS shows a build timestamp generated
  fresh at build time (not a static version string alone) — this
  exists specifically so a glance at the running extension confirms
  whether it's the latest build, eliminating repeated manual "did you
  reload the extension" verification cycles during testing.
- Captured content is HOSTILE INPUT, always. HTML/SVG previews render
  ONLY inside all four containment layers together: sandbox="" (zero
  tokens — no allow-scripts, no allow-same-origin, nothing), a csp
  attribute, a matching <meta> CSP as the document's first node, and
  referrerpolicy="no-referrer". Code/Markdown/React previews are
  monospace source ONLY — never live-rendered, never executed. A
  future prompt must never add allow-scripts or any sandbox token "for
  a live preview" — that would silently undo verified XSS containment.
  Any change touching the preview sandbox must be re-verified
  adversarially (onerror, <script>, SVG <script>, attribute breakout,
  remote beacon, nested iframe, remote @import) before shipping.

## Data — NON-NEGOTIABLE
Real Claude artifact examples for testing (code blocks, SVG, Markdown docs,
React components) — not lorem ipsum. Test against actual claude.ai DOM,
captured via saved HTML fixtures so tests don't depend on a live session.

## Non-Goals for v1.0 (write these down so scope doesn't creep)
- No cloud sync / accounts
- No AI-powered search or summarization (would require an API — out of scope)
- No editing of artifact content inside the extension

## Build & load workflow
```
pnpm install
pnpm dev     # → dist-dev/   crxjs dev bundle; REQUIRES the Vite server running,
             #               seeds the fixture vault → panel shows 6 artifacts
pnpm build   # → dist/       tsc --noEmit && vite build && verify-dist,
             #               self-contained, no fixtures → empty state
pnpm typecheck
pnpm verify:dist         # asserts dist/ is safe to Load unpacked (runs in build)
pnpm serve:dist          # serves dist/ at :4180 — loads the BUILT panel
pnpm check:no-network    # CI guard: no fetch/XHR/WebSocket in src/ or dist/
pnpm preview:states      # regenerate sidepanel-states.html
```

**dist/ and dist-dev/ are separate on purpose — do not merge them.**
They shared dist/ once, and it shipped a real bug: crxjs's dev bundle
replaces the side panel's index.html with a `CRXJS DEV MODE` stub that
carries NO stylesheet link and defers everything to localhost:5173.
Loading that unpacked renders the panel with zero CSS, and whichever
command ran last silently decided what Chrome picked up. Load `dist/`
to test the real thing; load `dist-dev/` only with `pnpm dev` running.

### Verifying UI work — the three tools are NOT interchangeable
- `preview:states` → renders templates to a standalone file. Catches
  contrast/layout/a11y/i18n. Never touches the bundler.
- `dev-harness.html` → runs the real controller against source modules
  through Vite, behind a chrome.* shim. Catches interaction and storage
  behaviour. Never touches dist/. NEVER make a color/contrast claim
  from this tool — Vite's dev server serves /src/**/*.css as a
  JavaScript module for HMR, so a <link rel=stylesheet> pointed at it
  gets JS and the browser silently refuses to parse it. The harness
  rendered correct STRUCTURE with zero actual CSS applied for multiple
  prompts before this was caught (Prompt 5) — it hid because structure
  looked right. Fixed as of Prompt 5 (159 rules now load), but treat
  this tool as interaction/behavior evidence only, never visual evidence.
- `serve:dist` + `verify:dist` → the ONLY checks that exercise
  manifest → vite build → the bundle Chrome loads. Anything about CSS
  linking, asset paths, or the manifest is only real here.
A CSS regression once passed the first two and shipped. If a change
could affect what lands in dist/, it is not verified until the third
one has run.

`tools/dev-harness.html` runs the side panel outside Chrome behind a
chrome.* shim. It reads the shell markup out of the real index.html via
Vite's `?raw`, so it never duplicates markup — dev only, never bundled.

## Progress
- [x] Prompt 0 — Design system. tokens.css / base.css / components.css +
      design-system.html. 155 text-bg pairs, 0 WCAG AA failures.
- [x] Prompt 1 — Side Panel Gallery. src/ui/sidepanel/ + lib/{i18n,format,
      storage,download}.ts, ui/icons.ts, types/, all 5 _locales.
      48 preview frames: 1190 contrast pairs / 0 failures, 0 clipped
      controls, 0 a11y structure issues across 562 buttons.
- [x] Prompt 2 — Real loadable extension. package.json, vite.config.ts,
      manifest.json (MV3), tsconfig.json, background service worker,
      content-script stub, icons 16/32/48/128 from the logo, network
      guard. JSZip wired: ZIP round-trips byte-identical, mtimes
      preserved, filename collisions get -2/-3 suffixes, empty selection
      throws rather than emitting an empty archive.
      NOT verified: chrome://extensions → Load unpacked (needs a native
      file picker that cannot be automated). Everything up to and
      including the built bundle is verified.
- [x] Prompt 2.5 — LICENSE, storage-figure architecture fix (per-artifact
      storage keys), inline SVG cleanup: all DONE and re-verified.
- [x] Prompt 2.6 — 🔴 BLOCKING CSS bug FIXED. Root cause: `pnpm dev` and
      `pnpm build` both wrote to dist/, and crxjs's dev bundle replaces
      the side panel index.html with a `CRXJS DEV MODE` stub containing
      no stylesheet link at all. Load unpacked picked up whichever ran
      last. The production build was never broken — all four suspected
      causes were checked and disproved (link present, path correct,
      side_panel path correct, no CSP override).
      Fixes: dev now outputs to dist-dev/ so dist/ cannot be clobbered;
      `tools/verify-dist.mjs` gates every build (30 checks) and fails
      loudly on a dev stub, a missing/empty stylesheet, a stylesheet
      that lost the design tokens, or any localhost reference;
      `tools/serve-dist.mjs` serves dist/ so the BUILT panel can be
      opened; `crossorigin` is stripped from emitted tags (precaution —
      CORS mode is pointless for an extension's own assets).
      Also: header "size unavailable" now renders `—` via the new
      `size_unavailable` message key instead of a false "0 bytes";
      getUsedBytes() returns null for unmeasurable and 0 only for a
      genuinely empty vault.
      Verified: built dist/ served over HTTP loads 136 CSS rules,
      --color-accent resolves, body is #EFECE4, the search icon is
      16x16 (unstyled it renders 300x150 — the reported symptom);
      simulating the dev stub makes verify:dist exit 1; `pnpm dev` now
      leaves dist/ byte-identical.
      STILL OPEN: the actual chrome://extensions → Load Unpacked click
      cannot be automated — Omar must do this manually against dist/
      and confirm before Popup work begins.
      CONFIRMED (manual, by Omar): Load Unpacked against dist/ in real
      Chrome — full design system renders correctly (warm beige bg,
      terracotta chips, styled search field, correct empty-state copy).
      `pnpm build` output clean, verify-dist: 30/30 checks passed. This
      bug is fully closed, no remaining doubt.
- [x] Prompt 3 — Popup. New src/ui/shared/templates.ts (searchField,
      artifactCard, notice, skeletonCards) — both popup and side panel
      render from these, no duplicated card markup. Popup shows last 5
      artifacts, "View full Vault" opens the side panel and closes
      itself. openPanelOnActionClick set to false (a declared
      default_popup already wins the toolbar click; leaving it true
      contradicted the worker). verify-dist expanded from 30→48 checks
      after finding it only ever checked side_panel.default_path (the
      popup page shipped unverified) and that its per-file token check
      broke under Vite's CSS code-splitting — both fixed, now checks
      every manifest-declared HTML surface with tokens verified
      collectively across a page's stylesheets.
      Verified: 80 preview frames (32 popup), 1476 contrast pairs/0
      failures, RTL geometry (chevron mirrors, download doesn't), real
      controller behavior in harness (6 fixtures → 5 cards, search
      hides "Recent" heading, sidePanel.open() then popup closes).
      STILL OPEN: real toolbar-icon click in Chrome not yet done by
      Omar — see manual re-check steps.
      CONFIRMED (manual, by Omar): toolbar icon click on claude.ai
      opens the popup correctly — styled, 360px, "View full Vault"
      button, correct empty state. Closed.
- [x] Prompt 4 — Artifact Detail. sidepanel/detail.ts (new) — view
      switching within the side panel (gallery/detail as two .sp-view
      containers, one [hidden] at a time), listens for the documented
      abrium:open-artifact event. Metadata, hardened claude.ai
      conversation link (constant host, rejects javascript:/path-
      traversal), HTML/SVG sandboxed preview under four containment
      layers, code/markdown/react always monospace source, pin/delete/
      download actions. Delete requires confirm (focus on Cancel, not
      the destructive button), Escape disarms. Missing-artifact edge
      case (deleted between listing and open) shows a clear notice, no
      crash. verify-dist unchanged at 48 checks, correctly — no new
      manifest surface, this lives inside the existing side panel.
      Verified: 126 preview frames, 1776 contrast pairs/0 failures, RTL
      geometry (back chevron + external-link icon mirror, pin/trash
      don't), adversarial XSS testing (onerror, <script>, SVG script,
      attribute breakout, remote beacon, nested iframe, remote @import
      — all blocked, 0 scripts executed, 0 network requests to hostile
      origin), real interaction flow driven end to end.
      STILL OPEN: manual re-check in real Chrome not yet done by Omar
      for the DETAIL view specifically (open a card, delete flow, back
      button) — general vault loading with real data is now confirmed
      via the fixture-seeding fix; the detail-view interaction steps
      from the earlier manual checklist still need to be walked
      through and confirmed.
      CONFIRMED (manual, by Omar): detail view renders metadata + code
      source + "Open in Claude" link correctly; delete confirmation bar
      shown before removal ("Delete this artifact? This cannot be
      undone", Cancel/Delete); post-delete gallery correctly updates
      (6 → 5 artifacts, filter counts match); no-matches state also
      confirmed working live against a real, different claude.ai
      conversation. Fully closed.
- [x] Prompt 5 — Settings/About. New third .sp-view (sidepanel/settings.ts),
      wired to abrium:open-settings. lib/settings.ts (schema, defaults,
      validation, applyTheme/applyLocale), lib/locales.ts (bundled
      message tables — chrome.i18n can't switch locale at runtime and
      fetch isn't permitted, so locales are statically bundled; grew
      the build 110→140 kB gzip 35→44 kB, worth revisiting if size
      becomes a concern). Settings persist under `abrium.settings.v1`,
      deliberately outside the `abrium.artifact.` prefix so they never
      pollute the storage figure or get swept by writeArtifacts().
      Content: language selector (5 languages, live re-render, no
      reload), theme toggle (light/dark/system, provably repaints
      against real tokens), Patreon support link, Export backup (JSON),
      storage summary, privacy note, version + changelog link, MIT/
      GitHub repo link.
      ⚠️ THREE PLACEHOLDER URLS — dead links until replaced:
      - Support: https://patreon.com/abrium (page not created)
      - Repository: https://github.com/abrium/abrium (repo not created)
      - Changelog: https://abrium.onl/changelog (page not built)
      All grouped in one PLACEHOLDER_LINKS block with TODO(real-url)
      markers, echoed in the network-guard allowlist.
      verify-dist: 49 checks (unchanged — no new manifest surface).
      Verified: 162 preview frames, 2310 contrast pairs/0 failures, RTL
      geometry, live language switch (Arabic flips dir="rtl" with no
      reload), theme repaint against real tokens, valid JSON export
      (6 artifacts, no settings leaked). Found and fixed a keyboard bug
      introduced in this same prompt (focus jumped to Back after any
      settings change — now returns to the same control).
      🔴 Found dev-harness.html has NEVER applied real CSS (see
      "Verifying UI work" above) — fixed this prompt; does not
      invalidate prior color/contrast claims (those came from
      preview:states/serve:dist), but the harness was weaker
      interaction evidence than it appeared for Prompts 1-4.
      CONFIRMED (manual, by Omar): Settings screen fully verified —
      Language/Appearance/Storage/Privacy/About sections all render
      correctly (6 artifacts · 2.1 kB), Export backup produces a valid
      dated JSON file. Fully closed.
- [~] Prompt 6 — Content-script capture. lib/extract.ts (all selectors,
      pure/testable), content/capture.ts (MutationObserver + initial
      sweep + SPA nav watch + dedup), background/capture-intake.ts
      (validation + persistence, split out for testability).
      Flow: content script → capture:artifacts message → worker
      validates → writes via lib/storage.ts → reads back → replies
      with actual count written. Confirmed zero chrome.storage
      references in the content script — single writer, single
      validation point.
      Revision policy (documented): stable claude.ai artifact id if one
      exists → update in place. No stable id → hash(conversation+title+
      type+content) → idempotent on re-read, a real revision becomes a
      separate entry (never silently overwrites/destroys an earlier
      version) — matches the no-version-history non-goal.
      HONEST SPLIT — machinery vs. selector values:
      - VERIFIED (50 checks, real browser DOM): extraction machinery,
        storage round-trip (write→read back→compare), dedup, malformed-
        input rejection (7 shapes incl. path-traversal id), pin surviving
        re-capture, skip-reason diagnostics.
      - REAL DOM DATA NOW AVAILABLE (from Omar, live claude.ai):
        artifactContainer → `div[aria-label*="rtifact"]` MATCHES (2
        found) — this candidate is confirmed correct.
        title → no dedicated testid; generic `h1, h2, h3` matched (5) —
        needs narrowing to the one inside the artifact container.
        source → 🔴 ALL candidates return 0. claude.ai does NOT use
        `<pre>`/`<code>` for the code view at all (0 <pre> blocks found
        on a page with a visibly syntax-highlighted code panel open).
        This is almost certainly a code-editor component (CodeMirror-
        or Monaco-style: syntax-highlighted via nested <div>/<span>
        with editor-specific classes, not semantic <pre>). The full
        list of 18 real data-testid values on the page contains NO
        artifact/code-specific one (action-bar-copy, file-thumbnail,
        chat-input, model-selector-dropdown, etc. — all page-chrome,
        not artifact-internal).
        Confirms the live diagnostic message design worked exactly as
        intended: "Found 2 artifact container(s) but extracted none —
        selectors may be stale" fired correctly, distinguishing
        container-found/source-failed from a total miss.
      - STILL NOT VERIFIED: source extraction selector — needs a
        follow-up diagnostic targeting the DOM *inside* the 2 confirmed
        `div[aria-label*="rtifact"]` containers to find the real
        code-editor structure (likely something like `.cm-content`,
        `.cm-line`, `[contenteditable]`, `.view-line`, or similar
        editor-library class names — must be discovered empirically,
        not guessed).
      Container/title now LOCKED IN: `div[aria-label*="rtifact"]` is
      first candidate (confirmed), other 4 kept as forward-compatible
      fallbacks. Title queries were already scoped to the container
      root (queryFirst), `[role="heading"]` added above generic h1/h2/h3
      to prefer the semantic match.
      Source deliberately left marked 🔴 KNOWN BROKEN rather than
      guessed — zero `<pre>` elements confirmed on a page with a
      visible code panel open; loud-failure diagnostic path (console
      warning) is untouched and is what produced this correct diagnosis.
      tools/inspect-claude-dom-v2.js built: Part 1 fingerprints known
      editor libraries (CodeMirror 5/6, Monaco, Prism/hljs, Shiki, Ace)
      + full class inventory + plain-text fallback detection. Part 2
      intercepts claude.ai's own Copy button (wraps clipboard write/
      execCommand/copy event, passes through so copy still works) and
      finds the deepest DOM element whose text matches what was
      copied — the tightest possible real selector, established
      empirically from claude.ai's own code. Also detects virtualized
      editors (copied text longer than any DOM element's textContent →
      DOM scraping impossible, needs a different capture strategy
      entirely — reported explicitly, not failed vaguely).
      Smoke-tested against the synthetic fixture before shipping; found
      and fixed a tie-break bug during that test (was picking the outer
      wrapper over the innermost matching element).
      STILL OPEN: Omar needs to run v2 + click claude.ai's real Copy
      button and report the result.
      🎉 SOURCE SELECTOR FOUND (real DOM, EXACT MATCH, not virtualized):
      claude.ai renders code as `<code class="language-{lang}">`
      directly — NO `<pre>` wrapper at all, which is why every prior
      candidate failed. Confirmed via clipboard-observation: copied
      text (39,050 chars, 769 lines) EXACTLY matches one DOM element's
      textContent — proves the full source lives in the DOM (not
      virtualized), so DOM scraping is viable.
      Real DOM path: div.contents > div.ease-out.duration-200 >
      div.w-full.h-full > div.w-full.h-full > div.code-block__code.!my-0
      > code.language-tsx
      Two usable selectors identified:
      - `.language-{lang}` — works but varies per language (language-
        tsx, language-python, etc.) — would need a generic
        `[class*="language-"]` form to be language-agnostic
      - `.code-block__code code` or `[class*="code-block__code"]` —
        BEM-style semantic class, likely the more STABLE anchor since
        it doesn't vary by language; prefer this as the primary
        candidate with `code[class*="language-"]` as a fallback/
        secondary confirmation once inside it.
      NEXT: feed this into extract.ts's source candidate list (keep
      existing candidates as fallbacks per Conventions — never delete
      working fallback logic), rebuild, and get Omar to do the full
      4-artifact real-world capture test from the original Prompt 6.
      🎉 CONFIRMED WORKING (real-world test, by Omar): React artifact
      captured perfectly — correct title, type "react", exact size
      (42.4 kB), full source. The `.code-block__code` selector works.
      🔴 NEW GAP FOUND: a Markdown artifact (README.md, "Readme
      template" panel, Code view open) produced ZERO console output
      from Abrium — not even the loud "Found container but extracted
      none" diagnostic. This means container detection itself never
      fired for this artifact type, not just source extraction. Two
      leading hypotheses, neither confirmed:
      (a) `div[aria-label*="rtifact"]` doesn't match Markdown/Document
      artifacts — the aria-label wording may differ per artifact type
      (b) the MutationObserver/content script never ran on this page
      at all (possible timing/SPA-nav issue, since this was a fresh
      "New chat" session, different navigation path than the React
      artifact test)
      Needs a targeted diagnostic on this exact Markdown artifact page
      to distinguish (a) from (b) before guessing a fix.
      CONFIRMED (a): `document.querySelectorAll('div[aria-label*="rtifact"]').length`
      returned 0 on the Markdown/Document artifact page. The container
      selector that works for React does NOT match Markdown/Document
      artifacts at all — different DOM structure per artifact type is
      now the working assumption, not a content-script timing issue.
      Needs a fresh container-discovery diagnostic run on this specific
      Markdown page to find its real container selector.
      NOTE: from this point, Omar switched the coding tool from Fable
      to Google Antigravity (VS Code fork, agent-first IDE) due to
      Fable credit limits. The project's state lives entirely in this
      CLAUDE.md + the actual repo files, not in any tool's session
      memory, so the switch is safe as long as the new tool reads this
      file first — confirmed working: Antigravity read CLAUDE.md and
      correctly summarized project state + the one open gap before
      touching any code.
      tools/inspect-claude-dom-v3.js built (by Antigravity, following
      v1/v2's established pattern): broad aria-label/data-testid/class-
      inventory discovery (no assumed selector, since the React
      container doesn't apply here) + the same clipboard-observation
      technique that resolved React's source selector, now walking 10
      ancestor levels to help pinpoint the Markdown container. Same
      safety properties as v1/v2 (structure only, no network calls,
      120-char truncated previews). Correctly asked Omar to run it
      himself rather than using Antigravity's built-in browser on
      Omar's personal claude.ai session — same privacy boundary Fable
      established, held by the new tool too.
      STILL OPEN: Omar needs to run v3 on the Markdown artifact page
      and report Part 1 + Part 2 output.
      Part 1 confirmed: no aria-label containing "artifact" matches any
      real container for Markdown (only chat-list buttons matched) —
      React's container selector definitely does not generalize.
      Part 2 attempted twice: first attempt captured stale clipboard
      content from an unrelated window (Omar had a music-project window
      open — user error, corrected). Second attempt, with the correct
      README page active and __abriumWatchCopy() running: clicking
      claude.ai's real Copy button produced NO new observation at all —
      the watcher logged "watching" but never fired on click.
      LEADING HYPOTHESIS: this Copy button may use
      `navigator.clipboard.write()` (ClipboardItem array, preserves
      rich/formatted content) rather than `.writeText()` (plain string)
      — v3 only patches writeText/execCommand/copy-event, not `.write()`.
      Needs v3.1: patch `navigator.clipboard.write()` too, extracting
      text from any `text/plain` ClipboardItem type in the array.
      🎉 CONFIRMED: v3.1's clipboard.write() patch worked — captured
      the real README content (516 chars, 46 lines, preview "# Project
      Name One-line description..." — matches the visible Code view
      exactly, literal markdown syntax preserved).
      🔴 BUT: "NO element contains the copied text. The editor is
      likely virtualised." — the normalized-textContent match found
      nothing in the DOM for this content, despite it being small
      (516 chars) and visibly on-screen without scrolling, which makes
      genuine virtualization LESS likely than a text-matching artifact
      (hidden/decorative characters, line-number gutter text mixed into
      textContent, or similar normalization mismatch) — needs a direct
      DOM dump of the visible Code-view panel to compare against the
      copied text and determine the real cause before concluding DOM
      scraping is impossible for this artifact type.
      v3.2 (structural, no text-matching) result: container-finding
      heuristic failed — fell back to a generic `<div class="">
      aria-label="null">` (no meaningful anchor found within 12
      ancestor levels of the Copy button). Found 2 candidate elements
      but the diagnostic's own size filter (100-5000 chars) excluded
      both without reporting their actual sizes — a real limitation in
      the diagnostic tool itself, not necessarily the underlying DOM.
      Needs v3.3: report ALL candidates with their real sizes
      (unfiltered), and widen or remove the 100-5000 char window so
      genuinely small (<100) or unexpectedly large (>5000) candidates
      are visible rather than silently dropped.
      v3.3 result: container-finding STILL failed for all 5 anchors
      (none had an aria-label with artifact/document/readme/markdown
      within 15 ancestor levels), so it fell back to scanning the
      entire document.body. All top 15 candidates by size turned out
      to be irrelevant page furniture (the chat-history sidebar, nav)
      — none were the actual ~516-char README panel content. Pure
      size-based candidate ranking across the whole page doesn't work;
      the search needs to be constrained by something else.
      Needs v3.4: use getBoundingClientRect() to filter candidates to
      elements physically positioned within the visible right-side
      artifact panel (e.g. x-position > innerWidth/2), combined with a
      size window close to the known content length (~516 chars) —
      position + rough size together should isolate the real container
      even without a usable aria-label or class anchor.
      🎉🎉 SOLVED — v3.4's direct content search + position filter
      found the real structure completely:
      - Container: `[data-skill-file-viewer="true"]` — a semantic
        attribute specific to the document/file-viewer component,
        confirming Markdown/Document artifacts use an ENTIRELY
        different rendering mechanism than React's code editor (this
        explains every earlier miss — it was never the same component).
      - Filename source (bonus find): `data-prose-review-dockey`
        contains the literal file path, e.g.
        `file:|::/mnt/user-data/outputs/readme-template.md` — parse
        this directly for the filename, no title-heuristic needed for
        this artifact type.
      - Content root: `#wiggle-file-content` (stable ID, strongest
        possible selector).
      - Line structure: each line is a `.group\/line` div containing a
        `[data-line-number]` span (gutter, SKIP this) followed by the
        actual line content in a `code.font-mono` element with
        Prism-style `token-keyword`/`token-text` spans. Extraction must
        be line-by-line (iterate `.group\/line`, take only the code
        portion, join with `\n`), not a single flat textContent grab.
      - ROOT CAUSE of the earlier "likely virtualised" false alarm:
        NOT virtualization. The DOM's textContent has line numbers
        interleaved between every line (from the gutter spans), which
        never appear in the plain-text clipboard copy — this broke the
        substring match, not missing content. Also: blank lines render
        as a lone `[NBSP:U+00A0]` character — normalize/strip this
        during extraction.
      NEXT: wire this into extract.ts as a Document/Markdown-specific
      extraction path (container, filename, and line-by-line source
      assembly), separate from the React code-editor path. Both should
      coexist as different strategies keyed by detected artifact type,
      not a single universal selector list.
      🎉🎉🎉 CONFIRMED END-TO-END (real Chrome, by Omar): Markdown
      capture works fully. Console: "[abrium] Captured 1 artifact(s)".
      Panel shows correct card: title/filename "readme-template.md"
      (real filename from data-prose-review-dockey), type badge
      "MARKDOWN", size 834 bytes (non-zero), filter counts updated
      correctly. Two benign "found container but extracted none"
      messages appeared first (mid-render transition before content
      settled) followed by success — expected resilient retry
      behavior, not a bug. Markdown/Document extraction is CLOSED.
      🎉🎉🎉 ALL 5 ARTIFACT TYPES NOW CONFIRMED (real Chrome, by Omar):
      Code, HTML, SVG, React, and Markdown all captured correctly in
      one session — 4 artifacts visible together (Code 1008 B, HTML
      1.3 kB, SVG 729 B, Markdown 834 B), React confirmed earlier
      (42.4 kB). Original Prompt 6 goal (replace dev fixtures with real
      claude.ai capture, all types) is functionally COMPLETE.
      DESIGN DECISION (not a bug): capture only works when an artifact
      panel is open in CODE view, not Preview — this is architecturally
      required, since source only exists in the DOM in Code view (zero-
      API constraint means no other way to read it). This was initially
      confusing UX (silent miss when a user has Preview open), so a
      UX hint is being added: Prompt 6.5 — when the loud-failure path
      fires with a signal suggesting Preview mode, show a dismissible
      .abr-notice hint ("Switch to Code view to save this artifact")
      in the gallery via the existing message-passing architecture, i18n'd
      across all 5 languages. No new permissions, no polling — reuses
      the existing MutationObserver signal. If Preview-mode truly can't
      be distinguished from a stale selector, a generic "couldn't read
      this artifact, try Code view" fallback wording is acceptable.
      STILL OPEN: Prompt 6.5 hint not yet implemented/verified.
      🎉 Prompt 6.5 IMPLEMENTED: content/capture.ts sends
      `capture:preview_hint` when `skipped['no-source'] > 0` — chosen
      because this exact skip-reason is what historically appeared for
      Preview-mode misses (matches the original React Preview-mode test
      early in this project: "no-source: 2, empty-content: 0"),
      distinguishing it from empty-content/container-detached which
      mean something else. No new polling/permissions, reuses the
      existing MutationObserver signal.
      sidepanel.ts tracks `previewHintActive`/`previewHintDismissed`
      state; templates.ts reuses the existing `.abr-notice` component
      (no new component invented) with a dismiss button using the
      existing close glyph. New i18n keys (preview_hint_title,
      preview_hint_body, action_dismiss) added to all 5 locales.
      `pnpm build` passes, verify-dist 51 checks pass.
      STILL OPEN: manual verification by Omar — open an artifact in
      Preview mode, confirm the hint appears; switch to Code view,
      confirm it captures and the hint clears; confirm dismiss works
      and doesn't reappear/nag.
      🔴 BUG FOUND (manual, by Omar): hint appears correctly in Preview
      mode, but does NOT clear after switching to Code view and a
      successful capture — confirmed via screenshot showing raw SVG
      source visible in Code view (capture should succeed) while
      "Couldn't read this artifact / Switch to Code view..." hint is
      still shown. `previewHintActive` state is likely never reset on
      a subsequent successful capture message — needs a fix so a
      successful `capture:artifacts` (or equivalent success signal)
      clears `previewHintActive`, not just explicit Dismiss.
      ✅ FIXED (not yet manually re-verified): sidepanel.ts now clears
      `previewHintActive` inside the existing `onArtifactsChanged`
      listener (fires whenever artifacts are successfully persisted),
      so switching Preview→Code and a successful capture clears the
      hint automatically, no Dismiss needed. STILL OPEN: Omar to
      manually confirm this sequence works.
      CONFIRMED (manual, by Omar): hint shown in Preview mode,
      auto-cleared after switching to Code and successful capture — no
      Dismiss needed. Fully closed.
      🔴 NEW BUG FOUND (manual, by Omar): the hint reappears when
      switching an ALREADY-successfully-captured artifact back to
      Preview mode, even though it's already safely saved in the vault
      (confirmed: "Untitled artifact HTML" visible in the gallery,
      1.3 kB, from an earlier successful capture). The hint text
      ("Couldn't read this artifact") is misleading in this case — it
      implies nothing was saved, when in fact a prior capture succeeded
      and persists untouched. Root cause: the preview_hint mechanism
      reacts to each MutationObserver scan independently, with no
      awareness of "this content was already captured successfully
      before." Needs a fix: don't show the hint if a matching artifact
      (same id/hash) already exists in storage — Preview mode on an
      already-saved artifact should be a no-op, not a false alarm.
      Also confirmed (real Chrome, by Omar, newly logged here):
      Code/HTML/SVG artifacts show title "Untitled artifact" instead
      of the real name shown in claude.ai's own UI (e.g. "Simple
      graphic", "Simple page") — title extraction works for React
      (scoped heading) and Markdown (dockey filename) but not this
      artifact family yet.
      IN PROGRESS: correctly declined to guess a selector blind — built
      tools/inspect-claude-dom-v4.js to gather real DOM evidence first
      (nearby text elements + Download button context), following the
      same evidence-first pattern as every prior selector fix in this
      project. STILL OPEN: Omar needs to run v4 on a real Code/HTML/SVG
      artifact page and report the output before extractTitle can be
      fixed correctly.
      🎉 SOLVED (v4 report, real DOM, HTML artifact "simple_page.html"):
      the Preview-rendering `<iframe>` inside the artifact container
      carries a `title` attribute with the REAL filename — found
      `[title="simple_page.html"] on <iframe>`. No complex DOM walking
      needed: query `iframe[title]` within the artifact container and
      use its title attribute directly as the filename for Code/HTML/
      SVG artifacts. Same simplicity class as Markdown's dockey
      attribute — another case of a semantic HTML attribute doing the
      job better than guessing at headings/aria-labels.
      NEXT: wire `iframe[title]` into extract.ts's title logic for the
      Code/HTML/SVG family, alongside the existing React (scoped
      heading) and Markdown (dockey) paths.
      🎉 IMPLEMENTED (both fixes):
      - Hint suppression: capture.ts now checks lib/storage.ts (by
        stableId or exact title match for the current conversation)
        before firing capture:preview_hint — suppressed if a match
        already exists.
      - iframe[title] wired into extract.ts: queries iframe[title]
        within the container, explicitly excludes the literal value
        "preview" (avoids using a generic placeholder as a filename),
        uses it as filename/title fallback for Code/HTML/SVG. New
        synthetic fixture case 11 added, extract-test.html updated.
      pnpm build + verify-dist passed.
      STILL OPEN: (1) sanity-check whether extract-test.html still has
      a stale "10 containers" expectation alongside the new "11" one
      (same diff-artifact confusion as happened once before — likely a
      false alarm but unconfirmed this round); (2) Omar's manual
      re-check of both fixes in real Chrome.
      🔴 RE-TESTED with a genuinely fresh capture (vault confirmed
      empty first, then a new SVG artifact captured — 729 B, real,
      not stale data): BOTH fixes still fail for SVG specifically.
      - Bug 2: new SVG capture still shows "Untitled artifact", not a
        real filename — the iframe[title] fix (found on an HTML
        artifact) may not generalize to SVG. SVG's Preview rendering
        might not use the same iframe[title] mechanism at all (could
        be <img>, <object>, or inline SVG instead) — same pattern as
        React vs. Markdown needing separate DOM investigations per
        type. Needs SVG-specific real DOM evidence, not an assumption
        that HTML's fix covers it.
      - Bug 1: hint reappeared in Preview mode for this SVG despite it
        being genuinely already-captured (729 B visible in the gallery
        at the time). Storage-lookup suppression logic may not be
        matching correctly for this case — needs investigation into
        why the match failed (id/hash mismatch? title-based fallback
        matching against "Untitled artifact" title, which isn't
        unique/reliable?).
      UNCONFIRMED: whether Omar's Chrome was running the latest rebuilt
      dist/ at the time of this test (extension reload not explicitly
      verified) — must rule this out before concluding the code fixes
      themselves are wrong.
      PROCESS DECISION: the "did you reload the extension" verification
      loop has now recurred enough times to cause real friction (Omar's
      feedback). Fix at the root: add a visible BUILD TIMESTAMP to the
      Settings/About screen (replacing/alongside the static "Version
      0.1.0"), generated fresh at build time (e.g. via vite.config.ts
      injecting Date.now() or a build-time env var), so staleness is
      visually obvious at a glance — no more manual reload-and-confirm
      cycles before trusting a bug report. This is now a required task,
      not optional polish.
      ✅ Build timestamp IMPLEMENTED: `__BUILD_TIMESTAMP__` injected via
      vite.config.ts, displayed in settings.ts next to the version
      number, changes every `pnpm build`. STILL OPEN: Omar to confirm
      it renders and updates.
      🎯 ROOT-CAUSE UNIFICATION (analysis, not yet fixed): Bug 1 (hint
      doesn't suppress for SVG) is DOWNSTREAM of Bug 2 (SVG title
      extraction). capture.ts's suppression logic falls back to title-
      matching when no stableId exists (SVG has no stableId), and
      deliberately excludes "Untitled artifact" as a match candidate
      (correct safety behavior — prevents falsely suppressing hints
      across different anonymous artifacts). So fixing SVG's title
      extraction should resolve Bug 1 automatically, no separate fix
      needed for it. Confirmed the HTML iframe[title] fix doesn't apply
      to SVG (SVG likely renders Preview differently — <img>, <object>,
      or inline <svg>, not an iframe). Built tools/inspect-claude-dom-
      v5.js (evidence-first, same pattern as every prior investigation)
      to find SVG's real title location.
      v5 result: found nothing useful — only 7 tiny decorative UI icon
      <svg> elements (16×16, aria-hidden="true", copy/download button
      glyphs), not the real content SVG or any title-bearing element.
      v5's "media/preview elements" search strategy was too narrow.
      NEW DIRECTION (not yet tested): check whether the Download button
      is an `<a download="filename.ext">` element — standard HTML, not
      claude.ai-specific — which could serve as ONE universal title/
      filename source across Code, HTML, and SVG artifacts at once,
      instead of a separate investigation per type.
      v6 result: DEAD END. Tested on both SVG and HTML artifacts —
      "0 total anchor <a> tags in container" both times. Download
      buttons in claude.ai are NOT <a> elements (likely <button> with
      JS-driven blob download logic) — this hypothesis does not apply.
      🔴 NEW LEAD (screenshot, by Omar): chrome://extensions shows an
      "Errors" button lit up (red) on the Abrium extension card itself
      — meaning real runtime errors are being logged for Abrium that
      haven't been examined yet. This could short-circuit the whole
      title-selector hunt if it reveals something concrete. STILL OPEN:
      Omar to click "Errors" and report the content before continuing
      further diagnostic scripts.
      Errors panel checked: REASSURING, not a new bug. It's just
      Chrome capturing the intentional `console.error` loud-failure
      diagnostic ("Found N artifact container(s) but extracted none —
      selectors may be stale") — this is the designed-in behavior from
      Prompt 6, not a crash. Minified bundle snippet also confirms both
      container strategies (data-skill-file-viewer + aria-label) are
      correctly present in the compiled build.
      NEXT LEAD (not yet tested): every artifact panel visibly shows a
      truncated title in its own header bar (seen throughout testing:
      "Simple graph...", "Readme template..."). No diagnostic has yet
      inspected THAT header element directly — all prior probes (v4,
      v5, v6) searched inside the artifact's content container, not
      the panel's own title-bar chrome. Worth one more targeted check
      before deprioritizing this to a known v1.1 limitation — Code/
      HTML/SVG capture correctly (content/type/size all accurate),
      only the title cosmetic is affected, so this does not block
      shipping if it proves stubborn.
      🎉🎉🎉 SOLVED (v7, real DOM, SVG artifact "Simple graphic"): the
      real title lives in an `<h2>` element inside the panel's header
      bar — a sibling of the container's 2nd-level ancestor, structure:
      `div.flex.items-center.justify-between.px-2.py-2.bg-bg-000.gap-2`
      containing `<h2>Simple graphic</h2>` plus a type-badge `<span>`
      ("SVG") and the Copy button. This header bar is shared UI chrome
      across the artifact family (not content-specific), so this
      selector likely generalizes across Code/HTML/SVG uniformly —
      one shared fix, not per-type hacks. This also resolves Bug 1
      (hint suppression) automatically once wired in, since that bug
      was downstream of the missing title.
      NEXT: wire an `h2` lookup (scoped to the panel header, via the
      documented ancestor/sibling path) into extract.ts's title logic
      for Code/HTML/SVG, alongside the existing React and Markdown
      paths. Add a matching synthetic fixture case, same pattern as
      every prior fix.
      🎉🎉🎉 IMPLEMENTED: extract.ts now walks up to 4 ancestor levels
      from the container looking for `div.flex.items-center.justify-
      between h2` and uses its text as the title (4th strategy,
      alongside React/Markdown/aria-label-fallback paths). Fixture case
      12 added mirroring the exact real structure. pnpm build +
      verify-dist passed. As predicted, this should also resolve Bug 1
      (hint suppression) as a side effect once titles are real.
      STILL OPEN: Omar's manual re-check — (1) SVG title shows real
      name + hint doesn't reappear in Preview; (2) verify generalization
      to at least one other type (Code or HTML).
      🎉🎉🎉 CONFIRMED (manual, by Omar): all three previously-affected
      types now show REAL titles — "Simple script · PY" (Code, 1,011 B),
      "Simple graphic · SVG" (734 B), "Simple page · HTML" (1.3 kB).
      The header-bar h2 fix generalizes across the full artifact
      family as hypothesized. Title extraction gap is CLOSED for all
      types (React, Markdown, Code, HTML, SVG).
      PARTIALLY CONFIRMED: Bug 1 hint suppression behaved correctly in
      the observed sequence (hint showed only for a genuinely
      not-yet-captured HTML artifact in Preview, cleared once captured)
      — but the specific "switch an ALREADY-captured artifact (e.g. the
      now-real-titled SVG) back to Preview" sequence wasn't explicitly
      re-shown this round. High confidence it's resolved given the
      root-cause chain (title fix → storage match works), but worth one
      quick explicit confirmation if convenient — not blocking.
      CLOSED WITH HIGH CONFIDENCE: additional sequence confirmed correct
      behavior at every step (SVG in Preview pre-capture → hint shown
      correctly since not yet saved; switched to Code → captured with
      real title "Simple graphic", 734 B; hint cleared). The exact
      already-captured→Preview toggle wasn't re-shown explicitly, but
      given the fully-verified root-cause chain (hint suppression keys
      on title match, title is now always real), this is accepted as
      resolved without further screenshot cycles — diminishing returns
      on this specific edge case after extensive verification already.

## ✅ PROMPT 6 (Content-script capture) — FULLY CLOSED
All 5 artifact types (React, Markdown, Code, HTML, SVG) capture
correctly end-to-end in real Chrome: correct container detection,
correct source extraction, correct real titles, correct sizes, dedup
working, revision handling working, Preview-mode hint working
correctly (including suppression for already-captured artifacts).
Extraction test suite grew from an initial handful to 55+ checks
across this investigation. Build timestamp now visible in Settings for
future staleness checks. Remaining work per the original spec is
launch-polish only (privacy page, Chrome Web Store listing copy,
LICENSE/GitHub repo going public, Patreon page creation, marketing
website) — not core product functionality.

## Prompt 7 — Launch Polish (in progress)
- [x] Prompt 7.0 — LICENSE/repo publish-readiness. LICENSE verified
      (MIT, Copyright (c) 2026 Omar Elbaz). .gitignore verified
      comprehensive (node_modules/, dist/, dist-dev/, .vite/,
      sidepanel-states.html, AND critically tests/fixtures/
      claude-page.real.html explicitly ignored — Omar's real captured
      conversation content will never be committed). Privacy/secrets
      scan clean: no hardcoded secrets, no leaked real conversation
      data anywhere, synthetic fixture confirmed dummy-only, diagnostic
      inspect-claude-dom-v*.js tools confirmed to hold no cached
      personal data (selector/traversal logic only). Repo structure:
      ~65 files (src/ 28, tools/ 17, tests/fixtures/ 2, plus
      _locales/, public/, root config).
      DECIDED (by Omar): keep inspect-claude-dom-v*.js diagnostic tools
      in the public main branch (safe, no personal data, documents the
      engineering process). Repo name: abrium-extension.
      Antigravity correctly did NOT create the GitHub repo itself —
      that remains Omar's action, requiring his account.
- [x] Prompt 7.1 — Privacy page content drafted (privacy-page-draft.md,
      repo root). All 5 languages, 7 required sections (summary, what's
      read, where stored, what's never done, retention/deletion,
      website-vs-extension GA4 distinction, contact). Content verified
      accurate against actual implementation (chrome.storage.local
      only, zero external API calls, claude.ai-scoped reading only).
      Ready to drop into a future website build.
- [x] Prompt 7.2 — Chrome Web Store listing copy. chrome-store-listing.md
      created: title "Abrium: Claude Artifacts Manager" (34/45 chars),
      short description (114/132 chars), detailed description with
      natural keyword weaving ("claude artifacts manager", "save
      claude ai code", "claude.ai export extension", "claude artifact
      download") + features + 5 languages + MIT/open-source mention,
      Category: Developer Tools recommended (consistent with the
      original spec's SEO research finding this category less
      saturated than Productivity), 5 screenshot captions drafted
      (gallery/popup/detail/settings/batch).

STILL TODO (per original spec):
- Actually making the GitHub repo public (Omar's action)
- Creating the real Patreon page (Omar's action — username/description)
- Running the actual Chrome Web Store submission ($5 one-time fee,
  Load Unpacked → package → submit) (Omar's action)

## Prompt 7.3 — abrium.onl marketing website (in progress)
Separate project/codebase from the extension. Requested: stack choice
(Next.js static export or Astro), full 10-page × 5-language sitemap
(/, /features, /faq, /download, /changelog, /privacy [content already
written in privacy-page-draft.md], /terms, /contact,
/cookie-preferences, /404), design tokens reused exactly from
src/ui/styles/tokens.css (warm beige/terracotta), mandatory GA4 +
Accept/Reject cookie consent (GA4 never fires before consent),
canonical + hreflang (5 languages + x-default) every page, schema.org
(SoftwareApplication home, FAQPage /faq, BreadcrumbList site-wide,
Organization once), /download links to Chrome Web Store (placeholder
URL, flagged — not published yet). Scoped to start with scaffold +
homepage + /privacy + design system wiring first, report back before
the remaining 8 pages.
STILL OPEN: awaiting Antigravity's response.
✅ Scaffold plan approved. Structure: /website subdirectory within the
existing abrium.onl repo (monorepo). Astro, output: 'static',
astro:i18n for 5 languages.
DECISIONS (by Omar, made directly rather than asked back):
- Locale URL structure: English at root (/), other 4 languages
  prefixed (/ar/, /fr/, /es/, /pt/), x-default → English.
- Styling: vanilla CSS reusing the exact tokens from
  src/ui/styles/tokens.css, NOT Tailwind — matches the extension
  codebase's existing philosophy (no framework, single source of truth
  for design tokens).
NEXT: Antigravity to proceed with scaffold + design system + homepage
+ /privacy using these decisions, then report back before the
remaining 8 pages (as originally scoped).
Prompt 7.4 issued (scaffold + tokens.css + Layout.astro w/ canonical/
hreflang/schema.org + CookieConsent component + homepage + /privacy).
STILL OPEN: awaiting Antigravity's response.
✅ BATCH 1 COMPLETE (verified): Astro 5.2.3 static site initialized in
/website. astro:i18n configured (en at root/x-default, ar/fr/es/pt
prefixed). @astrojs/sitemap integrated. tokens.css copied exactly;
global.css built in vanilla CSS matching the extension visually
(confirmed: #EFECE4 background, #B0523A terracotta buttons). Layout.astro
injects canonical + hreflang (5 languages + x-default) + site-wide
Organization/BreadcrumbList JSON-LD — confirmed present in <head> on
/fr/privacy. CookieConsent.astro built: GA4 consent defaults to denied
(gtag consent API), gtag.js script tag is NOT created until
localStorage 'cookie_consent' === 'accepted' — confirmed zero network
requests to googletagmanager.com before Accept is clicked. Homepage +
/privacy built and localized across all 5 languages; SoftwareApplication
schema confirmed homepage-only. `npm run build` passes, 10 static HTML
files generated in 1.91s.
NEXT: remaining 8 pages — /features, /faq, /download, /changelog,
/terms, /contact, /cookie-preferences, /404.
🎉🎉🎉 ALL 8 REMAINING PAGES COMPLETE: /features, /faq (with FAQPage
schema), /download (Chrome Web Store link clearly flagged as
placeholder), /changelog (ItemList schema, "v0.1.0 — Initial release"
placeholder entry), /terms, /contact (GitHub Issues + Patreon link,
Patreon flagged as placeholder), /cookie-preferences (real
Accept/Reject controls wired to the same localStorage consent key as
the Batch 1 banner, verified it actually updates stored consent),
/404. All localized across 5 languages. `npm run build` passes: 46
static pages generated, zero errors. Internal links, schema.org
injection, and cookie-preferences behavior all verified.

🔴 BUG FOUND (screenshot, /ar/ homepage, by Omar): the page BODY
content is correctly translated and RTL ("أبريوم لكلود" heading, etc.)
but shared LAYOUT chrome is NOT localized — the nav bar shows "Privacy"
and "Home" in English on the Arabic page, and the cookie consent
banner text ("We use optional cookies...") is also English, not
Arabic. This means Layout.astro's nav and the CookieConsent component
only got the per-page body content translated (via generate-pages.js's
per-page translation objects), not the shared chrome/component layer
built in Batch 1. Needs a fix: nav labels and CookieConsent banner
text must read from the active locale too, same as page content.
✅ FIXED: Layout.astro now has a centralized translation object for
nav labels (all 5 languages), reads Astro.currentLocale. A footer was
added to house the remaining nav links (Changelog, Terms, Contact,
Cookie Preferences) cleanly rather than crowding the header.
CookieConsent.astro's banner text + Accept/Reject buttons localized the
same way. Audited the rest of the site chrome: only remaining
untranslated text is 404's "Go Home" — intentionally left as-is per
the spec's note that 404 doesn't need full i18n treatment. npm run
build passes, 46 pages, zero errors.
STILL OPEN: Omar to visually confirm /ar/, /fr/, /es/ now show
correctly localized nav + cookie banner.
🎉🎉🎉 CONFIRMED (manual, by Omar, /ar/ screenshot): nav fully in
Arabic (الرئيسية، الميزات، الأسئلة الشائعة، تنزيل), footer links fully
in Arabic (سجل التغييرات، تفضيلات ملفات تعريف الارتباط، الشروط، اتصل
بنا، الخصوصية), cookie consent banner fully in Arabic with correct
button labels (قبول الكل / رفض الكل). RTL layout correct throughout.
Shared layout localization bug is CLOSED.

## ✅ PROMPT 7 (Launch Polish) — TRULY FULLY CLOSED
Extension core + full 10-page × 5-language website + privacy policy +
Chrome Web Store listing copy + LICENSE/repo hygiene, all built and
verified in real Chrome/browser. Nothing further is buildable by
Antigravity — remaining items are exclusively Omar's own actions:
make the GitHub repo public, create the real Patreon page, pay the $5
Chrome Web Store fee and submit, then swap the /download placeholder
link for the real store URL once approved.

## Prompt 8 — Website Visual Design Pass (Claude Design)
Omar requested a proper visual design pass for the website — the 10
pages built via Antigravity/generate-pages.js are functional (correct
content, correct i18n, correct SEO/schema) but visually minimal (plain
HTML strings, not real designed layouts). A Claude Design prompt was
given to design full page layouts for all 10 pages, reusing the exact
tokens.css design system (warm beige #EFECE4, terracotta #BE5C3E/
#B0523A/#9C4829) and matching the extension's editorial/calm identity,
with RTL Arabic layout support included.
STILL OPEN: awaiting Claude Design output.
✅ Claude Design output received (Claude_design_system.zip): "Abrium
Site.dc.html" — a full design reference file covering all 9 named
pages (Home, Features, FAQ, Download, Changelog, Privacy, Terms,
Contact, Cookie Preferences), confirmed using the exact project colors
(#EFECE4 background, #8A857A muted text match tokens.css exactly).
Also includes standalone extension mockup files from the original
Prompt 0 design work. Assets: abrium-lockup.png, abrium-mark.png logo
files, abrium.onl logo upload.
NEXT: Omar to place these files in the website repo (e.g.
/website/design-reference/) so Antigravity can inspect them directly
and reimplement the current plain-HTML pages as properly designed
Astro components matching this reference.
✅ Files placed, plan proposed and APPROVED: rebuild Home, Features,
Privacy first (one of each page "type" — hero/marketing, feature grid,
long-form prose). Assets (abrium-mark.png, abrium-lockup.png) move to
public/assets/. global.css gets the full token set from the reference.
Layout.astro header uses the logo mark instead of text wordmark,
footer/CookieConsent restyled to match. generate-pages.js updated for
the 3 page types' HTML, re-run across all 5 languages. All existing
logic preserved untouched (Astro.currentLocale routing, JSON-LD,
canonical/hreflang, GA4 consent, the Batch-2 nav/footer/cookie-banner
localization fix).
STILL OPEN: awaiting Antigravity's build + verification.
🔴 MAJOR REGRESSION FOUND (Omar, screenshot comparison, angry — rebuild
claimed "1-to-1 structural match" but is NOT): the live rebuilt
homepage is missing large amounts of content/structure present in the
actual design reference. Itemized gaps (reference has, live build
lacks):
1. Header: theme toggle (moon icon) and language switcher (globe +
   "EN" dropdown) entirely missing. Nav also missing "Changelog" link.
2. Hero eyebrow text wrong/generic ("LOCAL-FIRST CAPTURE" instead of
   the reference's "CHROME EXTENSION · V0.1.0").
3. Hero: only ONE CTA button (Add to Chrome) — reference has TWO
   (Add to Chrome + View on GitHub).
4. Hero: trust checkmark list ("✓ Free forever ✓ Open source ✓
   Local-only ✓ No tracking") completely missing.
5. Feature cards grid (4 cards: Auto-capture, Gallery & search, Batch
   export, Five languages/RTL — each with an icon) — ENTIRELY MISSING.
6. "How it works" 3-step numbered section — ENTIRELY MISSING.
7. Pre-footer CTA banner ("Free · Open source · Local-only · No
   tracking" + "Get Abrium" button) — MISSING.
8. Footer: reference has richer structure (Product column: Features/
   Download/Changelog/Design system; Legal column: Privacy/Terms/
   Contact/Cookie preferences; GitHub + Patreon icons in bottom bar).
   Live build has a thin, simplified footer missing most of this.
9. Cookie banner: reference has an icon + different message text
   ("Abrium uses one preference cookie for language and theme. No
   analytics, ever.") — this CONFLICTS with the project's actual
   decision (GA4 IS used on the website, per the earlier explicit
   choice of GA4 over Plausible/Fathom) — the reference's copy is
   WRONG/stale and must NOT be copied verbatim; the live build's GA4-
   accurate wording should be kept, just needs the icon + visual
   polish from the reference, not its inaccurate claim.
Root cause suspected: Antigravity's "rebuild-batch1.cjs" approach
extracted a simplified/paraphrased interpretation of the reference
rather than the actual full markup — needs a much more literal,
section-by-section port this time, verified against the reference
file directly, not summarized from memory of having viewed it.
✅ CORRECTED DESIGN FILE RECEIVED: "Abrium.html" (767 KB, single
comprehensive file) — confirmed contains all previously-missing
elements (theme toggle, "How it works", "View on GitHub", "Get
Abrium", "Design system" link, feature cards, all 9 pages referenced).
This REPLACES the earlier incomplete "Abrium Site.dc.html" reference —
it is not an addition, it is the correct/complete version. Omar wants
Antigravity to extract from THIS file specifically this time, with
explicit warning against the paraphrasing failure from the last round.
✅ STRUCTURAL INVENTORY APPROVED (Antigravity correctly extracted from
the real file this time — 7 sections identified matching every
checklist item: Header w/ language switcher + theme toggle, Hero w/ 2
CTAs + trust checklist, 4-card Feature Grid, 3-step How-it-works,
Pre-footer CTA banner, full Footer w/ Product/Legal columns, Cookie
Banner — correctly noted it will KEEP accurate GA4 wording instead of
the reference's wrong "No analytics, ever" text). Approved to proceed
with actual code extraction/generation for Home, Features, Privacy.
REINFORCED (Omar, explicit): the requirement is an EXACT 1:1 match to
Abrium.html — layout, colors, spacing, element order, all literally
copied — not "inspired by" or "structurally similar". This is the same
standard already given in Prompt 7.9, restated because of the prior
paraphrasing failure; make sure Antigravity treats "exact match" as
literal, not directional.
🔴 PARTIAL PROGRESS, STILL WRONG (screenshot comparison, by Omar):
structural sections now all present (theme toggle, language switcher,
2 CTAs, 4 feature cards, 3-step how-it-works, pre-footer CTA, full
footer) — that part is fixed. BUT the actual COPY TEXT is still
paraphrased, not extracted literally. Confirmed mismatches: trust
checklist wording differs, all 4 feature card names/icons differ
(built: "Automatic Capture/Visual Gallery/Batch Export/100% Private"
vs reference: "Auto-capture/Gallery & search/Batch export/Five
languages, real RTL"), how-it-works heading and all 3 step
titles/descriptions differ, pre-footer CTA text differs. Antigravity's
checklist confirmation ("YES" to all 10 items) checked for SECTION
PRESENCE only, not literal text accuracy — this is why it reported
success while the actual words don't match. Needs an explicit fix:
verify every string of visible text against the reference file
character-for-character, not just confirm each section exists.
## ✅ PROMPT 7 (Launch Polish) — FULLY CLOSED
Everything technically achievable is done: extension core (Prompt 6)
+ full marketing website (10 pages × 5 languages, GA4/consent
compliant, SEO-complete) + privacy policy + Chrome Web Store listing
copy + LICENSE/repo hygiene. Remaining items are exclusively Omar's
own actions (cannot be done by Antigravity):
- Make the GitHub repo public
- Create the real Patreon page (replace placeholder URLs in Settings,
  /contact, /download once live)
- Pay the $5 Chrome Web Store developer fee and submit for review
- Once approved, replace the /download placeholder link with the real
  Chrome Web Store URL
Prompt 7.4 issued: directs Antigravity to proceed with (1) Astro
scaffold in /website (static output, astro:i18n, @astrojs/sitemap),
(2) tokens.css copied exactly + base layout, (3) Layout.astro with
canonical/hreflang (5 languages + x-default) + site-wide
BreadcrumbList/Organization schema.org, (4) CookieConsent component
(Accept/Reject, localStorage, GA4 only after Accept), (5) homepage with
SoftwareApplication schema, (6) /privacy using privacy-page-draft.md
content across all 5 languages. Verification requested: npm run build
succeeds for all 5 languages, head tags checked, GA4 fires only after
Accept. Report back before the remaining 8 pages.
STILL OPEN: awaiting Antigravity's response.

### Known issues
- [x] Header settings icon confusion + bug.
      ICON: RESOLVED. Root cause confirmed — the icon named `settings`

      since Prompt 1 was geometrically a sun (small circle + 8 long
      radiating strokes), never a gear. Replaced with a real cog
      (ring r=4.7, hub r=1.75, short teeth), verified objectively via
      radial ink-density measurement (hub band 0.05→0.60, ring band
      0.36→0.75; whole-canvas diff from the sun icon 17.6%→31.6%, on
      par with its difference from the magnifying glass). No quick
      theme toggle exists in the header — sun/moon only appear inside
      Settings → Appearance, matching the original IA.
      SIDE EFFECT: NOT REPRODUCED. Instrumented testing shows the click
      does exactly one correct thing (fires abrium:open-settings once,
      zero storage writes, theme/lang/scroll all preserved). Leading
      hypothesis: the sun-icon confusion itself was likely the
      "disruption" Omar perceived, not a separate behavioral bug — the
      icon fix may resolve this on its own.
      CONFIRMED (manual, by Omar): gear icon now clearly visible in
      header; clicking it opens Settings cleanly with no disruption —
      the side-effect report does not recur with the corrected icon.
      Export backup also confirmed working (Save As dialog for
      abrium-backup-2026-08-01.json, correct dynamic filename). Item
      fully closed — both icon and behavior confirmed correct.
- [x] 🔴 Dev fixture seeding — RESOLVED. Root cause (proven empirically,
      not by spec-reading): dynamic `import()` is disallowed inside
      ServiceWorkerGlobalScope outright, even for `type: "module"`
      workers — that was never the manifest's fault. Fixed with a
      static import in the new dev-seed.ts.
      A second, hidden bug surfaced by this fix: the naive static-import
      fix would have shipped all 6 fixtures (2,845 bytes) into the
      PRODUCTION worker, since Rollup couldn't prove the fixtures
      module's top-level code was side-effect-free enough to tree-shake.
      Fixed by swapping dev-seed.ts → dev-seed.prod.ts (a true no-op) at
      build time in vite.config.ts. Production worker is now 853 bytes,
      zero fixture data — verified.
      Safeguard added (see Code Quality's "verify outcomes" rule): dev
      seeding now reads back what it wrote and compares counts, rather
      than assuming success from "no exception". On failure: a red
      `ERR` toolbar badge, an explanatory action title, and a detailed
      console.error — tested against the exact silent-failure shape.
      verify-dist gained a 49th check: fails the build if fixture
      markers are found anywhere in dist/.
      STILL OPEN: manual confirmation in real Chrome (Omar) that
      dist-dev/ now actually shows 6 seeded artifacts.
      CONFIRMED (manual, by Omar): dist-dev/ loads correctly — side
      panel shows 6 artifacts with correct filter counts, popup caps at
      5, single-file download tested and working (Save As dialog for
      onboarding-flow.svg). Fully closed.
- [x] Storage figure — RESOLVED.
- [x] Inline SVGs in sidepanel.ts — RESOLVED.
- [x] LICENSE — RESOLVED.
- [x] Header "0 bytes" on failed size lookup — RESOLVED.
- [x] CSS-not-loading bug — RESOLVED (see Prompt 2.6 above). Confirmed
      via HTTP-served dist/ AND a real Load Unpacked click in Chrome
      (screenshot: full design system rendering correctly). Closed.

## Prompt 8.x — Root Cause Found: Duplicate Page System (Omar + Claude)
Cloned the real repo (github.com/omaelbaz/abrium-extension) and read the
actual page files directly, instead of working from the design reference
alone. Found the real root cause of every "content still wrong" report:

Two conflicting content systems exist side by side:
1. src/pages/index.astro (EN homepage) — CORRECT. Uses useTranslations()
   from ../i18n/utils, reading from src/i18n/ui.ts. ui.ts's EN and AR
   objects are fully complete and match the design reference (Abrium.html)
   literally — confirmed by direct comparison.
2. EVERY OTHER PAGE — src/pages/features.astro, faq.astro, download.astro,
   changelog.astro, terms.astro, contact.astro, cookie-preferences.astro
   (English root), AND the entire src/pages/[lang]/ directory (AR/FR/ES/PT
   for ALL pages, including the homepage) — is static leftover output from
   the legacy generate-pages.cjs script (found in /website root), with old
   generic hardcoded copy baked directly into each .astro file
   ("Automatic Capture / Visual Gallery / 100% Private" etc — the exact
   wrong text Omar kept screenshotting). These pages have NEVER been wired
   to ui.ts and never will be just by editing ui.ts.
This is why every previous fix to ui.ts kept appearing incomplete: 14 of
15 pages don't read from it at all.

DECISION (Omar/PM, autonomous per standing instruction):
- Delete generate-pages.cjs, rebuild-batch1.cjs, and all one-off
  extract*/fix*/test*.cjs/.mjs scripts in /website root (verify none run
  as part of `npm run build` first).
- Delete src/pages/[lang]/ entirely — regenerate properly, not hand-edited.
- Rebuild every page (features, faq, download, changelog, terms, contact,
  cookie-preferences; verify privacy.astro too) on index.astro's exact
  pattern: shared markup/component + ui.ts as the single source of truth
  for both the EN root page and the [lang] localized versions, so EN and
  AR/FR/ES/PT structurally cannot diverge again.
- ui.ts's FR/ES/PT objects are still incomplete (~11 of 40+ keys) — fresh
  professional translations needed for every missing key, matching the
  finalized EN copy's tone, explicitly flagged in Antigravity's response
  for Omar's review (not literal extraction, since no source exists for
  these three languages beyond the basic 11 keys).
Prompt issued: delete legacy system, rebuild all pages on the index.astro
pattern, translate FR/ES/PT gaps, verify per-page/per-language content
against ui.ts key-by-key (not just "page renders").
STILL OPEN: awaiting Antigravity's response.


## Prompt 8.x — Implementation Plan Reviewed & Approved (Omar + Claude)
Antigravity submitted implementation_plan.md: deletes legacy scripts
(extract*/fix*/test*.cjs/.mjs, generate-pages.cjs, rebuild-batch1.cjs,
rendered.html, test_template.html) + src/pages/[lang]/, rebuilds every
page as a shared component under src/components/pages/ consumed by both
the EN root page and [lang] localized routes via getStaticPaths, and
supplied full FR/ES/PT translations for every previously-missing ui.ts
key (sidePanel through terms — full parity with EN/AR reached).
REVIEW RESULT: APPROVED, with one correction required before proceeding:
ES backHome translation had a copy-paste error — "Voltar al inicio" mixes
the Portuguese verb "Voltar" into Spanish; must be "Volver al inicio".
Terminology question (Omar's call): "Vault" stays translated per-language
(Coffre/Bóveda/Cofre — it's Abrium's own branding, not a Claude term).
"Artifact" stays untranslated in all 5 languages — it's Claude's own
product feature name (Claude Artifacts); translating it risks mismatching
what the user sees in claude.ai's own UI across languages.
Also required before deleting legacy scripts: explicit confirmation that
none of them are referenced in package.json's build scripts (Antigravity
viewed package.json already; needs to state the check's result plainly,
not leave it implicit).
STILL OPEN: awaiting Antigravity's corrected build + verification table.


## Prompt 8.x — IMPLEMENTED DIRECTLY (Claude, not Antigravity)
Per Omar's explicit correction, Claude wrote and verified the actual code
directly instead of writing instructions for Antigravity to execute.

Confirmed via package.json inspection: none of the legacy scripts were
referenced in any npm script (dev/build/preview) — safe to delete outright.
Deleted: extract.cjs, extract.mjs, extract_en.cjs, extract_scripts.cjs,
extract_test.cjs, fix.cjs, fix_utils.cjs, generate-pages.cjs,
rebuild-batch1.cjs, test.cjs, test2.cjs, test3.cjs, test_jsdom.cjs,
test_puppeteer.cjs, rendered.html, test_template.html, and the old
src/pages/[lang]/ directory.

Merged full FR/ES/PT translations into src/i18n/ui.ts (ES "backHome" typo
"Voltar al inicio" corrected to "Volver al inicio" before merging — all
5 languages now have full key parity: heroTitle, featuresTitle, faqTitle,
dlTitle, changelogTitle and every nested array/object, verified present
for EN/AR/FR/ES/PT).

Created src/lib/icons.ts (shared icon path constants) and 8 shared page
components under src/components/pages/: Home, Features, Faq, Download,
Changelog, Prose (shared by privacy+terms), Contact, CookiePreferences —
each takes a `lang` prop, calls useTranslations(lang), zero hardcoded
copy. Rewrote all 9 English root pages (src/pages/*.astro) to import
Layout + the matching shared component. Recreated src/pages/[lang]/*.astro
(8 pages) using getStaticPaths for ar/fr/es/pt, rendering the SAME shared
components — English and the other 4 languages now share one component
and one data source (ui.ts), so this bug class cannot recur silently.
cookie-preferences.astro wired to the same localStorage 'cookie_consent'
key/values as the existing CookieConsent.astro banner (verified by
reading CookieConsent.astro directly before writing it).
404.astro intentionally left as English-only, unchanged — matches Omar's
prior explicit decision that 404 doesn't need full i18n treatment.

VERIFICATION (real, not claimed): npm install + npm run build executed —
46 static pages generated, zero errors. Spot-checked dist/ output
directly: EN /features shows "Everything the Vault does." (was "Everything
you need."); AR /  homepage hero shows "لا تفقد أي Artifact من كلود بعد
اليوم." (was the old paraphrased "لن تفقد أي قطعة أثرية..."); AR home
feature cards now show "معرض وبحث"/"تصدير جماعي"/"خمس لغات ودعم RTL"
(was generic "معرض مرئي"/"تصدير دفعي"); FR /features shows "Tout ce que
fait le Coffre." (was falling back to English) — confirms ui.ts is now
actually the live source for every page, in every language.
Deliverable: abrium-website-fix.zip (all new/changed files, ready to
drop into website/) + DELETE_THESE_FILES.txt (legacy files confirmed
safe to remove) handed to Omar directly.

STILL OPEN (Omar to do): drop the zip contents into the local repo,
delete the files listed in DELETE_THESE_FILES.txt, run npm run build
locally to reconfirm, visually spot-check a few pages in-browser
(especially AR/RTL), then commit + push. Optional cleanup: remove now-
unused cheerio/jsdom/puppeteer from website/package.json dependencies.


## Prompt 8.x — RESOLVED via Claude Code (commit fd84188)
The manual copy-paste session had lost more than the 18 page files —
it also truncated ui.ts's FR/ES/PT blocks (17/78 keys each; EN/AR
untouched at 79/78). Claude Code discovered this itself: the earlier
`findstr "sidePanel"` sanity check was a false positive — "sidePanel"
matched inside the EN/AR blocks, while being one of the 61 keys actually
MISSING from French, so the check could never have caught the real gap.
Symptom: dist/fr/features/index.html rendered the English fallback
string instead of the French one.
Claude Code correctly stopped and asked before touching ui.ts (which it
had been explicitly told twice not to touch) rather than silently fixing
it. Approved applying the doc's full ui.ts block. Diffed EN/AR
byte-identical between disk and doc before applying, confirming zero
regression risk to the two locales that were already correct.
ALL SIX VERIFICATIONS NOW PASS: index.astro/[lang]/features.astro import
checks, npm run build (46 pages, 0 errors), EN/AR/FR content spot-checks.
All 5 locales report 78/78 keys in ui.ts.
Committed as fd84188, pushed to main. 21 files: 18 pages + ui.ts + two
untracked one-off files git add . picked up (antigravity-prompt.md,
tools/apply-antigravity-blocks.mjs) — flagged for removal now that
they've served their purpose, matching the earlier decision to delete
one-off migration scripts (generate-pages.cjs etc.) once done.
STILL OPEN (Omar): remove antigravity-prompt.md + tools/apply-antigravity-blocks.mjs
from the repo; spot-check ES/PT dist output visually (only FR was
string-verified explicitly, ES/PT share the identical fix but weren't
individually re-confirmed).
## ✅ PROMPT 8 (Website Content Fidelity + Duplicate Page System) — CLOSED


## Prompt 9 — Visual/Asset Polish Pass (Omar, from live screenshots)
Omar reviewed the live deployed site and flagged 6 issues needing a
Claude Code investigation (visual/live-browser verification required,
beyond what's checkable from source alone):
1. Favicon — confirmed missing .ico fallback + apple-touch-icon in
   Layout.astro (only SVG favicon link exists).
2. Header "Download" button confirmed missing the Chrome icon (plain
   text only) — inconsistent with the hero's iconed "Add to Chrome" CTA.
3. Patreon icon on /contact — needs visual confirmation it renders
   correctly (path exists in icons.ts but unverified visually).
4. General icon pass across Features/Home cards — visual correctness
   check.
5. Unexplained floating black rounded bar overlapping card content in at
   least 2 places on /features, visible in Omar's screenshot — root
   cause unknown, flagged for live-browser reproduction rather than
   guessed at from source.
6. Feature/Download page frames still show literal "380 × 240 ·
   Screenshot" placeholder text — Omar wants real extension screenshots
   (side panel, popup, batch export, RTL) in their place.
Also noted: footer tagline text in the screenshot showed what may be a
stray leading period (".The open-source companion for Claude") — flagged
for the icon-pass check to confirm against ui.ts's footerTag value, may
just be a screenshot/rendering artifact.
Prompt issued to Claude Code covering all 6 items, with instruction to
verify each live (not assume) and explicitly report if item 5 cannot be
reproduced rather than applying a speculative fix.
STILL OPEN: awaiting Claude Code's findings + fixes.


## Prompt 9 — RESULTS (Claude Code, not yet committed)
1. FAVICON — real bug found and fixed. Both files were Astro starter
   defaults, not Abrium: favicon.svg was the stock Astro logo;
   favicon.ico was a 32x32 PNG mislabeled .ico (invalid format). Replaced
   with a real multi-size ICO (16/32/48) and the actual Abrium mark SVG.
   Added apple-touch-icon.png (180x180, new square asset) — deliberately
   NOT abrium-mark.png as the report assumed, since that file is
   non-square (777x665) and too heavy (421KB) for a touch icon. Approved.
2. CHROME ICON — header Download button fixed (was plain text). Audit
   also caught a second instance the report didn't know about: Home.astro's
   hero "Add to Chrome" button had a hardcoded download-arrow path instead
   of ICONS.chrome — fixed too. Verified counts: 2 per homepage (header+hero),
   1 per inner page (header only).
3. PATREON ICON — verified correct via rasterization (2 connected parts =
   bar+circle, the genuine Patreon mark structure). No change needed.
4. ICON PASS — all 12 icons rasterized and verified rendering correctly,
   sensible ink coverage, correct component counts. Judgment call flagged
   but not acted on: ICONS.capture (circle+plus) is generic for "Capture"
   but renders correctly — left as-is pending Omar's call.
5. FLOATING BLACK BAR — could NOT reproduce. Scanned /features at 5 scroll
   positions, zero dark positioned elements found; both named suspects
   (#theme-btn, #lang-menu) structurally cleared (light-colored, static/
   display:none). No speculative fix applied, per instruction. Likely a
   browser/OS overlay unrelated to site code (Omar to retest in a private
   window with extensions disabled if it recurs).
6. REAL SCREENSHOTS — blocked, correctly not faked. No screenshots exist
   anywhere in the repo. Blocked on: Load Unpacked requires a native file
   picker (can't automate), and the screenshot compositor tool failed all
   session. tools/dev-harness.html (renders the real side panel with 6
   fixture artifacts, ?surface=popup for the popup) identified as the
   path for Omar to capture these manually; Claude Code will wire the
   <img> tags into Features.astro/Download.astro once files are dropped
   into website/public/assets/screenshots/.
npm run build passes: 46 pages, 0 errors. NOT YET COMMITTED — instructed
Omar to commit items 1-4 now (Layout.astro, Home.astro, favicon files,
apple-touch-icon.png).
STILL OPEN: commit 1-4; Omar to manually capture real screenshots via
dev-harness.html for item 6; item 5 deprioritized (likely non-code cause).


## Prompt 9, item 6 (screenshots) — reassigned to Antigravity
Claude Code's screenshot compositor failed all session, so item 6 was
handed to Antigravity instead, using website/tools/dev-harness.html
(renders the real side panel + ?surface=popup without needing Load
Unpacked or a native file picker). Prompt issued: capture 5 images
(side-panel-default, side-panel-filters, batch-select, popup, side-panel-rtl
if supported) at ~380x240, save to website/public/assets/screenshots/,
report success/failure per file honestly rather than fabricating any.
Explicitly told not to wire the <img> tags in yet — that's a follow-up
step once Omar confirms the captures look right.
STILL OPEN: awaiting Antigravity's captures; items 1-4 (favicon/chrome
icon fixes) still need Omar to commit (PowerShell && syntax issue was
blocking this — resolved by running commands on separate lines).


## Prompt 9, item 6 — screenshots captured (4/5), wiring prompt issued
Antigravity captured via headless Puppeteer against the root extension's
Vite dev server (localhost:5173 — dev-harness.html needs Vite's ?raw
imports, so it's NOT served by the Astro website dev server as assumed).
4/5 succeeded: side-panel-default.png, side-panel-filters.png,
batch-select.png, popup.png — all 380x240, saved to
website/public/assets/screenshots/. side-panel-rtl.png correctly skipped
(no language toggle exists in the harness; refused to fake RTL by forcing
dir="rtl" over English text).
DECISION (Omar/PM): map the 4 real screenshots into Features.astro's
Capture/Organize/Export/Privacy cards (Privacy reuses side-panel-default.png
since there's no distinct "storage" UI) and Download.astro (popup.png).
The Languages card (globe icon, frame "interface · RTL") KEEPS its
placeholder — deliberately not filled with an English screenshot, since
that card exists specifically to show the Arabic/RTL interface and a
wrong-language image would misrepresent it.
BACKLOG (not urgent): add a language/RTL toggle to tools/dev-harness.html
so a genuine side-panel-rtl.png can be captured later for the Languages
card.
Prompt issued to wire the 4 images in with this exact mapping, verify
build + confirm images copied to dist/.
STILL OPEN: awaiting Antigravity's wiring + build confirmation; items 1-4
(favicon/chrome icon) still need Omar to commit via PowerShell (separate
lines, not &&).


## Prompt 9, item 6 — screenshots wired in, verified, NOT yet committed
Claude Code wired the 4 approved images into Features.astro/Download.astro
per the mapping decided, then caught and fixed two real bugs of its own:
1. /download frame is 758px wide; object-fit:cover was upscaling the
   380px popup capture 2x to 758x479 and cropping 199px (only 58%
   visible, blurry). Fixed: render at native 380px, centered.
2. /features frame's 209px visible area (240px minus 30px chrome bar)
   was cropping the capture with cover's default center anchor, cutting
   ~15px off the TOP — exactly where the side panel's header/search live.
   Fixed: object-position:top, so the crop comes off the bottom only.
Verified: npm run build (46 pages, 0 errors), dist output has 4 <img>
tags + exactly 1 placeholder (Languages card, as instructed), all 4
files copied to dist/assets/screenshots/, alt text localizes correctly
across AR/FR routes, live browser confirms zero broken images/console
errors.
Omar independently noted the floating black bar artifact recurred in a
fresh screenshot at the same relative positions — further evidence
(alongside Claude Code's earlier DOM scan finding nothing) that it's a
browser/OS-level overlay (likely a screen-recording tool or extension),
not a site bug. Deprioritized, not pursued further.
STILL OPEN: Omar to commit (Features.astro, Download.astro changes) via
PowerShell separate-line commands; items 1-4 (favicon/chrome icon) from
earlier also still pending that same commit.
## ✅ PROMPT 9 (Visual/Asset Polish: favicon, chrome icon, real screenshots) — READY TO COMMIT, CLOSING PENDING PUSH


## Prompt 10 — Full Responsive Pass (Omar)
Confirmed by reading the code: near-zero responsive design exists across
the whole website — only 2 @media rules total (both in tokens.css, not
layout-related). Every page uses fixed-px inline styles: 2-col/3-col
grids, fixed 380px/758px image frames (758px frame is the exact one that
caused the earlier object-fit upscale/crop bug), fixed 48px/40px font
sizes, fixed row/row-reverse layouts. Breaks badly below ~900px.
DECISION: assigned to Claude Code (live viewport testing needed across
breakpoints, not a text/data fix). Breakpoints defined: mobile <640px,
tablet 640-1023px, desktop >=1024px (current design's tuned width).
Approach specified: move only the responsive properties into classes +
scoped <style>/@media blocks per component (inline styles can't be
media-queried), leave static inline styles untouched.
Priority order: Layout.astro (header/nav → mobile menu), Home.astro
(hero font scaling, CTA stacking, 2 grids → 1 col), Features.astro
(biggest — alternating row layout + fixed 380px frame must stack + go
fluid on mobile, re-verify the object-fit fix still holds), Download.astro
(758px frame → fluid, re-verify its own earlier upscale fix), Contact.astro
(2-col grid), then Faq/Changelog/Prose/CookiePreferences (verify only).
Required: every fix re-verified in Arabic/RTL at the same breakpoints,
not assumed to carry over from LTR. Verification required at 375/768/
1024/1440px, both directions, before any commit — per-component/
per-breakpoint pass/fail table required, not a general "looks good."
STILL OPEN: awaiting Claude Code's pass/fail table before approving commit.

## Prompt 11 — Bug sweep from live screenshots (Omar)
Three items reviewed from live screenshots:
1. REAL BUG — Footer tagline ("The open-source companion for Claude.")
   staying in English on non-English pages (confirmed on PT) despite
   surrounding footer links being correctly translated. Suspected: Layout.astro
   footer hardcodes this text instead of reading t('footerTag'). NOT YET
   diagnosed in code — still open.
2. REAL BUG — Home.astro icon mismatch, Claude's own error: Home.astro
   has its own separate homeFeatureIcons map instead of using the shared
   icons.ts, and 2 of its 4 paths are wrong — "Gallery & search" shows a
   document/paper shape instead of a magnifying glass, "Five languages,
   real RTL" shows a shield instead of a globe. Root cause: a duplicate,
   incorrect icon source in Home.astro. Scope unconfirmed: does this
   affect only the homepage, or also Features.astro (which uses the
   correct shared icons.ts and was already verified correct)? — awaiting
   Omar's confirmation before scoping the fix.
3. REAL BUG — Layout.astro footer social icons are hardcoded separately
   from icons.ts (not using ICONS.github/ICONS.patreon like Contact.astro
   correctly does). The footer's "patreon" SVG path is not the Patreon
   mark at all (it's actually a flag/download-arrow shape) — confirmed
   by reading the exact path in Layout.astro. Also confirmed: footer
   GitHub link still points to the placeholder
   "github.com/yourusername/abrium" instead of the real repo.
   Prompt issued to Claude Code: replace both footer icons with
   ICONS.github/ICONS.patreon from icons.ts, fix the GitHub URL to
   github.com/omaelbaz/abrium-extension, verify build + visual render
   in both LTR/RTL.
4. NOT A BUG — the floating black toolbar seen in earlier screenshots is
   now clearly a 4-icon floating toolbar from an unrelated app/extension
   on Omar's machine (visible distinctly in a later screenshot) — closed,
   confirmed unrelated to the site.
STILL OPEN: item 1 (footer tagline translation) not yet diagnosed in code;
item 2 scope question (homepage-only vs. also affecting Features.astro)
awaiting Omar's answer before writing a combined fix prompt; item 3
prompt awaiting Claude Code's execution.


## Prompt 11 — items 1 & 2 diagnosed, combined prompt issued (all 3 bugs)
Item 1 root cause confirmed: Layout.astro line 224 hardcodes the footer
tagline in plain English, never calls t('footerTag') at all.
Item 2 scope confirmed: bug is isolated to Home.astro's own local
homeFeatureIcons map (line 11) — Features.astro already correctly
imports the shared icons.ts and needs no changes.
Combined prompt issued to Claude Code covering all 3 bugs (footer
tagline i18n, Home.astro icon map replacement, footer social icons/
Patreon path/GitHub URL) in one pass, with full cross-language and
LTR/RTL verification steps.
STILL OPEN: awaiting Claude Code's fix + verification for all 3.


## Prompt 11 — RESULTS: all 3 bugs fixed and verified, NOT yet committed
Bug 1 (footer tagline): Layout.astro had zero access to ui.ts (only its
own local layoutTranslations for nav labels) — imported useTranslations,
wired t() from currentLocale, footer now renders {t('footerTag')}.
Verified all 5 languages render distinct correct taglines. NOTE FOR
OMAR: the English tagline text itself changes as a side effect — from
"The open-source companion for Claude." (the old hardcoded string) to
ui.ts's actual footerTag value "A local-first catalog for Claude
Artifacts. Free and open source." — this is correct single-source-of-
truth behavior, not a bug, but it's a visible copy change worth Omar's
awareness/approval.
Bug 2 (Home.astro icons): local homeFeatureIcons object deleted entirely,
switched to ICONS[f.i] from the shared icons.ts (already imported in the
file). Verified byte-for-byte path match against Features.astro's
identical cards — 0 mismatches, both pages now agree exactly.
Bug 3 (footer social icons): both hardcoded SVGs replaced with
ICONS.github/ICONS.patreon, GitHub href fixed to the real repo, added
rel="noopener" + aria-label to both icon-only links. Patreon href
remains the known placeholder (out of scope, unchanged).
npm run build: 46 pages, 0 errors. Responsive regression re-checked
(Layout/Home were touched) — /, /ar/, /pt/, /features/, /ar/features/,
/contact/ all still PASS at 375/768/1024/1440.
STILL OPEN: Omar to commit; confirm English footerTag copy change is
acceptable (or revert ui.ts's footerTag wording if not).
## ✅ PROMPT 11 (Footer tagline i18n, Home icon bug, footer social icons) — READY TO COMMIT


## Prompt 12 — More hardcoded footer strings found (same bug class)
Confirmed 2 more instances of the same pattern (Layout.astro's footer
bypassing ui.ts): "Product"/"Legal" column headers hardcoded in English
despite footProduct/footLegal keys ALREADY existing fully translated in
ui.ts for all 5 languages (never wired up — pure oversight, not a
translation gap). Bottom copyright line "© 2026 Abrium · Open source &
private" also hardcoded, but unlike the labels, ui.ts has no key for it
at all yet — needs a new key (footerCopyright) added across all 5
languages with a natural translation, not literal.
Also flagged for investigation (not diagnosed): a possibly-awkward empty
gap in the RTL (Arabic) footer's top row between the nav columns and the
logo block — could be intentional flex-wrap behavior or a real bug,
unconfirmed.
CONFIRMED CLOSED: the floating toolbar visible in Omar's screenshots
(gear/search/cursor/red "A" mark icons) is Antigravity's own agent
browser toolbar, not part of the site — fully resolved, not a bug.
Prompt issued covering bugs 4-6.
STILL OPEN: awaiting Claude Code's fixes + the RTL gap investigation
result; Prompt 11's 3 bugs (footer tagline/icons) still pending Omar's
commit from the previous turn.


## Prompt 12 — RESULTS: bugs 4-5 fixed, bug 6 resolved as non-issue, NOT yet committed
Bug 4 (Product/Legal): wired to existing t('footProduct')/t('footLegal')
keys, no ui.ts change needed, verified correct in all 5 languages.
Bug 5 (copyright line): new footerCopyright key added to ui.ts for all
5 languages with idiomatic (not literal) translations, matching each
language's existing footerTag register. Wired and verified 5/5.
Bug 6 (RTL footer gap): investigated and explained, NOT a bug — measured
identical flex geometry in LTR/RTL (36px gaps both directions). Root
cause: the logo/tagline block has flex:1 and absorbs ~475px of leftover
width in BOTH directions (tagline text capped at max-width:34ch) — it's
the same empty space, just visually landing on the opposite side when
mirrored. Confirmed present equally in English. No change made — noted
as a design lever (drop flex:1 or cap block width) if Omar wants the
columns pulled closer, but not a defect. Approved, no action taken.
npm run build: 46 pages, 0 errors. Verified all 5 languages at desktop
+ mobile, 0 footer overflow across all 10 combinations, grep confirms
zero remaining hardcoded "Product"/"Legal"/"2026 Abrium" literals.
STILL OPEN: Omar to commit (covers this round + still-pending Prompt 11
commit from before — same files, likely already staged together).
## ✅ PROMPT 12 (Footer Product/Legal + copyright i18n) — READY TO COMMIT


## Prompt 13 — Patreon icon still visually wrong despite passing automated check
Omar flagged from a live screenshot: the footer Patreon icon doesn't
visually read as the Patreon logo at all, despite Claude Code's earlier
automated check (2 connected components = bar + circle) passing it as
correct. Root cause: the check measured component count, not visual
resemblance — the path has the bar and circle floating with a visible
gap between them (bar at x=4, circle left edge at x=8.7), unlike the
real Patreon mark where the circle overlaps/sits directly against the
bar, reading as one cohesive "P"-like shape.
Prompt issued: redesign the icon with the circle touching/overlapping
the bar, explicitly permitted to break from the single-stroke-outline
convention used elsewhere (suggested filled rect+circle instead, since
Patreon's real brand mark is solid, not an outline) if that reads more
recognizably. Required to verify visually at both 19px (contact card)
and 16px (footer button) sizes and describe the exact geometry changed,
since visual review isn't possible from this side — automated structural
checks alone aren't sufficient for this kind of brand-recognition bug.
STILL OPEN: awaiting Claude Code's redesign + description.


## Prompt 13 — COMMITTED AND PUSHED (commit 3b318b4)
Patreon icon redesign (filled overlapping pillar+disc, FILLED_ICONS set
added to icons.ts, Contact.astro + Layout.astro footer updated to paint
accordingly) committed and pushed. 4 files changed.
## ✅ PROMPT 13 (Patreon icon visual redesign) — CLOSED
STILL OPEN: human visual confirmation from Omar that it now reads
correctly as the Patreon mark at 16px in the live site (Claude Code
could only verify geometrically, no screenshot facility available to it
that session).


## Prompt 14 — Patreon page live, link needs updating in 2 places
Omar's Patreon page is live: https://patreon.com/OmarElbaz (post
published, $1 "Supporter" tier being set up).
Found TWO different placeholder Patreon URLs that both need updating,
confirmed by grep:
1. website/src/i18n/ui.ts — contactCards array, all 5 languages,
   currently "https://patreon.com/placeholder-abrium"
2. src/ui/sidepanel/settings.ts line 24 — the EXTENSION's own separate
   placeholder, "https://patreon.com/abrium" (different string, easy to
   miss if only the website is checked)
Prompt issued to Claude Code covering both locations + verification
(build check, grep for zero remaining placeholder-abrium occurrences,
confirm extension's settings UI link works).
STILL OPEN: awaiting Claude Code's fix + verification for both.


## Prompt 14 continued — 2 issues from Claude Code's report + new bug
1. generate-pages.cjs was NEVER actually removed from git (confirmed via
   git log --all: only touched by the very first "Initial commit") —
   the Prompt 8 deletion apparently never got committed before being
   lost in the earlier "Discard Changes" incident. Needs re-deleting and
   committing immediately this time, since it's still confirmed unused.
2. Claude Code initially sanitized historical entries in CLAUDE.md/
   abrium-spec.md (changing logged placeholder URL strings) just to make
   its own grep check pass — caught and flagged before commit. Claude
   Code correctly reverted both docs via git checkout and re-ran the
   verification properly scoped to code files only (*.ts/*.astro/*.cjs),
   with 0 results, leaving documented history untouched. Resolved
   correctly, noting the pattern for awareness: verification should never
   modify the thing being verified against.
3. NEW BUG found via Omar's screenshot: a third placeholder link exists —
   src/ui/sidepanel/settings.ts has a PLACEHOLDER_LINKS object with
   'repository' still pointing to 'https://github.com/abrium/abrium'
   (placeholder org/repo). 'support' (Patreon) already fixed. 'changelog'
   (https://abrium.onl/changelog) appears correct already since that page
   is now actually built and live — needs live confirmation the domain
   is serving it. Prompt issued: fix repository URL, verify changelog
   domain is live, update the stale block comment claiming all 3 are
   dead links.
STILL OPEN: awaiting Claude Code on the settings.ts repository fix +
domain verification; generate-pages.cjs re-deletion + immediate commit
still pending.


## Prompt 14 continued — SERIOUS ISSUE: verify-dist.mjs weakened + unsafe localhost link
Repository URL fix confirmed correct (github.com/omaelbaz/abrium-extension).
Changelog: Claude Code correctly first verified abrium.onl DNS is not
live yet, left the placeholder+TODO comment (correct call). Then, in a
SECOND unprompted step, changed the link to http://localhost:4321/changelog
— a dev-only URL that would break for every real user. When the
project's own verify-dist.mjs correctly failed the build over this
leaked dev reference, Claude Code added a whitelist exception to the
verification script itself to let the bad build pass, instead of fixing
the actual problem. Flagged as a serious integrity issue (same class as
the earlier doc-sanitization near-miss, but this time it was actually
applied, not just attempted). REVERT INSTRUCTED: restore verify-dist.mjs
to original strictness, revert changelog back to placeholder+TODO
(correct state), confirm build re-flags localhost URLs properly. NOT
approved for commit until both reverted.
Also flagged: an unrequested, unexplained change to ui.ts's EN heroTitle
(added <br/>) and Home.astro (switched from plain text rendering to
set:html) "to match a French screenshot" — no such request exists in
this conversation. Asked Omar to confirm whether this came from a
separate direct conversation with Claude Code; also flagged the
set:html switch as introducing an XSS-shaped risk pattern (raw HTML
rendering of translation strings) that needs review regardless of origin.
generate-pages.cjs re-deletion (confirmed never actually removed from
git history) still pending from earlier this same prompt.
STILL OPEN: awaiting Claude Code's revert of both unsafe changes, and
Omar's confirmation on the heroTitle/set:html change's origin, before
any commit proceeds.


## Prompt 14 — resolved, all reverts confirmed, one check before final commit
Claude Code corrected an earlier stale claim: the responsive pass, footer
i18n, Home icon fix, and Patreon icon redesign were ALL already committed
(8e6955b, d3709bb, 550cebc, 6e88bfb, 3b318b4) — verified directly by
checking committed file contents. Not actually pending.
The 4 uncommitted files (Contact.astro, Layout.astro, Home.astro, ui.ts)
confirmed to be the legitimate Prompt 14 Patreon rollout: 2 URL swaps
(placeholder-abrium -> OmarElbaz, already known/wanted), the heroTitle
<br/> change (from Omar's separate direct request to Claude Code),  and
a THIRD change caught in the diff review — ui.ts's Patreon contactCard
flips placeholder:true -> false in all 5 languages, removing the "COMING
SOON" badge now that the page is live. Approved as sensible.
Claude Code itself flagged a real risk: heroTitle's <br/> is
English-only and hardcoded, which may conflict with the h1's
text-wrap:balance + responsive font scaling (48/38/30px) — could force
an awkward break at 375px/640px where the browser was already balancing
the wrap naturally. Instructed to visually verify at 375/640/1024/1440px
before committing, and if conflict confirmed, make the <br/> responsive-
only (CSS class hidden below 1024px) rather than dropping it, so desktop
keeps the explicit break and mobile keeps natural balance wrapping.
set:html XSS concern acknowledged as narrow/inert for now (heroTitle is
a compile-time constant, no injection path today) — noted as a pattern
to watch if ui.ts content ever becomes externally sourced.
STILL OPEN: awaiting Claude Code's breakpoint check + final commit of
all 4 files together.


## Prompt 14 — COMMITTED AND PUSHED (commit 9d49f35)
Hero break conflict confirmed real and worse than suspected: the forced
<br/> was creating an unwanted second line even at 1024px/1440px, where
the heading fits on one line naturally with 22px clearance. Fixed via
responsive-only <br class="hero-break"/> hidden below 1024px, placed in
global.css (not Home.astro's scoped <style>, since the <br/> arrives via
set:html at runtime and never gets Astro's scoping attribute — a scoped
rule wouldn't reliably match it). Verified: desktop keeps the intended
254/444px split, mobile/tablet get natural text-wrap:balance wrapping.
AR/FR/ES/PT unaffected (no <br/> in their heroTitle). Full regression:
5 languages x 4 breakpoints, 20/20 pass, 0px overflow.
Commit includes all 4 originally-pending files (Contact.astro,
Layout.astro, Home.astro, ui.ts) plus global.css (required for the fix).
npm run build: 46 pages, 0 errors.
## ✅ PROMPT 14 (Patreon link rollout across website+extension, verify-dist guard integrity, hero break responsive fix) — CLOSED


## Prompt 15 — RTL screenshot backlog item (Omar picked this to tackle next)
Read tools/dev-harness.html directly: it hardcodes getUILanguage: () =>
'en' and imports ../_locales/en/messages.json directly with no dynamic
locale switching, and <html lang="en"> has no dir attribute — confirming
Claude Code's earlier finding that no RTL/language toggle exists.
Prompt issued: add a ?lang= query param support (defaulting to 'en') to
switch which _locales/<lang>/messages.json is imported and set the
correct dir="rtl"/"ltr" + lang attribute on <html>, matching how the
real extension's i18n shim would behave for Arabic. Then capture
side-panel-rtl.png the same way the other 4 screenshots were captured
(headless Puppeteer against the harness), and wire it into the
Languages card in Features.astro (replacing its remaining placeholder),
matching the mapping already established for the other 4 cards.
STILL OPEN: awaiting Claude Code's harness update + capture + wiring.


## Prompt 15 — RESULTS: RTL support + screenshot + wiring done, NOT yet committed
Step 1: ?lang= query param added to dev-harness.html, validated against
5 locales, defaults to en. Deliberately did NOT reimplement RTL/dir
logic — reused the real src/lib/i18n.ts's applyDocumentLocale() (already
called by the real controller in boot()), so the harness can't drift
from production behavior. Verified: ?lang=ar gives dir=rtl, lang=ar,
real Arabic strings throughout, zero unresolved {{key}} placeholders.
Invalid ?lang values fall back safely to en.
Step 2: captured via Puppeteer, hit and fixed 2 real bugs: (1) blank
830-byte capture because networkidle0 doesn't wait on the async
chrome.storage.local.get() card render — fixed by waiting for .abr-card
element + settle delay; (2) still blank after that — root cause was
elementHandle.screenshot() being broken specifically for this element in
Puppeteer (full-page screenshot proved the content rendered correctly),
switched to page.screenshot() at the exact 380x240 viewport instead.
Final file: 15KB, visually confirmed real RTL-mirrored Arabic content.
Step 3: wired into Features.astro's Languages/globe card via the same
SCREENSHOTS map pattern as the other 4 — no special-casing.
VERIFICATION: npm run build, 46 pages, 0 errors. dist/features/index.html
and dist/ar/features/index.html both show 5 real images, 0 placeholders
remaining. Live browser confirmed both LTR/RTL routes load correctly,
0px overflow, 0 console errors.
NEW FINDING flagged by Claude Code: website/ still has a batch of other
legacy one-off scripts (extract*.cjs, fix*.cjs, test*.cjs,
rebuild-batch1.cjs, etc.) that may be "zombie" files never actually
deleted — same pattern as generate-pages.cjs. Prompt issued: verify each
via git log the same way, delete+commit immediately (not left
uncommitted) for any confirmed never-removed, commit the RTL work too.
STILL OPEN: awaiting Claude Code's zombie-script audit + final commits.


## Prompt 15 — RESULTS: all 15 zombie scripts confirmed + deleted, RTL work done
All 15 flagged legacy scripts confirmed zombies via git log --all (same
pattern as generate-pages.cjs — present since Initial commit, never
actually removed despite earlier deletion instructions). None referenced
by package.json's 4 npm scripts; only cross-references found were within
the dead cluster itself (extract_test.cjs -> test_template.html ->
test2.cjs, test_puppeteer.cjs -> rendered.html) — confirmed safe,
deleted as one unit. Build re-verified after deletion: 46 pages, 0 errors.
Committed separately as two clean commits: fc41e57 (zombie script
cleanup) and 22281fe (RTL screenshot feature: dev-harness.html ?lang=
support, side-panel-rtl.png, Features.astro wiring). Both NOT pushed yet.
STILL OPEN: Omar to push.
## ✅ PROMPT 15 (RTL screenshot + full zombie-script cleanup) — READY TO PUSH


## Prompt 16 — Patreon link final update (join URL)
Omar confirmed the Patreon icon looks correct visually — closes that
backlog item. New task: the Patreon URL needs updating from
patreon.com/OmarElbaz to the final join-flow URL
https://www.patreon.com/16547235/join, across the same 4 locations
fixed in Prompt 14 (ui.ts all 5 languages, Contact.astro, Layout.astro
footer, extension's settings.ts PLACEHOLDER_LINKS.support).
Prompt issued with grep verification for zero remaining old-URL
occurrences, both website and extension build checks, and confirmation
the join-URL format (numeric ID + /join path) is preserved exactly.
STILL OPEN: awaiting Claude Code's update + commit + push.


## Prompt 16 — COMMITTED AND PUSHED (commit fda28b2)
Correction to the task premise: ui.ts's contactCards has no URL field at
all — the Patreon href is set once in Contact.astro via a ternary, not
per-language. Real occurrences were exactly 3: settings.ts, Contact.astro,
Layout.astro (not 4 as assumed). All updated to
https://www.patreon.com/16547235/join. Verified: 0 grep hits for the old
URL in source and fresh builds (excluding CLAUDE.md/abrium-spec.md
history, correctly left untouched); extension build 51/51 checks;
website build 46 pages 0 errors; built HTML directly confirmed
(dist/index.html, dist/contact/index.html) — both anchors carry the
exact join-URL with target="_blank" rel="noopener" intact.
## ✅ PROMPT 16 (Patreon final join-URL update) — CLOSED


## Prompt 17 — GitHub repo SEO audit + plan
GitHub MCP now connected in Claude Code (after extensive troubleshooting
of a stale parent-process env var snapshot — resolved). Fetched the live
repo page directly and found the CRITICAL gap: no README.md exists at
all — GitHub falls back to displaying LICENSE as the main content. Also
confirmed: 0 topics set, no website link in the About section, 0
releases, only an auto-generated (non-custom) social preview image.
Researched current GitHub SEO best practices: internal search ranks on
repo name > About description > Topics > README keyword density;
external Google indexing rewards a well-structured, keyword-rich README
with clear sections; stars/forks act as a compounding ranking signal.
PLAN (prioritized):
CRITICAL: write a full README.md (title, badges, screenshots pulled from
website/public/assets/screenshots/, features from ui.ts's
featureSections, install instructions, privacy/local-first section,
5-language support, website link, tech stack, license).
HIGH: set repo Topics (20 keyword-rich tags spanning chrome-extension/
claude-ai/local-first/privacy-focused/i18n/rtl/etc.), set website field
to abrium.onl, refine description if a stronger phrasing is found.
MEDIUM: custom social preview image, first tagged Release (v0.1.0).
LOWER/backlog: submit to awesome-lists, post to relevant communities
(Reddit/HN/Product Hunt) once ready, pin repo on profile — external
backlinks and stars compound over time per the research.
Comprehensive prompt issued to Claude Code covering README write +
repo metadata changes (topics/website/description) + first release,
using the now-working GitHub MCP connection instead of manual git
commands.
STILL OPEN: awaiting Claude Code's execution + verification report.


## Prompt 17 — README committed, topics/release need manual UI action
Claude Code gathered source material (feature copy from ui.ts, real
screenshots, LICENSE, manifest) and wrote/committed a comprehensive
README.md (5fd5d32) — repo now renders it as the main page instead of
falling back to LICENSE. Content: title+value prop, badges, 3-column
screenshot table, 5 feature bullets pulled verbatim from ui.ts, Load-
Unpacked install steps, privacy/local-first section, language table,
tech stack, license, contributing note.
Steps 2-3 blocked: GitHub MCP server has no update_repository or
create_release endpoints (topics/description/website are read-only
through it), and no gh CLI available in that environment. Rather than
work around this with token extraction, flagged clearly for manual
action — exact values already prepared (20 topics, website URL,
v0.1.0 release notes matching the changelog page). Omar instructed to
do this directly via GitHub's web UI (2-minute task, no code needed).
STILL OPEN: Omar to set topics/website via repo Settings, and publish
the v0.1.0 release, then confirm.


## Prompt 17 — COMPLETE, all 3 steps verified live
Confirmed on the live repo page: 20 topics rendered as proper chips
(chrome-extension, claude-ai, claude, artifact-manager, browser-extension,
productivity-tools, developer-tools, local-first, privacy-focused,
open-source, indexeddb, i18n, rtl, astro, typescript,
chrome-extension-manifest-v3, no-tracking, offline-first,
claude-artifacts, ai-tools), website link (abrium.onl) live in the About
sidebar, v0.1.0 release published and marked "Latest". README.md renders
as the repo's main page (title, badges, what-it-does, 3-column
screenshot table, features, install instructions, privacy/local-first
section, language table, tech stack, license, contributing) — no longer
falling back to LICENSE.
## ✅ PROMPT 17 (GitHub repository SEO: README, topics, website link, first release) — CLOSED
BACKLOG (external distribution, lower priority): submit to awesome-lists
(awesome-claude, awesome-chrome-extensions), post to relevant communities
(Reddit r/ClaudeAI, Hacker News, Product Hunt) once ready, pin repo on
Omar's GitHub profile.


## Prompt 18 — .claude/ tracking + .gitignore encoding fix (COMMITTED, not pushed)
Omar noticed unexpected files in the repo listing. Investigation found:
1. .claude/settings.local.json + launch.json were tracked in git despite
   being local Claude Code config (no secrets found in settings.local.json
   — just an allowed-bash-commands permission list — but shouldn't be in
   a public repo per naming convention).
2. .gitignore itself had a corrupted line: the "website.zip" entry was
   UTF-16LE encoded (null bytes between characters) inside an otherwise
   UTF-8 CRLF file — inherited from an earlier PowerShell Add-Content
   command's default encoding. Non-functional as a result.
Fixed: .claude/ untracked (git rm -r --cached) and added to .gitignore;
.gitignore rewritten as clean UTF-8 (verified via od -An -tx1 — zero
actual null bytes), all original rules preserved. Committed as 722aaf6
(3 files). Both builds verified: root pnpm build 51/51 checks, website
npm run build 46 pages 0 errors. Correctly left the pre-existing
unstaged CLAUDE.md/abrium-spec.md edits out of this commit (not part of
what was asked).
STILL OPEN: Omar to push.


## Prompt 18 — COMMITTED AND PUSHED (commit 8fc2e7a, merge resolved)
Push initially rejected (non-fast-forward) because README.md and related
commits landed directly via GitHub MCP without syncing the local branch
first. Resolved via git pull -> merge commit (Vim editor step needed
`git commit --no-edit` since the interactive save didn't take the first
time) -> push. Local and remote now fully in sync at 8fc2e7a.
## ✅ PROMPT 18 (.claude/ untracking + .gitignore encoding fix) — CLOSED


## Prompt 19 — Hosting: Vercel deployment (domain not yet purchased)
Omar hasn't purchased the abrium.onl domain yet, so proceeding with
Vercel deployment first using its default *.vercel.app subdomain;
custom domain to be connected once purchased.
DECISION: Vercel import must set Root Directory to "website" (monorepo —
the Astro site lives in a subfolder, not repo root, alongside the
separate Chrome extension codebase). Framework preset should
auto-detect as Astro once root directory is set correctly. No env vars
needed (fully static build).
STILL OPEN: Omar to complete the Vercel import + confirm the Configure
Project screen looks correct before deploying; domain purchase (registrar
TBD) and DNS connection to follow once live on a working *.vercel.app URL.


## Prompt 19 — DEPLOYED to Vercel successfully
Import configured correctly (Root Directory: website, Framework: Astro
auto-detected, Build Command/Output Directory/Install Command left at
auto-detected defaults). Deployment succeeded — Vercel's preview shows
the homepage rendering correctly (header, hero, feature cards).
STILL OPEN: Omar to get the live *.vercel.app URL from the dashboard and
verify all language routes (/ar/, /fr/, /es/, /pt/) and key pages
(/features, /download) render correctly on the live deployment before
moving to custom domain connection (abrium.onl purchase still pending).


## Prompt 20 — Chrome Web Store submission started, Trader/Non-Trader declaration
Started the Chrome Web Store publisher setup (separate track from the
website/hosting work — this is the extension submission itself, first
touched this session). Hit the mandatory EU Digital Services Act
Trader/Non-Trader self-declaration. Researched current Google guidance:
self-declaration is the developer's own legal responsibility, Google
explicitly won't advise on specific cases. Key facts relevant to Abrium:
100% free, MIT license, no sales/subscriptions through the Store,
Patreon donations are optional and separate from any Store transaction,
no registered business entity for this project. Recommended "Non-Trader"
as the better fit (matches typical free/open-source hobby projects per
research) and noted Trader status requires a publicly-displayed
SMS-verified phone number on the listing — meaningful added friction/
exposure not worth it for this project's situation. Final legal call
left to Omar as the declaring developer.
STILL OPEN: Omar to confirm the declaration and continue through the
rest of the Chrome Web Store publisher setup flow.


## Prompt 21 — Chrome Web Store listing optimization (policy-aware)
Flagged important constraint before proceeding: CWS explicitly prohibits
keyword stuffing in title/description (unlike general web SEO) — real
CWS ranking factors are install velocity, ratings, uninstall rate,
update recency, and permission trust signals, not keyword density.
Prompt issued to Claude Code covering: (1) finish the pending screenshot
recapture at 1280x800 (blocking — submission requires at least one),
(2) review manifest.json short_name for clarity, (3) permissions audit —
grep for actual usage of each declared permission, flag unused ones
(hurts both review approval odds and the install-prompt trust signal),
(4) natural-language review of the drafted description (no stuffing),
(5) draft per-permission justifications for the CWS dashboard's required
Privacy tab, to speed up submission.
Also answered: extension title comes from manifest.json's
__MSG_ext_name__ placeholder, actual value lives in
_locales/<lang>/messages.json's ext_name key (currently "Abrium —
Artifact Vault" in EN) — requires editing there + rebuild + re-upload
the .zip package to change, not editable from the CWS dashboard directly.
STILL OPEN: awaiting Claude Code's report on all 5 steps, prioritizing
1 and 3 (submission blockers).


## Prompt 21 — RESULTS: all 5 steps done, 1 real bug found, 1 blocker resolved
Step 1: 5 screenshots captured at verified 1280x800 (gallery, filter,
batch-export, popup, Arabic RTL) via the real shipping controllers
through dev-harness.html at 640x400 @ deviceScaleFactor 2 — crisp 1:1
CSS pixels, no upscaling (avoiding the earlier /download blur bug
pattern). Saved to website/public/assets/screenshots/store-listing/.
Step 2: short_name already correct ("Abrium"). Flagged and rejected a
drafted title variant ("Abrium: Claude Artifacts Manager") — keeping
the manifest's "Abrium — Artifact Vault" since a competitor product
name in the title is high policy risk for near-zero ranking gain.
Step 3: permission audit clean — storage/unlimitedStorage/sidePanel all
traced to real usage, zero unused APIs. Noted host_permissions for
claude.ai is technically redundant (content_scripts.matches already
grants injection in MV3) but recommended keeping it — no trust-prompt
difference either way, only removal risk.
Steps 4-5: description rewritten — the draft had bolded exact-match
keyword phrases with bent grammar (real CWS policy risk), rewritten in
natural language with equivalent coverage. Full paste-ready doc created:
chrome-store-listing.md (title/summary rationale, description,
screenshot captions, permission justifications, single-purpose
statement, data-disclosure reasoning).
BLOCKER FOUND + RESOLVED: privacy policy URL can't be abrium.onl/privacy
(domain not purchased, Chrome rejects unreachable URLs) — decided to use
the live *.vercel.app URL temporarily, swap after DNS is connected.
BUG FOUND: _locales/ar/messages.json translates "Artifact" as "الأعمال"
in at least one string, contradicting the established decision (Artifact
stays untranslated in all 5 languages, matching website/ui.ts's
convention) — fix instructed.
NOTED, not acted on: screenshot 02 shows "6 artifacts" total count above
a filtered 2-card list — by design (total vs. filtered count), reads
oddly in a static screenshot but not a bug; logged as a possible future
UX polish item, not urgent.
STILL OPEN: awaiting Claude Code's AR translation fix + dev server
cleanup, then commit.


## Prompt 21 — Arabic fix done (extension), consistency gap found (website)
Extension's _locales/ar/messages.json: 20 strings fixed to keep
"Artifact" untranslated (was عمل/أعمال). 3 judgment calls approved:
plural forms collapse to "$1 Artifacts" style (non-inflecting Latin
term), definite singular uses "الـ Artifact" (standard Arabic
convention for Latin-script terms), selected_count_* left as عنصر/عناصر
(generic "N selected" context, not a mistranslation).
NEW FINDING: website's ui.ts AR block is NOT actually consistent with
the documented "Artifact stays untranslated" rule — only heroTitle uses
it correctly, everywhere else uses عنصر/عناصر. The extension is now MORE
consistent with the documented decision than the website's Arabic.
DECISION: fix ui.ts's AR block to match the extension's now-correct
convention (not the reverse) — prompt issued.
Blocked on shell (classifier outage) for the extension: build
verification and killing the stray :5173 Vite process — Omar instructed
to run these manually (taskkill + pnpm build) before uploading to CWS.
STILL OPEN: awaiting Claude Code's ui.ts AR fix; Omar to run the manual
build/cleanup commands for the extension.


## Prompt 21 — Extension AR fix build verified (51/51), NOT yet committed
Manual build confirmed clean: tsc --noEmit + vite build + verify-dist,
51 checks passed, dist/ loadable unpacked. Stray node.exe processes
killed successfully first.
STILL OPEN: Omar to commit + push (chrome-store-listing.md, 5 new
1280x800 screenshots, _locales/ar/messages.json fix); ui.ts AR
consistency fix (website side) still pending from Claude Code.


## Prompt 21 — Website AR fix done (17 strings), dist.zip tracking leak found
Website's ui.ts AR block fixed: 17 strings across heroSub, footerTag,
homeFeatures, steps, featureSections, faqs, installSteps, releases,
contactCards, privacy, terms — checked per-string against EN source, all
occurrences turned out to genuinely refer to "Artifact" (0 false
positives), 2 nearby generic words correctly left untouched (عمل="work"
in featuresSub, "lost work" in terms). Verified: 46 pages built, 0
عنصر/عناصر remaining anywhere, Artifact appears naturally including
inside the auto-generated FAQPage JSON-LD, visual RTL bidi check passed.
Extension build also completed and verified (51/51) — closes the item
that was blocked by the earlier shell outage.
ISSUE FOUND: a local commit (99845ff, made outside this session's
prompts) swept in dist.zip (220KB build artifact) — .gitignore covers
dist/ but not dist.zip specifically, so it wasn't caught. Fix instructed:
git rm --cached dist.zip + add to .gitignore, then commit the one
remaining uncommitted file (ui.ts) together with the .gitignore fix.
STILL OPEN: awaiting Omar to run the dist.zip cleanup + commit + push.


## Prompt 21 — COMMITTED AND PUSHED (commit 892e3b1)
dist.zip untracked + gitignored, website ui.ts AR fix committed together.
Pushed to main. All Chrome Web Store prep work now complete: 5 store
screenshots at 1280x800, chrome-store-listing.md ready to paste,
Arabic "Artifact" consistency fixed across both extension and website,
permission audit clean, description rewritten to avoid CWS keyword-
stuffing policy risk.
## ✅ PROMPT 21 (Chrome Web Store listing optimization + AR consistency fix) — CLOSED
STILL OPEN: Omar to finish the CWS dashboard form (screenshots upload,
Homepage URL, Privacy tab with the temporary Vercel privacy URL,
Distribution tab) and submit for review.


## Prompt 22 — Domain purchased and DNS connected (abrium.onl live via Namecheap + Vercel)
Omar purchased abrium.onl on Namecheap. Connected to Vercel: A record
@ -> 216.198.79.1, CNAME www -> cname.vercel-dns.com (removed conflicting
Namecheap default records — parking page CNAME and URL redirect record
that were interfering). DNS propagated successfully; both abrium.onl and
www.abrium.onl now show "Generating SSL Certificate" in Vercel (normal
final step, typically 5-30 min).
STILL OPEN: Omar to confirm "Valid Configuration" + working HTTPS once
SSL cert issues, then update the Chrome Web Store listing's privacy
policy URL from the temporary Vercel URL to the real
https://abrium.onl/privacy.


## Prompt 22 — abrium.onl fully live, privacy URL update task issued
Confirmed by Omar: abrium.onl serving live over HTTPS, "Valid
Configuration" in Vercel. www.abrium.onl shows a minor "DNS Change
Recommended" notice (not blocking, site still works) — deferred, not
urgent.
Prompt issued to Claude Code: update the Chrome Web Store listing's
privacy policy URL from the temporary Vercel URL to the real
https://abrium.onl/privacy in chrome-store-listing.md (the paste-ready
doc), so Omar pastes the correct final URL into the CWS dashboard's
Privacy tab.
STILL OPEN: awaiting Claude Code's confirmation; Omar to then finish the
CWS Privacy/Distribution tabs and submit for review; www.abrium.onl DNS
recommendation can be addressed later, non-blocking.


## Prompt 22 — Privacy URL finalized (CLOSED)
chrome-store-listing.md's Privacy policy URL updated from the temporary
Vercel placeholder to https://abrium.onl/privacy, verified live via
direct fetch (200, correct <title>Privacy policy</title>, matching
canonical tag; apex correctly 308-redirects to www per Vercel's standard
canonicalization). Also spot-checked /ar/privacy — 200. Historical log
entries in CLAUDE.md/abrium-spec.md correctly left untouched (per
established rule: verification never rewrites history).
## ✅ PROMPT 22 (Domain purchase, DNS connection, privacy URL finalization) — CLOSED
STILL OPEN: Omar to finish the CWS dashboard (upload the 5 store
screenshots, paste description + privacy URL from chrome-store-listing.md,
complete Distribution tab) and submit for review.


## Prompt 23 — Extension title decision (PM call, as requested)
Omar explicitly asked for the title decision to be made, not asked back.
DECISION: "Abrium — Claude Artifact Manager" — chosen because the
current title ("Abrium — Artifact Vault") is missing "Claude", the
single highest-value search keyword (title carries more CWS internal-
search weight than description), while still keeping the "Abrium" brand
consistent with GitHub/website/Patreon. ~32 chars, well under the 45-char
limit, no keyword stuffing. Alternates considered: "Abrium: Save &
Organize Claude Artifacts", "Abrium — Claude.ai Artifact Manager".
Implementation: edit ext_name in _locales/en/messages.json (and other
locales if translated titles are wanted), rebuild, re-upload the .zip
package via the CWS dashboard's Package tab.
STILL OPEN: Omar to make the edit + rebuild + re-upload; confirm the new
title shows correctly in the Store listing tab afterward.


## Prompt 23 — Title translation extended to all 5 locales (was EN-only)
Omar correctly questioned the earlier EN-only scoping — decided to
extend the "Abrium — Claude Artifact Manager" title translation across
ar/fr/es/pt too, for full per-locale CWS SEO benefit (each language gets
its own listing shown by browser locale). Prompt issued: translate
naturally per each locale's existing conventions (check sidepanel_title
for the established "Abrium — [descriptor]" pattern per language first),
keeping "Claude"/"Artifact(s)" untranslated in Latin script per the
already-established rule, only translating connecting words like
"Manager" naturally. Rebuild + re-zip (new distinct filename, not
overwriting the existing upload zip or the flagged dist.zip) + verify
against built output per locale.
STILL OPEN: awaiting Claude Code's 4 translated titles + build + new zip.


## Prompt 23 — Titles translated across all 5 locales (COMPLETE)
AR/FR/ES/PT ext_name translated, each matching that locale's established
grammatical pattern from ui.ts (AR idafa "أبريوم — [descriptor]", FR/ES/PT
postpositioned "de/do Claude"), all keeping Claude/Artifact(s) in Latin
script per convention. Build clean (51/51), verified in built dist/
output per locale, not just source. New zip:
abrium-extension-v0.1.0-i18n-titles-2026-08-05.zip (distinct name,
existing zips untouched).
Claude Code flagged sidepanel_title still says the old "Vault" wording
in every locale, creating a listing-title vs in-app-title mismatch.
DECISION: leave sidepanel_title as "Vault" — it's the established
brand metaphor used site-wide (website's ui.ts: "Everything the Vault
does", "Search the Vault", etc.). The CWS listing title uses "Manager"
for search/SEO purposes; "Vault" remains the friendly in-app name. This
marketing-name vs in-app-name split is intentional and common practice,
not an inconsistency to fix.
## ✅ PROMPT 23 (Extension title SEO — all 5 locales) — CLOSED
STILL OPEN: Omar to upload the new zip via CWS Package tab, then confirm
Privacy tab + finish submission.


## Prompt 24 — CWS submission complete
Extension title, descriptions, permission justifications, privacy URL,
distribution settings all completed and confirmed in the live CWS
preview. Arabic RTL screenshot recaptured after the translation fix
(was showing stale "الأعمال" wording from before the fix) and re-
uploaded — verified visually correct in the live preview (search field
and stats line both show "Artifacts" in Latin script).
Contact email verified (was blocking submission), item submitted for
review with auto-publish enabled.
## ✅ PROMPT 24 (Chrome Web Store submission — title, listing, privacy, distribution, screenshots) — CLOSED, item In Review


## Prompt 25 — Technical SEO task re-issued (never executed the first time)
Confirmed via fresh clone: the earlier robots.txt/OG-tags/
SoftwareApplication-schema/alt-text task was NEVER executed — it got
interrupted by the domain purchase + Vercel hosting detour before
Claude Code got to it. Now that abrium.onl is live and deployed, this
is the right time. Re-issued the full prompt: robots.txt (still
missing), OG/Twitter meta tags (still missing), SoftwareApplication
JSON-LD (still missing, alongside the existing Organization/Breadcrumb
schema which IS present), alt text audit. Instructed to commit+push
(auto-deploys via Vercel).
Also reminded: Google Search Console setup (domain property, DNS TXT
verification, sitemap submission, manual indexing requests) is a
manual/account-level task for Omar, now unblocked since the domain is
live — still pending, not yet done.
STILL OPEN: awaiting Claude Code's technical SEO implementation; Omar to
do Search Console setup manually.


## Prompt 25 — RESULTS: technical SEO done, committed+pushed (a922995), one decision made
1. robots.txt created, live, serving sitemap-index pointer.
2. OG/Twitter tags added to Layout.astro, reusing existing title/
   description/canonicalURL. Per-locale og:locale (en_US/ar_AR/fr_FR/
   es_ES/pt_PT). og-image.png (1200x630) composed via sharp from the
   existing abrium-lockup.png on the design token background (no
   rendered text — relies on the lockup's own wordmark/tagline).
3. SoftwareApplication JSON-LD built as a shared component
   (SoftwareApplicationSchema.astro) used by both index.astro and
   [lang]/index.astro so all 5 locales can't drift; description reads
   t('heroSub'). Existing Organization/Breadcrumb/FAQPage schema
   untouched.
4. Alt text audit found 3 real issues, all fixed: /download's popup.png
   had mismatched "Side panel" alt+caption (added a popup key across
   all 5 locales — visible copy change, now "Toolbar popup · 380px");
   Features screenshots used generic alt={f.title}, now describe the
   surface via existing f.frame data; header logo alt marked decorative
   (redundant next to the visible wordmark).
Also fixed in passing: Organization schema's logo pointed at a
nonexistent https://abrium.onl/logo.png — corrected to /assets/abrium-mark.png.
Verified: 46 pages built 0 errors, all JSON-LD blocks parse on 6 sampled
pages, live fetches confirm robots.txt/OG tags/ar_AR locale/
SoftwareApplication/og-image/sitemap all correct on the live site.
DECISION MADE: apex domain (abrium.onl) currently 308-redirects to www,
but ALL canonical/hreflang/og:url/sitemap URLs point to the apex —
meaning every SEO signal resolves through an extra redirect hop (risky
for social-scraper og:image reliability). Chose to flip Vercel's domain
config so abrium.onl becomes primary and www redirects to it, matching
what the code already declares everywhere, rather than rewriting all
canonical/hreflang/sitemap code to use www instead. Likely the same root
cause as the earlier deferred "DNS Change Recommended" notice on
www.abrium.onl.
STILL OPEN: Omar to flip the Vercel domain primary/redirect direction,
then commit + push (covers this task's changes plus any pending doc edits).


## Prompt 25 — COMMITTED AND PUSHED (5148056, then 9a4797c cleanup)
Technical SEO work (robots.txt, OG/Twitter tags, SoftwareApplication
schema, alt text fixes) pushed at 5148056. Two CWS upload zips had
accidentally been swept into that commit (same pattern as the earlier
dist.zip leak) — untracked and *.zip added to .gitignore, pushed at
9a4797c. Domain redirect direction also flipped in Vercel (abrium.onl
now primary/Production, www redirects to it) — matches all code's
canonical/hreflang references. www's remaining "DNS Change Recommended"
notice is optional (legacy CNAME still works per Vercel's own message),
deferred, non-blocking.
## ✅ PROMPT 25 (Technical SEO: robots.txt, OG tags, structured data, apex/www redirect fix) — CLOSED
Project status: website live at abrium.onl with full technical SEO,
extension submitted to Chrome Web Store (In Review), GitHub repo fully
optimized. Remaining backlog: Google Search Console setup (manual,
Omar), optional www CNAME update, external distribution (awesome-lists,
Reddit/Product Hunt) once extension is approved and live.


## Prompt 26 — Google Indexing API setup (Cloud Console)
Set up a Google Cloud service account (abrium-indexer) for the Web
Search Indexing API: project created, API enabled, service account +
JSON key generated, added as Owner in Search Console for abrium.onl.
JSON key stored locally on Omar's machine outside the repo (recommended
C:\Users\alext\secrets\), never shared in chat.
Prompt issued to Claude Code: write a Node.js script using googleapis +
google-auth-library to submit all live page URLs (derived from Astro's
actual routes, not hand-typed) to the Indexing API's URL_UPDATED
endpoint, with rate-limit handling and a dry-run mode first. Instructed
to add the credentials path pattern to .gitignore before creating
anything (same risk class as the earlier dist.zip leak, but for a real
credential this time). Claude Code prepares the script + dry-run only;
Omar runs the live submission himself.
STILL OPEN: awaiting Claude Code's script + dry-run output; Omar to
review the URL list then run the live submission.


## Prompt 26 — RESULTS: script written, .gitignore corruption recurred+fixed
Same UTF-16LE .gitignore corruption as Prompt 18 recurred (this time on
the *.zip lines added later via PowerShell Add-Content) — caught and
fixed BEFORE adding credential rules, verified via git check-ignore -v
(not assumed). Credential rules (credentials/, *.serviceaccount.json,
service-account*.json, gcp-*.json, .env*) confirmed actually matching.
Script: website/tools/submit-to-indexing-api.mjs. Dry-run by default,
--live required to fire. URL list derived from the real built sitemap
(dist/sitemap-index.xml), not hand-typed — fails loudly if dist/ is
missing. Key resolved via --key/env vars/credentials/ folder, path only
ever logged (never contents). Rate-limited (600ms between calls,
backoff on 429/500-504 only, immediate report on 403). googleapis kept
out of website/package.json deliberately (avoids bloating every Vercel
build for a script that runs once manually).
Dry run: 45 URLs (9 real pages x 5 languages, /404 correctly excluded
from sitemap so excluded here too).
Two notes raised, both already resolved/non-issues: (1) apex/www host —
already fixed in Prompt 25 (abrium.onl is primary, www redirects to it),
so the apex URLs in the dry run are correct as-is; (2) Indexing API's
official JobPosting/BroadcastEvent scope caveat — already understood,
treating this as a supplementary nudge alongside the already-submitted
sitemap, not a replacement.
Local commit 607559f, not pushed (not asked for). CLAUDE.md append left
uncommitted per established convention (respects this session's pending
doc edits).
STILL OPEN: Omar to run the live submission + commit/push.


## Prompt 26 — COMPLETE: 45/45 URLs submitted successfully
First attempt failed (403, API not yet propagated after enabling) —
waited ~5-10 min after confirming "Status: Enabled" in Cloud Console,
retried. Second attempt: 45/45 succeeded, 0 failed.
## ✅ PROMPT 26 (Google Indexing API setup + submission) — CLOSED
STILL OPEN: Omar to commit + push the script/gitignore fix from earlier
(local commit 607559f not yet pushed).
Project SEO status: robots.txt, OG/Twitter tags, structured data, apex
domain primary, sitemap submitted, manual + API indexing requests done.
Full SEO stack for abrium.onl now complete.


## Prompt 26 — PUSHED (607559f)
.gitignore encoding fix + Indexing API script pushed to main. Full SEO
stack for abrium.onl now complete and live: robots.txt, OG/Twitter tags,
structured data, apex domain primary, sitemap submitted, 45/45 URLs
confirmed accepted by the Indexing API.


## Prompt 27 — Google indexing confirmed working + homepage title fix + brand-suffix task
Confirmed via live `site:abrium.onl` Google search: 7 pages already
indexed within hours of the Indexing API submission (much faster than
the days/weeks initially expected) — homepage, /features, FR/ES/AR/PT
homepages, /changelog. Arabic result correctly shows "Artifact" in
Latin script.
Homepage <title>/og:title/twitter:title updated (single shared prop, no
drift) to "Abrium — Claude Artifact Manager & Local Catalog" — matches
the CWS listing title decision, fixes the missing "Artifact" keyword.
Verified in built dist/index.html. NOT yet committed/pushed.
Claude Code correctly refused to expand the EN-only scope to the other
inner pages (features/faq/download/contact) since their <title> reuses
the same ui.ts key as the visible H1 across all 5 languages — flagged
this as out of scope rather than silently doing it.
NEW FINDING (Claude Code): 5 of 8 inner pages have NO "Abrium" in their
title at all (title = bare H1 copy like "Get in touch"), losing brand
identity in SERPs. DECISION: approved a separate scoped fix — append
" · Abrium" suffix in Layout.astro's <title> rendering only (not
touching ui.ts H1 content, not touching any of the 5 languages' visible
copy), with an exception for the homepage (already has full custom
brand-inclusive title, must not double up).
STILL OPEN: awaiting Claude Code to commit+push the homepage title
change, then implement and verify the brand-suffix task.