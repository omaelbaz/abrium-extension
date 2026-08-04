/**
 * claude.ai DOM parsing — the ONE file that knows what claude.ai's markup
 * looks like (CLAUDE.md, Conventions). A claude.ai redesign means editing the
 * SELECTORS table below and nothing else.
 *
 * ┌────────────────────────────────────────────────────────────────────────┐
 * │ SELECTOR STATUS — verified against live claude.ai in two rounds.       │
 * │                                                                        │
 * │  ✅ artifactContainer — div[aria-label*="rtifact"], 2 matched.         │
 * │  ✅ source            — .code-block__code > code, confirmed by         │
 * │                         clipboard observation (exact 39,050-char       │
 * │                         match). Observed on a REACT/TSX artifact only. │
 * │  ⚠ HTML / SVG source — UNVERIFIED. Those types have a Preview mode;    │
 * │                         see the note on `source` below.                │
 * │  ⚠ title             — container-scoped; the specific element is       │
 * │                         still unconfirmed (no artifact testid exists). │
 * │  ⚠ artifactId        — no stable id has been found on the real page,   │
 * │                         so the content-hash revision branch is what    │
 * │                         actually runs. See deriveArtifactId().         │
 * │                                                                        │
 * │ tools/inspect-claude-dom-v2.js re-runs the diagnosis if this breaks.   │
 * └────────────────────────────────────────────────────────────────────────┘
 *
 * Design rules that survive a redesign:
 *  - Prefer semantic, behaviour-bearing attributes (data-testid, role, aria-*)
 *    over class names. Class names are the first thing a redesign churns.
 *  - Every target is a LIST of candidate selectors, tried in order, so a
 *    partial redesign degrades instead of breaking.
 *  - Nothing here throws. A miss returns null and the caller skips that one
 *    artifact — a selector change must never take down the content script.
 *
 * This module is pure: no chrome APIs, no storage, no side effects. It takes
 * DOM nodes and returns plain data, which is what makes it testable.
 */

import type { Artifact, ArtifactType } from '../types/index.ts';

/* =========================================================================
   SELECTORS — the single place claude.ai's markup is described.
   ========================================================================= */

export const SELECTORS = {
  /**
   * Containers that hold one artifact each.
   *
   * ✅ CONFIRMED against live claude.ai: `div[aria-label*="rtifact"]` matched
   * 2 containers with the artifact panel open in Code view. It leads the list.
   * The substring skips the A/a case question on "Artifact".
   *
   * The rest stay as fallbacks — claude.ai ships no artifact-specific
   * data-testid today (all 18 observed testids are page chrome), but a future
   * release adding one should be picked up without another round trip.
   */
  artifactContainer: [
    '[data-skill-file-viewer="true"]',
    'div[aria-label*="rtifact"]',
    'div[role="dialog"][aria-label*="rtifact"]',
    '[data-testid="artifact-panel"]',
    '[data-testid="artifact"]',
    '[data-artifact-id]',
  ],

  /** A stable per-artifact identifier, if claude.ai exposes one at all. */
  artifactId: ['data-artifact-id', 'data-testid-artifact-id', 'data-id'],

  /**
   * Artifact title, always queried WITHIN a container — a page-wide h1/h2/h3
   * search matched 5 headings on the real page, most of them page chrome.
   * queryFirst() is always called with the container as its root, so this
   * stays scoped; do not lift it to a document-level lookup.
   * TODO(real-dom): no artifact-specific testid exists yet; confirm which
   * heading level the panel actually uses.
   */
  title: [
    '[data-testid="artifact-title"]',
    '[role="heading"]',
    'h1, h2, h3',
    'header [class*="title"]',
  ],

  /**
   * The RAW SOURCE, never the rendered preview.
   *
   * ✅ CONFIRMED against live claude.ai by clipboard observation: the Copy
   * button's 39,050 characters matched this element's textContent EXACTLY, so
   * the editor is not virtualised and the full source really is in the DOM.
   *
   * Real path observed on a React/TSX artifact:
   *   div.contents > div.ease-out.duration-200 > div.w-full.h-full
   *     > div.w-full.h-full > div.code-block__code.!my-0 > code.language-tsx
   *
   * There is NO <pre> anywhere — claude.ai puts <code> directly inside a
   * BEM-ish wrapper. `.code-block__code` leads because it is the stable half:
   * it does not vary by language, whereas `.language-tsx` changes with every
   * artifact type. The language-keyed selector follows as corroboration, and
   * the original <pre> candidates stay at the end as harmless fallbacks —
   * working fallback logic is never deleted (CLAUDE.md, Conventions).
   *
   * ⚠ OPEN QUESTION — HTML and SVG artifacts are NOT covered by this
   * evidence. Those types have both a rendered Preview mode and a source
   * (Code) mode, and the confirmed selector was observed only on a React/TSX
   * artifact, which has no preview mode to toggle. Two things are unknown:
   *   1. whether the source mode for HTML/SVG uses the same
   *      `.code-block__code > code` structure, and
   *   2. whether the source is even in the DOM while the panel is showing
   *      the rendered Preview.
   * If an HTML/SVG artifact is sitting in Preview mode, none of these
   * candidates will match, extractSource() returns null, and that artifact is
   * skipped with the "found containers but extracted none" log. That is the
   * correct safe behaviour — it is a missed capture, never a wrong one — but
   * it does mean capture may require the panel to be in Code view for those
   * types. Needs one more real-page check to settle.
   */
  source: [
    '.code-block__code code',
    '[class*="code-block__code"] code',
    'code[class*="language-"]',
    '[data-testid="artifact-code"] pre',
    '[data-testid="code-block"] code',
    'pre code',
    'pre',
  ],

  /** Control that switches the panel to the source view, if one exists. */
  sourceTab: [
    '[data-testid="artifact-code-tab"]',
    'button[role="tab"][aria-label*="ode"]',
    'button[role="tab"]',
  ],

  /** Declared language/kind label. */
  languageLabel: ['[data-testid="artifact-language"]', '[data-language]', '[class*="language-"]'],
} as const;

