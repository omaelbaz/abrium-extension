/**
 * Content script — claude.ai only.
 *
 * Watches the conversation for Artifact panels and hands what it finds to the
 * service worker. It does NOT write to storage itself: every write goes
 * through lib/storage.ts, which only the worker imports, so there is one
 * writer and the content script stays a pure reader (CLAUDE.md, Conventions).
 *
 * Nothing captured leaves the device. This file has no network access and
 * must never gain one.
 *
 * ⚠ The selector VALUES this depends on are unverified against a live
 * claude.ai page — see the banner in lib/extract.ts. The logic here is built
 * so that a wrong selector costs a missed capture, never a broken page.
 */

import { conversationIdFromUrl, sweep, deriveArtifactId } from '../lib/extract.ts';
import { readArtifacts } from '../lib/storage.ts';
import type { Artifact } from '../types/index.ts';

/** Coalesce DOM churn: Claude streams tokens, so mutations arrive constantly. */
const SWEEP_DEBOUNCE_MS = 700;

/**
 * A streaming artifact changes on every token. Capturing mid-stream would
 * store a truncated body, so a container must look unchanged for this long
 * before it is considered settled.
 */
const SETTLE_MS = 1200;

const READY_FLAG = '__abriumContentReady';

/** Ids already sent this page-load, with the content hash we sent for them. */
const sentContent = new Map<string, number>();

let sweepTimer: number | undefined;
let lastSeenSignature = '';
let lastSignatureAt = 0;

function alreadyInjected(): boolean {
  const scope = globalThis as unknown as Record<string, boolean | undefined>;
  if (scope[READY_FLAG]) return true;
  scope[READY_FLAG] = true;
  return false;
}

/** Cheap stability probe — total source length across all captured artifacts. */
export function signatureOf(artifacts: readonly Artifact[]): string {
  return artifacts.map((artifact) => `${artifact.id}:${artifact.bytes}`).join('|');
}

export function contentHash(artifact: Artifact): number {
  // Only used to decide "did this change since we last sent it".
  return artifact.bytes * 31 + artifact.content.length;
}

/**
 * Send artifacts to the worker and confirm what actually landed.
 *
 * Verifies the OUTCOME rather than the absence of an error: the worker replies
 * with how many records it really wrote, and a mismatch is logged loudly.
 * "No exception" has hidden two real bugs in this project already.
 */
async function persist(artifacts: readonly Artifact[]): Promise<void> {
  if (artifacts.length === 0) return;
  try {
    const response: unknown = await chrome.runtime.sendMessage({
      type: 'capture:artifacts',
      artifacts,
    });
    const result = response as { ok?: boolean; written?: number; reason?: string } | undefined;

    if (!result?.ok) {
      console.error('[abrium] Worker rejected the capture', result?.reason ?? '(no reason)');
      return;
    }
    if (result.written !== artifacts.length) {
      console.error(
        '[abrium] Sent %d artifacts but the worker wrote %d — capture is incomplete',
        artifacts.length,
        result.written,
      );
      return;
    }
    for (const artifact of artifacts) sentContent.set(artifact.id, contentHash(artifact));
    console.info('[abrium] Captured %d artifact(s)', result.written);
  } catch (error) {
    // The worker can be asleep or the extension mid-reload; neither is fatal
    // and the next sweep will retry, because sentContent was not updated.
    console.warn('[abrium] Could not reach the service worker', error);
  }
}

