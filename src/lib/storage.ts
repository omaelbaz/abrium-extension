/**
 * The ONLY module that touches chrome.storage. Every read and write in the
 * extension goes through here (CLAUDE.md, Conventions).
 *
 * Nothing leaves the device: this file contains no network calls and must
 * never gain one.
 *
 * LAYOUT — one key per artifact, `abrium.artifact.<id>`.
 *
 * This is what makes the "storage used" rule implementable. getBytesInUse()
 * reports real disk usage per KEY, so a single array under one key can only
 * ever yield a vault-wide total — there would be no honest per-card figure and
 * the card would be forced back onto `artifact.bytes`, which the rules forbid.
 * Per-artifact keys also mean saving one capture no longer rewrites the whole
 * vault. v1's single-array layout is migrated on first read.
 */

import type { Artifact } from '../types/index.ts';
import { ARTIFACT_TYPES } from '../types/index.ts';

const ARTIFACT_PREFIX = 'abrium.artifact.';

/** v1 layout: every artifact in one array. Migrated away on first read. */
const LEGACY_INDEX_KEY = 'abrium.artifacts.v1';

/**
 * Settings live under their own key, deliberately outside the
 * `abrium.artifact.` prefix: artifactKeys() must never see them, or they would
 * be counted in the storage figure and wiped by writeArtifacts()'s stale sweep.
 */
const SETTINGS_KEY = 'abrium.settings.v1';

/** Discriminated failure so callers can show the right message, not a stack. */
export type StorageErrorCode = 'unavailable' | 'read_failed' | 'write_failed' | 'quota_exceeded';

export class StorageError extends Error {
  readonly code: StorageErrorCode;
  constructor(code: StorageErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'StorageError';
    this.code = code;
  }
}

function storageArea(): chrome.storage.LocalStorageArea {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) {
    throw new StorageError(
      'unavailable',
      'chrome.storage.local is not reachable from this context',
    );
  }
  return chrome.storage.local;
}

function keyFor(id: string): string {
  return `${ARTIFACT_PREFIX}${id}`;
}

/**
 * Structural check on data that has round-tripped through storage. A partial
 * write or a schema change from an older version must not crash the gallery.
 */
function isArtifact(value: unknown): value is Artifact {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate['id'] === 'string' &&
    candidate['id'].length > 0 &&
    typeof candidate['title'] === 'string' &&
    typeof candidate['filename'] === 'string' &&
    typeof candidate['content'] === 'string' &&
    typeof candidate['bytes'] === 'number' &&
    Number.isFinite(candidate['bytes']) &&
    typeof candidate['createdAt'] === 'number' &&
    Number.isFinite(candidate['createdAt']) &&
    typeof candidate['pinned'] === 'boolean' &&
    ARTIFACT_TYPES.includes(candidate['type'] as never)
  );
}

const newestFirst = (a: Artifact, b: Artifact): number => b.createdAt - a.createdAt;

async function readEverything(): Promise<Record<string, unknown>> {
  try {
    return await storageArea().get(null);
  } catch (cause) {
    if (cause instanceof StorageError) throw cause;
    throw new StorageError('read_failed', 'Could not read artifacts from storage', { cause });
  }
}

/**
 * Read every stored artifact, newest first.
 *
 * Malformed entries are dropped rather than thrown on — one bad record from an
 * interrupted write must not empty the user's whole vault.
 */
export async function readArtifacts(): Promise<Artifact[]> {
  const everything = await readEverything();

  // v1 → v2 migration. The legacy key is only removed once the per-artifact
  // writes have succeeded, so a failure here leaves the old data intact.
  const legacy = everything[LEGACY_INDEX_KEY];
  if (Array.isArray(legacy)) {
    const migrated = legacy.filter(isArtifact);
    await writeArtifacts(migrated);
    try {
      await storageArea().remove(LEGACY_INDEX_KEY);
    } catch (cause) {
      console.error('[abrium] Migrated artifacts but could not drop the legacy key', cause);
    }
    return migrated.sort(newestFirst);
  }

  return Object.entries(everything)
    .filter(([key]) => key.startsWith(ARTIFACT_PREFIX))
    .map(([, value]) => value)
    .filter(isArtifact)
    .sort(newestFirst);
}

