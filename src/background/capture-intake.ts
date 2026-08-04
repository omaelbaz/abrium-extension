/**
 * Capture intake — validation and persistence for artifacts sent by the
 * content script.
 *
 * Lives outside service-worker.ts so it can be imported and tested directly:
 * the worker itself cannot be exercised outside Chrome, and this is the code
 * that decides what actually reaches the user's vault.
 *
 * Imports are static; the worker that consumes this may not use `import()`
 * (see the banner in service-worker.ts).
 */

import { readArtifact, saveArtifact } from '../lib/storage.ts';
import { ARTIFACT_TYPES } from '../types/index.ts';
import type { Artifact } from '../types/index.ts';

/**
 * Per-artifact ceiling. A runaway page could otherwise push the vault into
 * quota failure; unlimitedStorage raises the ceiling but does not remove the
 * disk. 2 MB is far above any real artifact.
 */
const MAX_CONTENT_BYTES = 2 * 1024 * 1024;

/* -------------------------------------------------------------------------
   Capture intake
   ------------------------------------------------------------------------- */

/**
 * Validate one incoming record.
 *
 * The content script runs in a page the user visited, so its messages are
 * treated as untrusted input: shape-checked and clamped before anything is
 * written. A malformed record is dropped, never stored.
 */
export function sanitizeIncoming(value: unknown): Artifact | null {
  if (typeof value !== 'object' || value === null) return null;
  const candidate = value as Record<string, unknown>;

  const id = candidate['id'];
  const title = candidate['title'];
  const filename = candidate['filename'];
  const content = candidate['content'];
  const type = candidate['type'];
  const createdAt = candidate['createdAt'];

  if (typeof id !== 'string' || !/^art_[A-Za-z0-9_-]{1,80}$/.test(id)) return null;
  if (typeof title !== 'string' || typeof filename !== 'string') return null;
  if (typeof content !== 'string' || content.length === 0) return null;
  if (!ARTIFACT_TYPES.includes(type as never)) return null;
  if (typeof createdAt !== 'number' || !Number.isFinite(createdAt)) return null;

  const bytes = new TextEncoder().encode(content).length;
  if (bytes > MAX_CONTENT_BYTES) {
    console.warn('[abrium] Refusing oversized artifact %s (%d bytes)', id, bytes);
    return null;
  }

  const language = candidate['language'];
  const conversationId = candidate['conversationId'];

  return {
    id,
    title: title.slice(0, 200),
    filename: filename.slice(0, 120),
    type: type as Artifact['type'],
    language: typeof language === 'string' ? language.slice(0, 40) : null,
    content,
    bytes,
    createdAt,
    conversationId:
      typeof conversationId === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(conversationId)
        ? conversationId
        : null,
    pinned: false,
  };
}

/**
 * Persist a batch and report how many records are genuinely in storage.
 *
 * Each write is read back rather than assumed: a resolved set() is not proof
 * the record landed, and this project has already shipped one bug founded on
 * that assumption (CLAUDE.md, Code Quality).
 */
export async function storeCaptured(incoming: unknown): Promise<{ written: number; rejected: number }> {
  if (!Array.isArray(incoming)) return { written: 0, rejected: 0 };

  let written = 0;
  let rejected = 0;

  for (const raw of incoming) {
    const artifact = sanitizeIncoming(raw);
    if (!artifact) {
      rejected += 1;
      continue;
    }
    try {
      // Preserve a pin the user already set on an earlier revision.
      const existing = await readArtifact(artifact.id);
      await saveArtifact(existing ? { ...artifact, pinned: existing.pinned } : artifact);

      const stored = await readArtifact(artifact.id);
      if (stored && stored.content === artifact.content) written += 1;
      else console.error('[abrium] Wrote artifact %s but read back a mismatch', artifact.id);
    } catch (error) {
      console.error('[abrium] Could not store artifact %s', artifact.id, error);
    }
  }

  if (rejected > 0) console.warn('[abrium] Dropped %d malformed capture(s)', rejected);
  return { written, rejected };
}
