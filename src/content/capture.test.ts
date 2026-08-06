import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import type { Artifact } from '../types/index.ts';
import { ARTIFACT_FIXTURES } from '../../tests/fixtures/artifacts.ts';

/**
 * Scope: ONLY the artifact-deduplication helpers (signatureOf, contentHash),
 * per the audit's explicit instruction not to exercise the whole file.
 *
 * capture.ts calls main() unconditionally at module load, which registers a
 * MutationObserver, a chrome.runtime message listener, and a
 * setInterval/setTimeout-driven sweep loop. Importing it for real (not
 * mocked) is unavoidable to reach the two dedup functions, since they are
 * not exported from anywhere else — so timers are faked and never advanced,
 * meaning the sweep loop is registered but never actually fires during this
 * test. Nothing here exercises extract.ts, storage.ts, or chrome.runtime
 * message handling.
 */
let signatureOf: (artifacts: readonly Artifact[]) => string;
let contentHash: (artifact: Artifact) => number;

beforeAll(async () => {
  vi.useFakeTimers();
  globalThis.chrome = {
    runtime: {
      onMessage: { addListener: vi.fn() },
      sendMessage: vi.fn(),
    },
  } as unknown as typeof chrome;

  const mod = await import('./capture.ts');
  signatureOf = mod.signatureOf;
  contentHash = mod.contentHash;
});

afterAll(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  // @ts-expect-error -- test-only teardown; chrome does not exist outside an
  // extension context and other test files rely on that being true.
  delete globalThis.chrome;
});

describe('signatureOf', () => {
  it('joins id:bytes pairs, order-sensitive, to detect a changed artifact set', () => {
    const [a, b] = ARTIFACT_FIXTURES;
    expect(signatureOf([a!, b!])).toBe(`${a!.id}:${a!.bytes}|${b!.id}:${b!.bytes}`);
  });

  it('returns an empty string for no artifacts, so a genuinely empty sweep is a valid signature', () => {
    expect(signatureOf([])).toBe('');
  });

  it('changes when an artifact byte count changes, even if the id set is the same', () => {
    const original = ARTIFACT_FIXTURES[0]!;
    const revised: Artifact = { ...original, bytes: original.bytes + 1 };
    expect(signatureOf([original])).not.toBe(signatureOf([revised]));
  });
});

describe('contentHash', () => {
  it('combines declared byte length and content length into one comparable number', () => {
    const artifact = ARTIFACT_FIXTURES[0]!;
    expect(contentHash(artifact)).toBe(artifact.bytes * 31 + artifact.content.length);
  });

  it('handles an artifact with empty content without throwing', () => {
    const artifact: Artifact = { ...ARTIFACT_FIXTURES[0]!, content: '' };
    expect(contentHash(artifact)).toBe(artifact.bytes * 31);
  });

  it('produces different hashes for two different content revisions of the same artifact', () => {
    const original = ARTIFACT_FIXTURES[0]!;
    const revised: Artifact = { ...original, content: `${original.content}\n// one more line` };
    expect(contentHash(original)).not.toBe(contentHash(revised));
  });
});
