/**
 * Icon set — single source of truth. Every glyph in every surface comes from
 * here; no inline <svg> in a template or component.
 *
 * All icons are 16×16, stroke-based, `currentColor`, so they inherit the
 * component's colour token and need no per-theme variant.
 *
 * `directional: true` marks glyphs whose meaning depends on reading order —
 * they get `.abr-icon--directional` and mirror under RTL. Download, close,
 * pin, trash, search, gear and check must stay unmirrored.
 */

export interface IconSpec {
  readonly path: string;
  readonly directional: boolean;
  /** Solid icons fill instead of stroke (used for the "pinned" on-state). */
  readonly filled?: boolean;
}

const ICONS = {
  search: {
    path: '<circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3 3"/>',
    directional: false,
  },
  close: {
    path: '<path d="M4 4l8 8M12 4l-8 8"/>',
    directional: false,
  },
  download: {
    path: '<path d="M8 2v8m0 0 3-3M8 10 5 7M2.5 12.5h11"/>',
    directional: false,
  },
  archive: {
    path: '<path d="M8 2v8m0 0 3-3M8 10 5 7M2.5 11.5v1a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-1"/>',
    directional: false,
  },
  check: {
    path: '<path d="m3 8.5 3.5 3.5L13 5"/>',
    directional: false,
  },
  /**
   * A cog, not a sun.
   *
   * The first version of this glyph was a small circle with eight long rays —
   * geometrically the same construction as `sun`, so the Settings entry point
   * read as a theme toggle. A gear is distinguished by the large RING plus a
   * hub, with short stubby teeth at the rim; rays from a small centre are a
   * sun. Keep those two shapes obviously different.
   */
  settings: {
    path:
      '<circle cx="8" cy="8" r="4.7"/><circle cx="8" cy="8" r="1.75"/>' +
      '<path d="M12.7 8h1.8M8 12.7v1.8M3.3 8H1.5M8 3.3V1.5' +
      'M11.32 11.32l1.28 1.28M4.68 11.32 3.4 12.6M4.68 4.68 3.4 3.4M11.32 4.68 12.6 3.4"/>',
    directional: false,
  },
  refresh: {
    path: '<path d="M13.5 8a5.5 5.5 0 1 1-1.7-4M13.5 2v3.5H10"/>',
    directional: false,
  },
  alert: {
    path: '<path d="M8 5.5v3.2M8 11.2v.1M8 2 1.5 13.5h13z"/>',
    directional: false,
  },
  pin: {
    path: '<path d="M9.5 2 14 6.5l-2 .5-3 3-.5 3.5L2 7.5 5.5 7l3-3z"/><path d="M5 11 1.5 14.5"/>',
    directional: false,
  },
  pinFilled: {
    path: '<path d="M9.5 2 14 6.5l-2 .5-3 3-.5 3.5L2 7.5 5.5 7l3-3z"/>',
    directional: false,
    filled: true,
  },
  trash: {
    path: '<path d="M3 4h10M6.5 4V2.5h3V4M4.5 4l.5 9h6l.5-9M6.5 6.5v4M9.5 6.5v4"/>',
    directional: false,
  },
  external: {
    path: '<path d="M6.5 3H3.5v9.5H13V9.5M9 3h4v4M13 3l-5.5 5.5"/>',
    directional: true,
  },
  sun: {
    path: '<circle cx="8" cy="8" r="3.25"/><path d="M8 1v1.6M8 13.4V15M15 8h-1.6M2.6 8H1M12.95 3.05l-1.13 1.13M4.18 11.82l-1.13 1.13M12.95 12.95l-1.13-1.13M4.18 4.18 3.05 3.05"/>',
    directional: false,
  },
  moon: {
    path: '<path d="M13.5 9.6A5.8 5.8 0 0 1 6.4 2.5a5.8 5.8 0 1 0 7.1 7.1z"/>',
    directional: false,
  },
  display: {
    path: '<rect x="1.75" y="2.75" width="12.5" height="8.5" rx="1"/><path d="M5.5 14h5M8 11.25V14"/>',
    directional: false,
  },
  language: {
    path: '<circle cx="8" cy="8" r="6.25"/><path d="M1.9 6.2h12.2M1.9 9.8h12.2M8 1.75c-3.4 3.6-3.4 8.9 0 12.5 3.4-3.6 3.4-8.9 0-12.5z"/>',
    directional: false,
  },
  heart: {
    path: '<path d="M8 13.5S1.75 10 1.75 5.9A3.15 3.15 0 0 1 8 4.6a3.15 3.15 0 0 1 6.25 1.3C14.25 10 8 13.5 8 13.5z"/>',
    directional: false,
  },
  chevronBack: {
    path: '<path d="M10 3 5 8l5 5"/>',
    directional: true,
  },
  chevronForward: {
    path: '<path d="M6 3l5 5-5 5"/>',
    directional: true,
  },
} as const satisfies Record<string, IconSpec>;

export type IconName = keyof typeof ICONS;

/**
 * Render an icon as an SVG string.
 *
 * Decorative by default: icons sit inside controls that already carry an
 * aria-label, so a second accessible name would be read twice.
 */
export function icon(name: IconName, options: { className?: string } = {}): string {
  const spec: IconSpec = ICONS[name];
  const classes = [
    'abr-icon',
    spec.directional ? 'abr-icon--directional' : '',
    options.className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  const paint = spec.filled
    ? 'fill="currentColor"'
    : 'fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"';

  return (
    `<svg class="${classes}" viewBox="0 0 16 16" ${paint} ` +
    `aria-hidden="true" focusable="false">${spec.path}</svg>`
  );
}
