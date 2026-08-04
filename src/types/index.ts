/**
 * Shared domain types. Nothing here may import from /ui or /lib — this is the
 * bottom of the dependency graph.
 */

export const ARTIFACT_TYPES = ['code', 'html', 'markdown', 'svg', 'react'] as const;

export type ArtifactType = (typeof ARTIFACT_TYPES)[number];

/** 'all' is the default filter pill; it is not a storable artifact type. */
export type FilterValue = ArtifactType | 'all';

export interface Artifact {
  /** Stable id derived from conversation + artifact identifier at capture time. */
  id: string;
  title: string;
  /** Suggested download name, extension included: "pricing-table.tsx". */
  filename: string;
  type: ArtifactType;
  /** Highlight language for code artifacts; null for svg/markdown/html. */
  language: string | null;
  content: string;
  /**
   * Byte length of `content`, computed once at capture.
   *
   * INTERNAL ONLY — never render this as a size/storage figure. Anything the
   * user sees must come from chrome.storage.local.getBytesInUse() via
   * lib/storage.ts (CLAUDE.md, Rules). Declared length and real disk usage
   * diverge, and showing the wrong one would mislead the quota warning.
   */
  bytes: number;
  /** Epoch milliseconds. Always formatted through /lib/format.ts, never by hand. */
  createdAt: number;
  conversationId: string | null;
  pinned: boolean;
}

/** Everything the gallery needs to render one frame. */
export interface GalleryModel {
  status: 'loading' | 'error' | 'ready';
  /** Artifacts after search + filter have been applied. */
  visible: Artifact[];
  /** Unfiltered totals, for the header summary line. */
  totalCount: number;
  /**
   * Real disk usage from getBytesInUse() — never a sum of `artifact.bytes`.
   * null means the measurement failed; the header shows a placeholder rather
   * than an authoritative-looking "0 bytes".
   */
  totalBytes: number | null;
  /**
   * Real per-artifact disk usage from getBytesInUse(), keyed by artifact id.
   * A missing id means the size could not be measured; the card then omits the
   * figure rather than falling back to a declared length.
   */
  sizes: ReadonlyMap<string, number>;
  /** Per-type counts for the chip row, including 'all'. */
  counts: Record<FilterValue, number>;
  activeFilter: FilterValue;
  query: string;
  batchMode: boolean;
  selected: ReadonlySet<string>;
  showPreviewHint: boolean;
}
