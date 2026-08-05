# Chrome Web Store Listing — Abrium

Everything on this page is ready to paste into the Chrome Web Store developer
dashboard. Sections marked **[from manifest]** cannot be edited in the
dashboard — they come from the uploaded package, so changing them means editing
`_locales/<lang>/messages.json`, running `pnpm build`, and re-uploading the ZIP.

---

## 1. Title **[from manifest]**

**`Abrium — Artifact Vault`** (23 chars) — keep as-is.

Source: `_locales/en/messages.json` → `ext_name`, referenced by
`manifest.json`'s `"name": "__MSG_ext_name__"`. Each locale supplies its own.

An earlier draft of this file proposed **"Abrium: Claude Artifacts Manager"**
for keyword reach. Not recommended:

- CWS policy prohibits keyword-loaded names, and putting another company's
  product name in your extension's *title* is the highest-risk place to do it
  ("Impersonation and Intellectual Property" — an extension must not imply
  affiliation with or endorsement by the brand it works with).
- Titles carry almost no ranking weight next to install velocity, ratings and
  retention. The keyword belongs in the description, where it is allowed and
  where it reads naturally.

If the keyword in the title is still wanted, `Abrium — Artifact Vault for Claude`
(35 chars) is the safer construction — "for X" is the conventional
non-affiliation phrasing — but it is more review risk than the current name for
no measurable gain.

## 2. Summary / short description **[from manifest]**

> Catalog your Claude.ai artifacts locally. No accounts, no tracking, nothing leaves your browser.

95 / 132 chars. Leads with the action, closes on the differentiator, no
stuffing. No change recommended. All five locales are within the limit (longest
is `pt` at ~103).

## 3. Detailed description (editable in the dashboard)

