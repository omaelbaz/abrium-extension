import JSZip from 'jszip';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Artifact } from '../types/index.ts';
import { ARTIFACT_FIXTURES } from '../../tests/fixtures/artifacts.ts';
import { ExportError, downloadArtifact, downloadArtifactsAsZip, exportArtifactsJson } from './download.ts';

/**
 * jsdom does not implement URL.createObjectURL/revokeObjectURL, and every
 * export path in download.ts goes through them (CLAUDE.md: exports write to
 * disk via a local Blob URL, never a fetch). Stubbed here rather than
 * skipped, so the actual Blob content/type these functions build is still
 * inspectable.
 */
let createObjectURLSpy: ReturnType<typeof vi.fn>;
let revokeObjectURLSpy: ReturnType<typeof vi.fn>;
let clickSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  createObjectURLSpy = vi.fn((blob: Blob) => {
    void blob;
    return 'blob:mock-url';
  });
  revokeObjectURLSpy = vi.fn();
  URL.createObjectURL = createObjectURLSpy as unknown as typeof URL.createObjectURL;
  URL.revokeObjectURL = revokeObjectURLSpy as unknown as typeof URL.revokeObjectURL;
  clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
});

afterEach(() => {
  clickSpy.mockRestore();
  vi.useRealTimers();
});

describe('downloadArtifact', () => {
  it('saves the artifact content under its filename', () => {
    const artifact = ARTIFACT_FIXTURES[0]!;
    downloadArtifact(artifact);

    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
    const blob = createObjectURLSpy.mock.calls[0]![0] as Blob;
    expect(blob.type).toContain('text/plain');
    expect(clickSpy).toHaveBeenCalledTimes(1);
    const anchor = clickSpy.mock.instances[0] as HTMLAnchorElement;
    expect(anchor.download).toBe(artifact.filename);
  });

  it('still produces a (zero-byte) download for an artifact with empty content', () => {
    const artifact: Artifact = { ...ARTIFACT_FIXTURES[0]!, content: '' };
    expect(() => downloadArtifact(artifact)).not.toThrow();
    const blob = createObjectURLSpy.mock.calls[0]![0] as Blob;
    expect(blob.size).toBe(0);
  });
});

describe('exportArtifactsJson', () => {
  it('saves a versioned JSON backup containing every artifact', async () => {
    exportArtifactsJson(ARTIFACT_FIXTURES);

    const blob = createObjectURLSpy.mock.calls[0]![0] as Blob;
    expect(blob.type).toContain('application/json');
    const anchor = clickSpy.mock.instances[0] as HTMLAnchorElement;
    expect(anchor.download).toMatch(/^abrium-backup-\d{4}-\d{2}-\d{2}\.json$/);

    const payload = JSON.parse(await blob.text()) as { version: number; artifacts: Artifact[] };
    expect(payload.version).toBe(1);
    expect(payload.artifacts).toHaveLength(ARTIFACT_FIXTURES.length);
    expect(payload.artifacts[0]!.id).toBe(ARTIFACT_FIXTURES[0]!.id);
  });

  it('throws ExportError("empty_selection") instead of writing an empty backup', () => {
    expect(() => exportArtifactsJson([])).toThrow(ExportError);
    try {
      exportArtifactsJson([]);
    } catch (error) {
      expect(error).toBeInstanceOf(ExportError);
      expect((error as ExportError).code).toBe('empty_selection');
    }
    expect(createObjectURLSpy).not.toHaveBeenCalled();
  });
});

describe('downloadArtifactsAsZip', () => {
  it('bundles every artifact into the archive under its own filename', async () => {
    await downloadArtifactsAsZip(ARTIFACT_FIXTURES.slice(0, 2));

    const blob = createObjectURLSpy.mock.calls[0]![0] as Blob;
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    const names = Object.keys(zip.files).sort();
    expect(names).toEqual(
      [ARTIFACT_FIXTURES[0]!.filename, ARTIFACT_FIXTURES[1]!.filename].sort(),
    );
    const first = await zip.files[ARTIFACT_FIXTURES[0]!.filename]!.async('string');
    expect(first).toBe(ARTIFACT_FIXTURES[0]!.content);
  });

  it('suffixes a filename collision instead of silently dropping one artifact', async () => {
    const a: Artifact = { ...ARTIFACT_FIXTURES[0]!, id: 'a', filename: 'index.html', content: 'first' };
    const b: Artifact = { ...ARTIFACT_FIXTURES[1]!, id: 'b', filename: 'index.html', content: 'second' };

    await downloadArtifactsAsZip([a, b]);

    const blob = createObjectURLSpy.mock.calls[0]![0] as Blob;
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    expect(Object.keys(zip.files).sort()).toEqual(['index-2.html', 'index.html']);
    expect(await zip.files['index.html']!.async('string')).toBe('first');
    expect(await zip.files['index-2.html']!.async('string')).toBe('second');
  });

  it('throws ExportError("empty_selection") for an empty selection', async () => {
    await expect(downloadArtifactsAsZip([])).rejects.toMatchObject({ code: 'empty_selection' });
    expect(createObjectURLSpy).not.toHaveBeenCalled();
  });

  it('wraps a JSZip failure into ExportError("zip_failed") instead of an opaque throw', async () => {
    const failing = vi
      .spyOn(JSZip.prototype, 'generateAsync')
      .mockRejectedValueOnce(new Error('out of memory'));

    await expect(downloadArtifactsAsZip(ARTIFACT_FIXTURES.slice(0, 1))).rejects.toMatchObject({
      code: 'zip_failed',
    });

    failing.mockRestore();
  });
});
