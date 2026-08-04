/**
 * Export paths. Everything here writes to the user's disk through a local
 * Blob URL — there is no upload, no fetch, and no remote endpoint anywhere in
 * this file, and there must never be one.
 */

import JSZip from 'jszip';

import type { Artifact } from '../types/index.ts';

export class ExportError extends Error {
  readonly code: 'empty_selection' | 'zip_failed';
  constructor(code: 'empty_selection' | 'zip_failed', message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'ExportError';
    this.code = code;
  }
}

/** Trigger a save for one in-memory string. Revokes its object URL after use. */
function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = 'noopener';
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    // The download has already been handed to the browser by click(); a
    // microtask-later revoke is safe and prevents leaking the blob.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

export function downloadArtifact(artifact: Artifact): void {
  saveBlob(new Blob([artifact.content], { type: 'text/plain;charset=utf-8' }), artifact.filename);
}

/** Full-fidelity JSON backup — the data-loss-prevention path from the IA. */
export function exportArtifactsJson(artifacts: readonly Artifact[]): void {
  if (artifacts.length === 0) {
    throw new ExportError('empty_selection', 'No artifacts were selected for export');
  }
  const payload = JSON.stringify({ version: 1, exportedAt: Date.now(), artifacts }, null, 2);
  saveBlob(
    new Blob([payload], { type: 'application/json;charset=utf-8' }),
    `abrium-backup-${todayStamp()}.json`,
  );
}

/** ISO date stamp used in generated export filenames. */
function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Two artifacts can legitimately share a filename — "index.html" from two
 * different conversations is the common case. JSZip would silently keep only
 * the last one, so collisions get a numeric suffix before the extension.
 */
function uniqueName(filename: string, taken: Set<string>): string {
  if (!taken.has(filename)) {
    taken.add(filename);
    return filename;
  }
  const dot = filename.lastIndexOf('.');
  const stem = dot > 0 ? filename.slice(0, dot) : filename;
  const extension = dot > 0 ? filename.slice(dot) : '';
  let counter = 2;
  let candidate = `${stem}-${counter}${extension}`;
  while (taken.has(candidate)) {
    counter += 1;
    candidate = `${stem}-${counter}${extension}`;
  }
  taken.add(candidate);
  return candidate;
}

/**
 * Batch ZIP export. JSZip is bundled locally — MV3's CSP forbids pulling it
 * from a CDN — and the archive is assembled entirely in memory, so nothing
 * leaves the device.
 */
export async function downloadArtifactsAsZip(artifacts: readonly Artifact[]): Promise<void> {
  if (artifacts.length === 0) {
    throw new ExportError('empty_selection', 'No artifacts were selected for export');
  }

  try {
    const zip = new JSZip();
    const taken = new Set<string>();
    for (const artifact of artifacts) {
      zip.file(uniqueName(artifact.filename, taken), artifact.content, {
        date: new Date(artifact.createdAt),
      });
    }

    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    saveBlob(blob, `abrium-artifacts-${todayStamp()}.zip`);
  } catch (cause) {
    if (cause instanceof ExportError) throw cause;
    throw new ExportError('zip_failed', 'Could not build the ZIP archive', { cause });
  }
}
