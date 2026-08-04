# Abrium — Project Spec

## 🧠 PROJECT BRAIN

```
📌 Name:      Abrium
🏷️  Type:     Browser Extension (Utility / Productivity)
🖥️  Platform: Web (Chrome only, Manifest V3 — Chrome Web Store submission
              only; not testing or submitting to Edge Add-ons at this
              stage, even though the code happens to be Chromium-compatible)
⚙️  Language: TypeScript
📦 Framework: Vanilla + Vite (no React needed — keeps bundle tiny, faster review approval)
🌍 Users:     Developers, writers, and researchers who use claude.ai daily and
              lose track of the code/docs/files Claude generates as Artifacts
🌐 i18n:      Multilanguage at launch (v1.0) — English, Arabic (RTL),
              French, Spanish, Portuguese. Full RTL layout for Arabic,
              not just translated strings.
🔌 API:       NONE — 100% DOM scraping + chrome.storage.local. Zero backend,
              zero hosting cost, zero API key exposure risk.
🌐 Domain:    abrium.onl
```

---

## 🔍 FEATURE BREAKDOWN

| # | Feature | Layer | Priority | Complexity |
|---|---------|-------|----------|------------|
| 1 | Detect & index artifacts on claude.ai pages (content script) | Core/DOM | 🔴 | M |
| 2 | Gallery view (popup or side panel) listing all captured artifacts | UI | 🔴 | M |
| 3 | Filter by type (code, HTML, SVG, Markdown, React) | UI | 🔴 | S |
| 4 | Filter/search by conversation title, date, keyword | UI | 🔴 | M |
| 5 | Single-click download (original file extension inferred) | Core | 🔴 | S |
| 6 | Batch select + batch download (zipped) | Core | 🔴 | M |
| 7 | Pin / favorite artifacts | UI | 🔴 | S |
| 8 | Version history per artifact (when Claude iterates on the same one) | Core/DOM | 🟡 | L |
| 9 | Local-only storage, no sync, no account | Data | 🔴 | S |
| 10 | Dark/light theme matching claude.ai | UI | 🔴 | S |
| 11 | Keyboard shortcut to open Vault (Cmd/Ctrl+Shift+A) | UX | 🟡 | S |
| 12 | Export vault index as JSON (backup/portability) | Data | 🔴 | S |
| 13 | Donation link (external, static) in settings/about | UX | 🟢 | S |

Priority: 🔴 Must have (v1.0) · 🟡 Should have (v1.1) · 🟢 Nice to have (v1.2+)

---

## ⏱️ ESTIMATE

```
Phase 1 — Core capture engine (content script + storage schema): 6–9 hrs
Phase 2 — Gallery UI (popup/side panel, filters, search):         8–12 hrs
Phase 3 — Download/export (single + batch zip):                   4–6 hrs
Phase 4 — Polish (theming, shortcuts, empty/error states):         4–6 hrs
Phase 5 — i18n (5 languages incl. Arabic RTL, chrome.i18n setup, real
           translations, RTL layout QA):                          8–12 hrs
Phase 6 — QA + testing (unit tests, all UI states × 5 languages,
           claude.ai DOM edge cases, keyboard nav, WCAG AA contrast
           check, screen reader pass on RTL):                      8–11 hrs
─────────────────────────────────────────────────────────────────────────
Total v1.0 (🔴 only, includes multilanguage + testing + a11y +
     batch/pin/export now in scope since everything ships free):  44–62 hrs
Total incl. 🟡 (v1.1 version history):                             +5–8 hrs
```

---

## ⚠️ RISK ANALYSIS

```
🔴 claude.ai changes its DOM structure/class names → capture breaks
   mitigation: scrape by stable semantic attributes (data-testid, role)
   over class names; add a "capture health check" that alerts you (the
   dev) via a silent console flag, not the user, when selectors miss.

🔴 Manifest V3 content-script permissions get flagged in Chrome Web
   Store review (reads page content on claude.ai only)
   mitigation: scope host_permissions strictly to https://claude.ai/*,
   write a clear, honest privacy justification in the listing —
   "reads only visible Claude Artifact content on claude.ai, stores
   locally, sends nothing anywhere."

🟡 Artifacts embedded in iframes (Claude sometimes renders code/HTML
   previews in a sandboxed iframe) are harder to scrape directly
   mitigation: capture the underlying source (visible in the "Code"
   tab of the artifact panel) rather than the rendered iframe output.

🟡 Users expect cloud sync across devices — local-only won't cover that
   mitigation: be explicit in the listing that v1.0 is local-only;
   offer optional JSON export/import as a manual sync workaround;
   revisit only if there's real demand (adds real backend cost).

🟢 Chrome Web Store "New Products" review queue can take 1–3 weeks
   mitigation: submit early, keep iterating on a dev-mode build in
   parallel.
```