/** Keys currently holding an artifact. */
async function artifactKeys(): Promise<string[]> {
  const everything = await readEverything();
  return Object.keys(everything).filter((key) => key.startsWith(ARTIFACT_PREFIX));
}

/**
 * Replace the vault with exactly `artifacts`: writes each under its own key and
 * removes any key that is no longer represented.
 */
export async function writeArtifacts(artifacts: readonly Artifact[]): Promise<void> {
  const items: Record<string, Artifact> = {};
  for (const artifact of artifacts) items[keyFor(artifact.id)] = artifact;

  try {
    const area = storageArea();
    const wanted = new Set(Object.keys(items));
    const stale = (await artifactKeys()).filter((key) => !wanted.has(key));

    if (Object.keys(items).length > 0) await area.set(items);
    if (stale.length > 0) await area.remove(stale);
  } catch (cause) {
    if (cause instanceof StorageError) throw cause;
    const message = cause instanceof Error ? cause.message : String(cause);
    const quota = /quota|QUOTA_BYTES/i.test(message);
    throw new StorageError(
      quota ? 'quota_exceeded' : 'write_failed',
      quota ? 'Storage quota exceeded' : 'Could not write artifacts to storage',
      { cause },
    );
  }
}

/** Write or replace a single artifact without touching the rest of the vault. */
export async function saveArtifact(artifact: Artifact): Promise<void> {
  try {
    await storageArea().set({ [keyFor(artifact.id)]: artifact });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    const quota = /quota|QUOTA_BYTES/i.test(message);
    throw new StorageError(
      quota ? 'quota_exceeded' : 'write_failed',
      quota ? 'Storage quota exceeded' : 'Could not save the artifact',
      { cause },
    );
  }
}

/**
 * Read one artifact by id.
 *
 * Returns null when the key is absent or holds a malformed record — the detail
 * view treats both as "no longer exists" rather than an error, because quota
 * eviction between listing and opening is a legitimate outcome, not a fault.
 */
export async function readArtifact(id: string): Promise<Artifact | null> {
  const key = keyFor(id);
  let raw: Record<string, unknown>;
  try {
    raw = await storageArea().get(key);
  } catch (cause) {
    if (cause instanceof StorageError) throw cause;
    throw new StorageError('read_failed', 'Could not read the artifact from storage', { cause });
  }
  const value = raw[key];
  return isArtifact(value) ? value : null;
}

/** Permanently remove one artifact. Irreversible — callers confirm first. */
export async function deleteArtifact(id: string): Promise<void> {
  try {
    await storageArea().remove(keyFor(id));
  } catch (cause) {
    if (cause instanceof StorageError) throw cause;
    throw new StorageError('write_failed', 'Could not delete the artifact', { cause });
  }
}

/**
 * Flip an artifact's pinned flag.
 *
 * Re-reads first so a stale copy held by a view cannot resurrect an artifact
 * that was deleted elsewhere; returns null if it is already gone.
 */
export async function setPinned(id: string, pinned: boolean): Promise<Artifact | null> {
  const current = await readArtifact(id);
  if (!current) return null;
  const updated: Artifact = { ...current, pinned };
  await saveArtifact(updated);
  return updated;
}

/** Real disk usage for one artifact, or null when it cannot be measured. */
export async function getArtifactBytes(id: string): Promise<number | null> {
  try {
    const area = storageArea();
    if (typeof area.getBytesInUse !== 'function') return null;
    return await area.getBytesInUse(keyFor(id));
  } catch (cause) {
    console.error('[abrium] Could not measure artifact %s', id, cause);
    return null;
  }
}