/** Attributes checked for a language hint, in order. */
const LANGUAGE_ATTRIBUTES = ['data-language', 'data-lang', 'lang'] as const;

/* =========================================================================
   Safe DOM helpers — nothing in this file may throw
   ========================================================================= */

/** First element matching any candidate selector, or null. */
export function queryFirst(root: ParentNode, candidates: readonly string[]): Element | null {
  for (const selector of candidates) {
    try {
      const hit = root.querySelector(selector);
      if (hit) return hit;
    } catch {
      // An invalid selector must not take the sweep down with it.
      console.warn('[abrium] Ignoring invalid selector', selector);
    }
  }
  return null;
}

/** All elements matching any candidate selector, de-duplicated, in DOM order. */
export function queryAll(root: ParentNode, candidates: readonly string[]): Element[] {
  const found = new Set<Element>();
  for (const selector of candidates) {
    try {
      for (const element of root.querySelectorAll(selector)) found.add(element);
    } catch {
      console.warn('[abrium] Ignoring invalid selector', selector);
    }
  }
  return [...found];
}

function firstAttribute(element: Element, names: readonly string[]): string | null {
  for (const name of names) {
    const value = element.getAttribute(name);
    if (value !== null && value.trim() !== '') return value.trim();
  }
  return null;
}

function textOf(element: Element | null): string {
  return element?.textContent?.trim() ?? '';
}

/* =========================================================================
   Identity — how a captured artifact gets its storage key
   ========================================================================= */

/**
 * FNV-1a, 32-bit. Not a security hash — this only needs to be deterministic,
 * dependency-free and stable across sessions so the same artifact keeps the
 * same storage key instead of duplicating on every page load.
 */
function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/**
 * REVISION POLICY — documented decision, per CLAUDE.md's v1.0 non-goal of
 * "no version history".
 *
 *  - If claude.ai exposes a stable artifact id, that id IS the key. Claude
 *    revising the same artifact then UPDATES IN PLACE: one entry, latest
 *    content. No history, which is exactly the non-goal.
 *  - If it does not, the key is a hash of conversation + title + type +
 *    content. Re-reading an unchanged artifact is then idempotent (same key,
 *    harmless overwrite), while a revision changes the content and therefore
 *    becomes a SEPARATE entry.
 *
 * The second branch is the safe default: it can never silently destroy an
 * earlier version. Which branch runs depends on whether SELECTORS.artifactId
 * matches anything real — currently unverified.
 */
export function deriveArtifactId(input: {
  stableId: string | null;
  conversationId: string | null;
  title: string;
  type: ArtifactType;
  content: string;
}): string {
  if (input.stableId) {
    const cleaned = input.stableId.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 64);
    if (cleaned.length > 0) return `art_${cleaned}`;
  }
  const material = [input.conversationId ?? '', input.title, input.type, input.content].join(' ');
  // Length is mixed in so two different bodies that collide on the hash still
  // differ, which is cheap insurance for a 32-bit digest.
  return `art_${fnv1a(material).toString(36)}${material.length.toString(36)}`;
}

/**
 * Conversation id from the URL. Kept here rather than in the content script so
 * every piece of claude.ai knowledge lives in one file.
 *
 * Only an opaque id shape is accepted — the detail view builds a link from
 * this, and its own validation would reject anything else anyway.
 */