---

## 🧩 ARCHITECTURE

```
claude.ai page
   │
   ▼
Content Script (TypeScript)
   — MutationObserver watches for artifact panels
   — Extracts: title, type, language, code/content, conversation URL, timestamp
   │
   ▼
chrome.storage.local  (IndexedDB-backed, no size worries for text)
   — schema: { id, convoId, convoTitle, type, content, capturedAt, pinned }
   │
   ▼
Extension UI (Popup or Side Panel — chrome.sidePanel API)
   — Gallery grid, search/filter, download, batch zip (JSZip, bundled locally)
```

No servers. No API calls. No accounts. Everything above the dotted line never leaves the user's machine.

---

## 🌐 Abrium Marketing Website (abrium.onl) — SEPARATE from the extension

**Important scope note:** the browser extension itself stays 100% API-free
and local-only (this is a core trust/privacy selling point — never
compromise it). SEO and Google Search Console are properties of the
**marketing website**, a completely separate codebase/deployment that
promotes and links to the extension. They must never be merged into the
extension's codebase or its Chrome Web Store permissions.

### Website stack
```
📌 Domain:     abrium.onl
🏷️  Type:      Static marketing/landing site (NOT the extension)
📦 Framework:  Next.js (static export) or Astro — either is SEO-friendly
               and fast; Astro is lighter if the site stays mostly static
🌍 Hosting:    Vercel, Netlify, or Cloudflare Pages (free tier is enough)
```

### SEO requirements
- Semantic HTML, proper heading hierarchy (single H1 per page)
- Meta title/description per page, Open Graph + Twitter Card tags
- `sitemap.xml` and `robots.txt` generated at build time
- Fast Core Web Vitals: static export means near-instant LCP; keep JS
  minimal, no heavy client-side frameworks for content pages
- Structured data (schema.org `SoftwareApplication`) so Google can show
  rich results (ratings, price "Free")
- Content pages worth SEO investment: homepage, `/features`, `/faq`,
  `/privacy` (privacy page matters a lot here — searchers comparing
  Claude tools care about "does this send my data anywhere")
- Target keywords: "Claude artifacts manager", "save Claude ai code",
  "claude.ai export extension", "claude artifact download" — validate
  actual search volume before committing copy around them
- Multilingual SEO: separate URL paths per language (`/fr/`, `/ar/`,
  `/es/`, `/pt/`) with `hreflang` tags — matches the extension's 5-language
  scope and multiplies discoverability

### Google Analytics / Cookie Consent — MANDATORY, non-negotiable
- GA4 must NOT fire until the visitor has actively accepted cookies —
  no "implied consent," no analytics script loading before the banner
  is answered
- Consent banner requirements:
  - Shown on first visit, blocking nothing else on the page (site stays
    fully usable/readable without answering it)
  - Two clear buttons: **Accept** and **Reject** (not just "Accept" with
    reject buried in settings — that pattern is itself a GDPR violation)
  - Choice is remembered (localStorage or a first-party cookie) so the
    banner doesn't reappear every visit
  - Available in all 5 launch languages, matching the site's i18n
  - Reject means GA truly never loads for that session — not loaded-
    then-anonymized, actually not requested
- A simple "Cookie Preferences" link in the footer lets visitors change
  their choice later
- This is a legal requirement, not a nice-to-have — the site does not
  ship without it if GA is enabled

### Sitemap — full page list (each × 5 languages)
```
/                    (Home)
/features
/faq
/download            (dedicated install page, own SEO target)
/changelog           (per-update entries, builds trust + freshness signal)
/privacy
/terms
/contact             (contact form or visible email)
/cookie-preferences  (page or modal, reachable from footer link)
/404
```