The previous draft of this section was keyword-stuffed and would have been a
policy risk: it bolded four exact-match search phrases (`claude artifacts
manager`, `save claude ai code`, `claude.ai export extension`, `claude artifact
download`) and bent sentences around them ("Are you looking to save claude ai
code without tedious copying…"). CWS explicitly prohibits repetitive or
unnatural keyword use in listings. The version below says the same things in
plain language, still naturally contains every relevant term, and adds a
"good to know" note about Code view that should cut 1-star "it didn't save
anything" reviews.

```
Abrium keeps a local catalogue of the artifacts you generate on claude.ai —
code files, HTML pages, SVG graphics, React components and Markdown documents.

When an artifact panel is open in Code view, Abrium reads it from the page and
saves a copy to your browser's own storage. Nothing is uploaded. There is no
account to create, no server to trust, and no analytics of any kind — the
extension makes no network requests at all.

WHAT YOU GET
• A side-panel gallery of everything you've saved, with search and filtering by type
• A toolbar popup showing your five most recent artifacts
• A detail view with the full source, the file size, and a link back to the conversation it came from
• Download a single file, or select several and export them together as one ZIP
• Pin the artifacts you keep coming back to
• A JSON backup of your whole vault, whenever you want it

PRIVATE BY DESIGN
Abrium only runs on claude.ai and cannot read any other site. Everything it
saves stays in your browser's local extension storage on your own machine, and
you can delete any item — or export the lot — at any time. It asks for the
minimum permissions needed to do that: local storage, and permission to read
the claude.ai page you already have open.

FIVE LANGUAGES
English, العربية, Français, Español and Português — with a genuine
right-to-left layout in Arabic, not mirrored text.

FREE AND OPEN SOURCE
Abrium is free, has no paid tier, and is MIT-licensed. The full source is at
github.com/omaelbaz/abrium-extension

GOOD TO KNOW
Abrium saves an artifact while its panel is open in Code view — that is where
the source actually exists in the page. If Preview is selected instead, the
side panel will tell you to switch.
```

## 4. Category

**Developer Tools.** Unchanged from the earlier draft and still the right call:
the people saving code, SVGs and React components are developers and designers,
and the category is less crowded than Productivity.

## 5. Screenshots

Captured this session at **1280×800** (the Chrome Web Store's preferred size)
and saved to `website/public/assets/screenshots/store-listing/`. These are the
real shipping UI — the actual side panel and popup controllers running against
the fixture vault via `tools/dev-harness.html` — rendered at 1:1 CSS pixels on
a brand-coloured canvas. Nothing is upscaled, mocked up, or drawn.

| File | Shows | Caption to use |
|---|---|---|
| `01-side-panel-gallery.png` | Gallery, 6 artifacts, type filters, storage total | Every artifact you've generated, in one searchable side panel. |
| `02-side-panel-filter.png` | "Code" filter active, 2 matching cards | Filter by type — code, HTML, SVG, React or Markdown. |
| `03-batch-export.png` | Batch mode, all selected, Export / Download ZIP bar | Select several artifacts and export them as one ZIP. |
| `04-popup.png` | Toolbar popup, 5 most recent | A toolbar popup with your five most recent saves. |
| `05-side-panel-arabic-rtl.png` | Arabic UI, full RTL layout | Five languages, including a real right-to-left Arabic layout. |

Upload order matters — the first image is the one shown in search results, so
upload `01` first.

## 6. Privacy practices tab

### Single purpose

> Abrium saves the artifacts a user generates on claude.ai to local browser
> storage, and lets them browse, search, and export those saved artifacts.

### Permission justifications

One per declared permission — these match `manifest.json` exactly (audited this
session; see §7).

| Field | Justification |
|---|---|
| `storage` | Abrium stores each saved artifact, plus the user's language and theme preference, in chrome.storage.local. This is the only place the extension keeps anything; no data is sent anywhere. |
| `unlimitedStorage` | Saved artifacts are full source files and a user's collection grows over time. Without this, chrome.storage.local's default quota would be reached and further saves would silently fail. |
| `sidePanel` | The main interface — the artifact gallery, detail view and settings — is a Chrome side panel. This permission is required to register the panel and to open it from the toolbar popup. |
| Host permission `https://claude.ai/*` | Abrium's content script reads the title and source text of an open artifact out of the claude.ai page so it can save a local copy. It is scoped to claude.ai only and reads no other site. |
| Remote code | **No.** All code, including the JSZip library used for ZIP export, is bundled in the package. Nothing is fetched or evaluated at runtime. |

### Data collection disclosure

Abrium reads website content (the artifact source on the page) but never
transmits it — it is written to `chrome.storage.local` on the user's own machine
and stays there. The extension contains no `fetch`, `XMLHttpRequest` or
`WebSocket` call anywhere (enforced by a CI check, `pnpm check:no-network`), so
nothing leaves the device. On that basis the "data collected" boxes are
answerable as none, and all three certification checkboxes (not sold to third
parties, not used outside the single purpose, not used for
creditworthiness/lending) are true. **This declaration is Omar's to make** — the
technical facts above are what it rests on.

### Privacy policy URL

**`https://abrium.onl/privacy`** — use this. The domain is purchased, DNS is
connected, and Vercel shows a valid HTTPS configuration; the page is live
(confirmed by direct fetch this session) at `/privacy`, plus the localized
`/ar/privacy`, `/fr/privacy`, `/es/privacy`, `/pt/privacy` routes. The earlier
temporary `*.vercel.app/privacy` placeholder is no longer needed.

---

## 7. Permission audit (done this session)

Every declared permission was checked against actual `chrome.*` usage in `src/`.

| Declared | Used by | Verdict |
|---|---|---|
| `storage` | `src/lib/storage.ts` (get / set / remove / getBytesInUse / onChanged) | **Justified** |
| `unlimitedStorage` | No API call — declarative quota lift. Required by design: one storage key per artifact, holding full source text. | **Justified** |
| `sidePanel` | `background/service-worker.ts` (`setPanelBehavior`, `open`), `ui/popup/popup.ts` (`open`) | **Justified** |
| `host_permissions: https://claude.ai/*` | No API consumes it directly — see note | **Keep** |

**Note on `host_permissions`.** Nothing in the codebase strictly requires it:
there are no `chrome.tabs`, `chrome.scripting`, `chrome.cookies` or
`chrome.webRequest` calls and no network requests at all, and the content script
is declared statically in `content_scripts.matches`, which grants injection on
its own in MV3. It is therefore technically redundant. It is still worth
keeping: Chrome generates the same "Read and change your data on claude.ai"
install warning from the content-script match pattern regardless, so removing it
buys no improvement in the install prompt, while removing it would break any
future direct `chrome.tabs`/`scripting` use with a failure that is easy to
misdiagnose. Declared-but-unused is only a review liability when it *widens* the
warning, which this does not.

**What is NOT requested**, and is worth saying in review if asked: `tabs`,
`activeTab`, `scripting`, `downloads`, `cookies`, `webRequest`, `<all_urls>`.
Downloads use a blob URL and an `<a download>` element, so the `downloads`
permission is not needed at all. This is a genuinely small permission set for
what the extension does.

## 8. Flagged for Omar (no changes made)

1. **Arabic name translates "Artifact".** `_locales/ar` uses
   `أبريوم — خزانة الأعمال` / `أعمال Claude.ai`, i.e. "works" rather than the
   Claude product term. The documented terminology decision (CLAUDE.md,
   Prompt 8.x) is that *Artifact* stays untranslated in all five languages,
   because that is what users see in claude.ai's own UI. `fr`/`es`/`pt` use
   artefacts/artefactos/artefatos, which is standard; only `ar` diverges.
   Changing it means editing `_locales/ar/messages.json` and re-uploading.
2. **Header count vs. filtered list.** Visible in `02-side-panel-filter.png`:
   with the Code filter active and two cards shown, the header still reads
   "6 artifacts · 2 kB". That is by design — the header reports the whole
   vault's total and its real `getBytesInUse()` figure, not the filtered subset
   — but in a store screenshot it can read as an off-by-N bug to someone seeing
   the UI for the first time. Not changed; flagging only.