export function conversationIdFromUrl(href: string): string | null {
  try {
    const url = new URL(href);
    if (url.hostname !== 'claude.ai') return null;
    const match = /\/chat\/([A-Za-z0-9_-]{1,128})/.exec(url.pathname);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

/* =========================================================================
   Type / language / filename
   ========================================================================= */

const EXTENSION_BY_LANGUAGE: Readonly<Record<string, string>> = {
  typescript: 'ts',
  javascript: 'js',
  tsx: 'tsx',
  jsx: 'jsx',
  python: 'py',
  sql: 'sql',
  bash: 'sh',
  shell: 'sh',
  json: 'json',
  yaml: 'yaml',
  css: 'css',
  rust: 'rs',
  go: 'go',
  java: 'java',
  ruby: 'rb',
  php: 'php',
  markdown: 'md',
  html: 'html',
  svg: 'svg',
};

const EXTENSION_BY_TYPE: Readonly<Record<ArtifactType, string>> = {
  code: 'txt',
  html: 'html',
  svg: 'svg',
  markdown: 'md',
  react: 'jsx',
};

/**
 * Decide the artifact type.
 *
 * Precedence is deliberate: an explicit declared language beats sniffing, and
 * content sniffing is only a fallback. React is checked before generic code
 * because a .tsx artifact is a React component to a user, not "code".
 */
export function detectType(input: { language: string | null; content: string }): ArtifactType {
  const language = (input.language ?? '').toLowerCase();
  const head = input.content.slice(0, 400).trimStart();

  if (language === 'svg') return 'svg';
  if (language === 'html') return 'html';
  if (language === 'markdown' || language === 'md') return 'markdown';
  if (language === 'jsx' || language === 'tsx') return 'react';

  if (/^<svg[\s>]/i.test(head)) return 'svg';
  if (/^<!doctype html|^<html[\s>]/i.test(head)) return 'html';
  // A React artifact is JSX plus a component/export — either alone is weaker.
  if (/\bfrom\s+['"]react['"]|\bReact\./.test(input.content) && /<[A-Z][\w.]*[\s/>]/.test(input.content)) {
    return 'react';
  }
  if (language !== '') return 'code';
  // No language and no markup: treat prose-with-headings as markdown.
  if (/^#{1,6}\s/m.test(input.content)) return 'markdown';
  return 'code';
}

/** Turn a title into a safe, readable download filename. */
export function toFilename(title: string, type: ArtifactType, language: string | null): string {
  const stem =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'artifact';
  const extension =
    (language ? EXTENSION_BY_LANGUAGE[language.toLowerCase()] : undefined) ??
    EXTENSION_BY_TYPE[type];
  return `${stem}.${extension}`;
}

function byteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

/* =========================================================================
   Extraction
   ========================================================================= */

/** Every artifact container currently in the document. */
export function findArtifactNodes(root: ParentNode): Element[] {
  return queryAll(root, SELECTORS.artifactContainer);
}

/**
 * Read the raw source out of a container.
 *
 * Never reads a rendered preview: an <iframe> is cross-document and its
 * contents are the OUTPUT, not the artifact. If only a preview is present the
 * artifact is skipped rather than captured wrong.
 *
 * Returns null ONLY when no source node matched. A node that matched but held
 * nothing comes back as an empty string, because the caller must be able to
 * tell those apart: "no node" points at SELECTORS.source being stale, while
 * "empty node" points at reading the panel before it finished rendering.
 * Collapsing them would hide which selector actually broke.
 */
export function extractSource(container: Element): string | null {
  if (container.matches('[data-skill-file-viewer="true"]')) {
    const wiggle = container.querySelector('#wiggle-file-content');
    if (!wiggle) return null;
    
    const lines: string[] = [];
    for (const row of wiggle.querySelectorAll('.group\\/line')) {
      const codeNode = row.querySelector('code.font-mono');
      if (codeNode) {
        let text = codeNode.textContent || '';
        if (text === '\u00A0') text = '';
        lines.push(text);
      }
    }
    return lines.join('\n');
  }

  const node = queryFirst(container, SELECTORS.source);
  if (!node) return null;
  // textContent, not innerText: we want the source verbatim, not what CSS
  // decided was visible, and innerText would collapse indentation.
  return node.textContent ?? '';
}

export function extractLanguage(container: Element): string | null {
  const labelled = queryFirst(container, SELECTORS.languageLabel);
  if (labelled) {
    const attribute = firstAttribute(labelled, LANGUAGE_ATTRIBUTES);
    if (attribute) return attribute.toLowerCase();
    const fromClass = /language-([a-z0-9+#-]+)/i.exec(labelled.className || '');
    if (fromClass?.[1]) return fromClass[1].toLowerCase();
    const text = textOf(labelled);
    if (text && text.length <= 20) return text.toLowerCase();
  }
  const code = queryFirst(container, ['code[class*="language-"]']);
  const fromCode = code ? /language-([a-z0-9+#-]+)/i.exec(code.className || '') : null;
  return fromCode?.[1]?.toLowerCase() ?? null;
}

export function extractTitle(container: Element): string {
  const node = queryFirst(container, SELECTORS.title);
  const text = textOf(node);
  if (text) return text.slice(0, 200);
  
  let curr = container.parentElement;
  for (let i = 0; i < 4 && curr; i++) {
    const headerTitleNode = curr.querySelector('div.flex.items-center.justify-between h2');
    if (headerTitleNode) {
      const headerText = textOf(headerTitleNode);
      if (headerText) return headerText.slice(0, 200);
    }
    curr = curr.parentElement;
  }

  const aria = container.getAttribute('aria-label')?.trim();
  return (aria || 'Untitled artifact').slice(0, 200);
}

export interface ExtractContext {
  /** Page URL, for the conversation id. */
  href: string;
  /** Injected so captures are deterministic in tests. */
  now?: number;
}

export interface PreviewCandidate {
  stableId: string | null;
  title: string;
}

export type ExtractFailure =
  | 'no-source'
  | 'empty-content'
  | 'container-detached';

export type ExtractResult =
  | { ok: true; artifact: Artifact }
  | { ok: false; reason: ExtractFailure; candidate?: PreviewCandidate };

/**
 * Extract one artifact. Returns a discriminated result rather than throwing —
 * a claude.ai redesign should cost us one skipped artifact, not the observer.
 */
export function extractArtifact(container: Element, context: ExtractContext): ExtractResult {
  try {
    if (!container.isConnected) return { ok: false, reason: 'container-detached' };

    let title = extractTitle(container);
    let filename = '';
    const iframeTitle = container.querySelector('iframe[title]')?.getAttribute('title')?.trim();
    
    if (iframeTitle && iframeTitle.toLowerCase() !== 'preview') {
      if (title === 'Untitled artifact') title = iframeTitle;
      filename = iframeTitle;
    }

    const proseDockey = container.getAttribute('data-prose-review-dockey') ?? 
                        container.querySelector('[data-prose-review-dockey]')?.getAttribute('data-prose-review-dockey');
    if (proseDockey) {
      const base = proseDockey.split('/').pop() ?? '';
      if (base) {
        if (!filename) filename = base;
        if (title === 'Untitled artifact') title = base;
      }
    }

    const stableId = firstAttribute(container, SELECTORS.artifactId);

    const content = extractSource(container);
    if (content === null) {
      return { ok: false, reason: 'no-source', candidate: { stableId, title } };
    }
    if (content.trim().length === 0) return { ok: false, reason: 'empty-content' };

    const language = extractLanguage(container);
    const type = detectType({ language, content });
    
    if (!filename) filename = toFilename(title, type, language);

    const conversationId = conversationIdFromUrl(context.href);

    const artifact: Artifact = {
      id: deriveArtifactId({ stableId, conversationId, title, type, content }),
      title,
      filename,
      type,
      language: type === 'code' || type === 'react' ? language : null,
      content,
      bytes: byteLength(content),
      createdAt: context.now ?? Date.now(),
      conversationId,
      pinned: false,
    };
    return { ok: true, artifact };
  } catch (error) {
    // Truly unexpected — still not fatal.
    console.warn('[abrium] Artifact extraction threw, skipping it', error);
    return { ok: false, reason: 'no-source' };
  }
}

export interface SweepResult {
  artifacts: Artifact[];
  /** Containers found but not captured, by reason — surfaced for diagnostics. */
  skipped: Record<ExtractFailure, number>;
  /** How many containers the selectors matched at all. */
  containersSeen: number;
  previewCandidates: PreviewCandidate[];
}

/**
 * Extract every artifact currently in the document.
 *
 * Reports what it skipped and why. A sweep that finds zero containers is very
 * different from one that finds ten and can read none of them — the second
 * means the source selector broke, and silence would hide that.
 */
export function sweep(root: ParentNode, context: ExtractContext): SweepResult {
  const containers = findArtifactNodes(root);
  const artifacts: Artifact[] = [];
  const previewCandidates: PreviewCandidate[] = [];
  const skipped: Record<ExtractFailure, number> = {
    'no-source': 0,
    'empty-content': 0,
    'container-detached': 0,
  };

  for (const container of containers) {
    const result = extractArtifact(container, context);
    if (result.ok) {
      artifacts.push(result.artifact);
    } else {
      skipped[result.reason] += 1;
      if (result.reason === 'no-source' && result.candidate) {
        previewCandidates.push(result.candidate);
      }
    }
  }

  // Same id twice in one sweep (a panel rendered in two places) collapses to
  // one entry rather than racing to overwrite itself in storage.
  const unique = new Map<string, Artifact>();
  for (const artifact of artifacts) unique.set(artifact.id, artifact);

  return { artifacts: [...unique.values()], skipped, containersSeen: containers.length, previewCandidates };
}