### Structured Data (schema.org) — per page, not just homepage
- `/` → `SoftwareApplication` (rating, price "Free", category)
- `/faq` → `FAQPage` (enables Google's expandable Q&A rich result)
- `/download` → `SoftwareApplication` + `AggregateRating` if Chrome Web
  Store ratings are available to pull in
- `/changelog` → `ItemList` or per-entry `Article` with `datePublished`
  (signals an actively maintained project)
- All pages → `BreadcrumbList` for path display in search results
- Site-wide (once, in layout) → `Organization` (name, logo, social links)
- Every schema block must set `inLanguage` matching the page's actual
  locale, consistent with its `hreflang` tags — mismatches confuse
  Google about which language version is which

### Canonical URLs & hreflang — required to avoid duplicate content
- Every page has a self-referencing `<link rel="canonical">` pointing
  to its own URL (including its language path)
- `hreflang` tags on every page linking to all 5 language versions of
  that same page, plus `hreflang="x-default"` pointing to the English
  version — this tells Google which version to show visitors whose
  language isn't one of the 5 supported
- Without this, 5 near-identical pages per URL risk being flagged as
  duplicate content and diluting ranking instead of multiplying reach

### Rich Results validation — required before launch
- Every schema.org block (SoftwareApplication, FAQPage, BreadcrumbList,
  Organization, ItemList) must be tested with Google's Rich Results
  Test (search.google.com/test/rich-results) before the site goes live
  — invalid schema doesn't just fail silently, it can suppress the
  rich result entirely

### Chrome Web Store listing SEO — separate from website SEO
The Chrome Web Store has its own internal search/ranking, independent
of Google Search:
- Title and description need precise keyword placement (e.g. "claude
  artifacts", "save code claude ai") — the store's search algorithm
  weighs this differently than Google's
- Correct **category** selection (Productivity vs Developer Tools) —
  affects both browse discovery and internal ranking
- First 2-3 lines of the description matter most — shown before the
  "read more" fold, and disproportionately weighted for CTR
- Screenshots and their captions are also indexed/considered — not
  purely decorative

### Off-page / backlink strategy (launch-phase, not build-phase)
- **Product Hunt launch** — strong backlink + traffic spike, timed
  after the extension is stable with real reviews
- **GitHub README, SEO-considered** — since the repo is public/MIT,
  the README itself gets indexed by Google; write it with the same
  keyword awareness as the website copy, not as an afterthought
- **Dev.to / Hashnode "How I built Abrium" post** — backlink + author
  authority, doubles as marketing content

### Google Search Console integration
- Verify domain ownership via DNS TXT record (not HTML file — cleaner
  for a domain you control)
- Google Search Console **API** is only needed if you want to pull
  ranking/impression data programmatically (e.g., into a personal
  dashboard). For most needs, the GSC **web UI** alone is enough and
  requires zero code.
- If the API is genuinely wanted (automated reporting):
  - OAuth 2.0 credentials created in Google Cloud Console, scoped to
    `webmasters.readonly`
  - This lives in a small, separate reporting script/serverless
    function — NOT in the extension, NOT in the public website's
    client-side code (OAuth secrets must never ship to a browser)
  - Realistic effort: 2–3 hrs for a basic script that pulls weekly
    query/impression data into a spreadsheet or simple dashboard

### Estimate addition
```
Phase 7 — Marketing website (abrium.onl): 10-page sitemap × 5 languages,
          full schema.org coverage + Rich Results validation, canonical/
          hreflang setup, GA4 + cookie consent banner, SEO setup, GSC
          verification, Chrome Web Store listing copy:            18–26 hrs
Phase 8 — GSC API reporting script (optional, if automated
          reporting is actually wanted):                          2–3 hrs
```

---

## 🗺️ Information Architecture & User Flows

### Extension IA
```
Toolbar Icon Click
├── Popup (quick view)
│   ├── Search bar
│   ├── Last 5 artifacts
│   └── "View full Vault" → opens Side Panel
└── Keyboard shortcut → opens Side Panel directly

Side Panel (full Gallery)
├── Header: Search + Filter chips (All/Code/HTML/MD/SVG/React)
├── Grid/List: all artifacts
│   └── each card → Artifact Detail View
├── Batch selection mode → bottom action bar
└── Settings/About (corner icon)
    ├── Language selector
    ├── Theme toggle
    ├── Support link (Patreon)
    ├── Export backup (JSON)
    └── Cookie/Privacy info
```

### Website IA (abrium.onl)
```
Home
├── → Features
├── → FAQ
├── → Download (primary CTA)
├── Footer
│   ├── → Privacy / Terms
│   ├── → Changelog
│   ├── → Contact
│   └── → Cookie Preferences
```

### Core User Flows
1. **First use**: install extension → visit claude.ai → generate a
   Claude artifact → extension auto-captures it silently (zero user
   action required) → small badge on toolbar icon shows new count
2. **Finding an old artifact**: click icon → Popup → search → if not
   found, "View full Vault" → Side Panel with finer filters
3. **Batch download**: Side Panel → select mode → pick multiple items
   → "Download as ZIP"
4. **Data-loss prevention nudge**: after 20+ artifacts captured, a
   gentle "Export a backup" reminder → click → JSON downloads

Wireframes/mockups for the above are produced in Fable (Prompt 0),
using this IA and these flows as the source of truth.

---

## 📦 CLAUDE.md (drop this in your repo root for Claude Code)

```markdown
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
```

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
you need."); AR / homepage hero shows "لا تفقد أي Artifact من كلود بعد
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