/** Run a sweep, filter to what is new or changed, and persist it. */
async function runSweep(): Promise<void> {
  const href = location.href;
  if (!conversationIdFromUrl(href)) {
    // Not a conversation page (settings, project list…). Nothing to capture.
    return;
  }

  const result = sweep(document, { href });

  if (result.skipped['no-source'] > 0) {
    let showHint = true;
    if (result.previewCandidates && result.previewCandidates.length > 0) {
      try {
        const stored = await readArtifacts();
        const currentConversationId = conversationIdFromUrl(href);
        
        const allCandidatesExist = result.previewCandidates.every(candidate => {
          return stored.some(art => {
            if (art.conversationId !== currentConversationId) return false;
            
            if (candidate.stableId) {
              const derivedId = deriveArtifactId({
                stableId: candidate.stableId,
                conversationId: currentConversationId,
                title: candidate.title,
                type: art.type,
                content: art.content
              });
              return derivedId === art.id;
            }
            
            return art.title === candidate.title && candidate.title !== 'Untitled artifact';
          });
        });

        if (allCandidatesExist) {
          showHint = false;
        }
      } catch (err) {
        console.warn('[abrium] Failed to check storage for preview hint suppression', err);
      }
    }

    if (showHint) {
      try {
        chrome.runtime.sendMessage({ type: 'capture:preview_hint' });
      } catch {}
    }
  }

  if (result.containersSeen > 0 && result.artifacts.length === 0) {
    // The containers matched but nothing could be read out of them: that is
    // the shape of a source-selector break, and it must not be silent.
    console.error(
      '[abrium] Found %d artifact container(s) but extracted none — selectors may be stale. Skipped: %o',
      result.containersSeen,
      result.skipped,
    );
    return;
  }

  // Wait for the DOM to stop moving before trusting the content.
  const signature = signatureOf(result.artifacts);
  const now = Date.now();
  if (signature !== lastSeenSignature) {
    lastSeenSignature = signature;
    lastSignatureAt = now;
    scheduleSweep();
    return;
  }
  if (now - lastSignatureAt < SETTLE_MS) {
    scheduleSweep();
    return;
  }

  const fresh = result.artifacts.filter(
    (artifact) => sentContent.get(artifact.id) !== contentHash(artifact),
  );
  await persist(fresh);
}

function scheduleSweep(): void {
  window.clearTimeout(sweepTimer);
  sweepTimer = window.setTimeout(() => {
    void runSweep();
  }, SWEEP_DEBOUNCE_MS);
}

/**
 * Observe the whole document.
 *
 * Scoping to a narrower root would need another selector to be correct, and a
 * wrong one would silently observe nothing. Watching document.body costs a
 * debounce and cannot miss a panel that mounts somewhere unexpected.
 */
function startObserver(): void {
  const observer = new MutationObserver(() => {
    scheduleSweep();
  });
  try {
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  } catch (error) {
    console.error('[abrium] Could not start the artifact observer', error);
  }
}

/** claude.ai is a SPA: a conversation switch changes the URL, not the page. */
function watchNavigation(): void {
  let lastHref = location.href;
  window.setInterval(() => {
    if (location.href === lastHref) return;
    lastHref = location.href;
    // A different conversation means different artifacts; ids are content-
    // derived, so clearing only costs one redundant write at worst.
    sentContent.clear();
    lastSeenSignature = '';
    scheduleSweep();
  }, 1000);
}

function main(): void {
  // A SPA navigation can re-run the script in some Chrome versions; a second
  // observer would double every sweep.
  if (alreadyInjected()) return;

  chrome.runtime.onMessage.addListener((message: { type?: string }, _sender, sendResponse) => {
    if (message?.type === 'content:ping') {
      sendResponse({ ok: true, href: location.origin });
      return false;
    }
    if (message?.type === 'content:rescan') {
      // Lets the side panel ask for a re-read without a page refresh.
      sentContent.clear();
      lastSeenSignature = '';
      scheduleSweep();
      sendResponse({ ok: true });
      return false;
    }
    return false;
  });

  startObserver();
  watchNavigation();

  // Artifacts already on the page at load time are captured too — the observer
  // alone would only ever see ones that appear afterwards.
  scheduleSweep();

  if (import.meta.env.DEV) {
    console.info('[abrium] Content script ready on %s', location.origin);
  }
}

main();
