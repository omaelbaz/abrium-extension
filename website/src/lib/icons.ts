// Single source of truth for icon path data used across website page components.
// lucide-style, 1.6px stroke — matches the extension's icon set and the design reference.
export const ICONS: Record<string, string> = {
  capture: "M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18M12 8v8M8 12h8",
  search: "M11 4a7 7 0 1 0 0 14a7 7 0 0 0 0-14M20 20l-4-4",
  zip: "M3 7h18v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 7l2-4h14l2 4M10 12h4",
  globe: "M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18M3 12h18M12 3c2.4 2.6 3.6 5.6 3.6 9S14.4 18.4 12 21M12 3C9.6 5.6 8.4 8.6 8.4 12s1.2 6.4 3.6 9",
  lock: "M6 10h12v10H6zM9 10V7a3 3 0 0 1 6 0v3",
  github: "M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.3 4.3 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.4.4-.5.9-.5 1.6V21",
  // Patreon's mark is a solid logotype, not a line drawing: a vertical
  // pillar with a disc tangent to its upper right. Drawn as two filled
  // subpaths that overlap by 0.4u so they read as one joined silhouette
  // — as a 1.6px outline the two shapes separated into a bar and a ring
  // with a visible gap, which is not the logo. Both subpaths wind
  // clockwise so the nonzero fill rule doesn't punch a hole through the
  // overlap. See FILLED_ICONS below — this one is filled, not stroked.
  patreon: "M3.3 3h4.2v18H3.3z M13.9 3a6.8 6.8 0 1 1 0 13.6a6.8 6.8 0 1 1 0-13.6",
  chrome: "M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18M12 8.4a3.6 3.6 0 1 0 0 7.2a3.6 3.6 0 0 0 0-7.2M20.4 7.6H12M4.3 6 8.4 13.2M10.7 20.9 14.8 13.7",
  clock: "M12 7v5l3 2M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18",
  check: "m20 6-11 11-5-5",
  chevronRight: "m9 6 6 6-6 6",
  chevronLeft: "m15 18-6-6 6-6",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6 6 18",
};

// Icons whose paths are closed silhouettes meant to be filled, not
// stroked outlines. Renderers must paint these with fill=<color> and
// stroke=none; painting them like the others yields a hollow, broken
// shape. Everything not listed here is a 1.6px stroked outline.
export const FILLED_ICONS = new Set<string>(['patreon']);