/**
 * Real disk usage for the whole vault, straight from getBytesInUse().
 *
 * This is the ONLY number allowed behind a "storage used" figure — never the
 * sum of `artifact.bytes`.
 *
 * Returns null when the measurement could not be taken, which the header
 * renders as a placeholder. 0 is reserved for a genuinely empty vault: the two
 * used to be conflated, so a failed lookup displayed a confident "0 bytes".
 * A failure still must not blank out the gallery, so this never throws.
 */
export async function getUsedBytes(): Promise<number | null> {
  try {
    const area = storageArea();
    if (typeof area.getBytesInUse !== 'function') return null;
    const keys = await artifactKeys();
    if (keys.length === 0) return 0;
    return await area.getBytesInUse(keys);
  } catch (cause) {
    console.error('[abrium] Could not measure storage usage', cause);
    return null;
  }
}

/**
 * Real disk usage per artifact, keyed by artifact id.
 *
 * An id missing from the returned map means its size could not be measured;
 * callers omit the figure rather than substituting a declared length.
 */
export async function getArtifactSizes(
  ids: readonly string[],
): Promise<ReadonlyMap<string, number>> {
  const sizes = new Map<string, number>();
  if (ids.length === 0) return sizes;

  try {
    const area = storageArea();
    if (typeof area.getBytesInUse !== 'function') return sizes;
    await Promise.all(
      ids.map(async (id) => {
        try {
          sizes.set(id, await area.getBytesInUse(keyFor(id)));
        } catch (cause) {
          console.error('[abrium] Could not measure artifact %s', id, cause);
        }
      }),
    );
  } catch (cause) {
    console.error('[abrium] Could not measure artifact sizes', cause);
  }
  return sizes;
}

/* -------------------------------------------------------------------------
   Settings — separate key, never mixed into artifact storage
   ------------------------------------------------------------------------- */

/**
 * Raw settings read. Returns null when nothing has been saved yet or the record
 * is unreadable; lib/settings.ts owns defaults and validation, so this stays a
 * dumb persistence layer.
 */
export async function readSettingsRecord(): Promise<Record<string, unknown> | null> {
  try {
    const raw = await storageArea().get(SETTINGS_KEY);
    const value = raw[SETTINGS_KEY];
    if (typeof value !== 'object' || value === null) return null;
    return value as Record<string, unknown>;
  } catch (cause) {
    console.error('[abrium] Could not read settings', cause);
    return null;
  }
}

export async function writeSettingsRecord(record: Record<string, unknown>): Promise<void> {
  try {
    await storageArea().set({ [SETTINGS_KEY]: record });
  } catch (cause) {
    throw new StorageError('write_failed', 'Could not save settings', { cause });
  }
}

/** Subscribe to settings changes (another surface may have changed them). */
export function onSettingsChanged(listener: () => void): () => void {
  if (typeof chrome === 'undefined' || !chrome.storage?.onChanged) return () => {};
  const handler = (
    changes: Record<string, chrome.storage.StorageChange>,
    areaName: string,
  ): void => {
    if (areaName === 'local' && SETTINGS_KEY in changes) listener();
  };
  chrome.storage.onChanged.addListener(handler);
  return () => chrome.storage.onChanged.removeListener(handler);
}

/** Subscribe to vault changes made by the service worker while the panel is open. */
export function onArtifactsChanged(listener: () => void): () => void {
  if (typeof chrome === 'undefined' || !chrome.storage?.onChanged) return () => {};
  const handler = (
    changes: Record<string, chrome.storage.StorageChange>,
    areaName: string,
  ): void => {
    if (areaName !== 'local') return;
    const touched = Object.keys(changes).some(
      (key) => key.startsWith(ARTIFACT_PREFIX) || key === LEGACY_INDEX_KEY,
    );
    if (touched) listener();
  };
  chrome.storage.onChanged.addListener(handler);
  return () => chrome.storage.onChanged.removeListener(handler);
}
