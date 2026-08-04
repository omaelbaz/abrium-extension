/**
 * MV3 service worker — install/update hooks, side-panel behaviour, and the
 * message channel the content script will use once capture lands.
 *
 * No network access, no remote config, no analytics. The worker only ever
 * talks to chrome.* and to the extension's own surfaces.
 *
 * IMPORTS MUST BE STATIC. `import()` is disallowed in ServiceWorkerGlobalScope
 * by the HTML spec (w3c/ServiceWorker#1356) — in a module worker too, so
 * `"type": "module"` does not unlock it. A dynamic import here previously threw
 * at runtime and silently skipped dev seeding for three prompts. Verified
 * against real module service workers: dynamic throws, static works.
 */

import { seedDevFixtures } from './dev-seed.ts';
import { storeCaptured } from './capture-intake.ts';

const SIDE_PANEL_PATH = 'src/ui/sidepanel/index.html';

/** Only claude.ai may send captures. */
const CAPTURE_ORIGIN = 'https://claude.ai';

/** Clicking the toolbar icon opens the popup (action.default_popup). */
async function configureSidePanel(): Promise<void> {
  try {
    await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
  } catch (error) {
    console.error('[abrium] Could not configure side panel behaviour', error);
  }
}

/* -------------------------------------------------------------------------
   Lifecycle
   ------------------------------------------------------------------------- */

chrome.runtime.onInstalled.addListener((details) => {
  void configureSidePanel();
  if (details.reason === 'install' || details.reason === 'update') {
    void seedDevFixtures();
  }
});

chrome.runtime.onStartup.addListener(() => {
  void configureSidePanel();
});

/**
 * Message router. The content script has nothing to send yet; this establishes
 * the channel and, critically, replies to every message so senders never hang
 * on a dropped port.
 */
type WorkerMessage =
  | { type: 'ping' }
  | { type: 'open-side-panel'; windowId?: number }
  | { type: 'capture:artifacts'; artifacts?: unknown };

chrome.runtime.onMessage.addListener((message: WorkerMessage, sender, sendResponse) => {
  switch (message?.type) {
    case 'ping': {
      sendResponse({ ok: true, path: SIDE_PANEL_PATH });
      return false;
    }
    case 'open-side-panel': {
      const windowId = message.windowId;
      if (windowId === undefined) {
        sendResponse({ ok: false, reason: 'missing_window_id' });
        return false;
      }
      chrome.sidePanel
        .open({ windowId })
        .then(() => sendResponse({ ok: true }))
        .catch((error: unknown) => {
          console.error('[abrium] Could not open side panel', error);
          sendResponse({ ok: false, reason: 'open_failed' });
        });
      return true; // async response
    }
    case 'capture:artifacts': {
      // Captures may only come from a claude.ai frame.
      if (sender.origin !== undefined && sender.origin !== CAPTURE_ORIGIN) {
        console.warn('[abrium] Ignoring capture from unexpected origin', sender.origin);
        sendResponse({ ok: false, reason: 'bad_origin' });
        return false;
      }
      storeCaptured(message.artifacts)
        .then(({ written, rejected }) => sendResponse({ ok: true, written, rejected }))
        .catch((error: unknown) => {
          console.error('[abrium] Capture intake failed', error);
          sendResponse({ ok: false, reason: 'store_failed' });
        });
      return true; // async response
    }
    default: {
      sendResponse({ ok: false, reason: 'unknown_message' });
      return false;
    }
  }
});
