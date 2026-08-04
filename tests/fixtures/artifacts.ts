/**
 * Fixture vault — realistic Claude artifacts, not lorem ipsum (CLAUDE.md, Data).
 *
 * Titles, filenames and sizes are typical of what claude.ai actually produces,
 * including the long-title and odd-filename cases that break narrow layouts.
 * Shared by the state-matrix preview and by unit tests so both exercise the
 * same data.
 */

import type { Artifact } from '../../src/types/index.ts';

/** Fixed clock so generated previews and snapshots are byte-stable. */
export const FIXTURE_NOW = Date.parse('2026-07-31T12:00:00Z');

const day = 24 * 60 * 60 * 1000;

export const ARTIFACT_FIXTURES: readonly Artifact[] = [
  {
    id: 'art_01H8X',
    title: 'Pricing table with annual toggle',
    filename: 'pricing-table.tsx',
    type: 'react',
    language: 'tsx',
    content:
      "import { useState } from 'react';\n\nexport function PricingTable({ plans }: Props) {\n  const [annual, setAnnual] = useState(false);\n  return <div className=\"grid\">…</div>;\n}\n",
    bytes: 4312,
    createdAt: FIXTURE_NOW - 2 * day,
    conversationId: 'conv_a1',
    pinned: true,
  },
  {
    id: 'art_02K3P',
    title: 'Onboarding flow diagram',
    filename: 'onboarding-flow.svg',
    type: 'svg',
    language: null,
    content: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400">…</svg>',
    bytes: 11_204,
    createdAt: FIXTURE_NOW - 1 * day,
    conversationId: 'conv_a1',
    pinned: false,
  },
  {
    id: 'art_03M9Q',
    title: 'Postgres migration: add composite index on (tenant_id, created_at)',
    filename: '20260728_add_composite_index.sql',
    type: 'code',
    language: 'sql',
    content:
      'CREATE INDEX CONCURRENTLY idx_events_tenant_created\n  ON events (tenant_id, created_at DESC);\n',
    bytes: 892,
    createdAt: FIXTURE_NOW - 3 * day,
    conversationId: 'conv_b2',
    pinned: false,
  },
  {
    id: 'art_04R7T',
    title: 'API integration guide',
    filename: 'api-integration-guide.md',
    type: 'markdown',
    language: null,
    content: '# API integration guide\n\n## Authentication\n\nEvery request needs…\n',
    bytes: 7_640,
    createdAt: FIXTURE_NOW - 5 * day,
    conversationId: 'conv_c3',
    pinned: false,
  },
  {
    id: 'art_05W2Z',
    title: 'Email receipt template',
    filename: 'receipt-email.html',
    type: 'html',
    language: null,
    content: '<!doctype html>\n<html>\n  <body style="margin:0">…</body>\n</html>\n',
    bytes: 15_871,
    createdAt: FIXTURE_NOW - 9 * day,
    conversationId: 'conv_c3',
    pinned: false,
  },
  {
    id: 'art_06B4N',
    title: 'Debounce hook',
    filename: 'use-debounce.ts',
    type: 'code',
    language: 'typescript',
    content:
      'export function useDebounce<T>(value: T, delay = 200): T {\n  const [debounced, setDebounced] = useState(value);\n  …\n}\n',
    bytes: 1_045,
    createdAt: FIXTURE_NOW - 12 * day,
    conversationId: 'conv_d4',
    pinned: false,
  },
];

/** Arabic-locale fixture, so RTL previews contain real RTL titles. */
export const ARTIFACT_FIXTURES_AR: readonly Artifact[] = [
  { ...ARTIFACT_FIXTURES[0]!, title: 'جدول أسعار مع تبديل سنوي' },
  { ...ARTIFACT_FIXTURES[1]!, title: 'مخطط تدفق الإعداد' },
  { ...ARTIFACT_FIXTURES[2]!, title: 'ترحيل قاعدة البيانات: فهرس مركّب على (المستأجر، تاريخ الإنشاء)' },
  { ...ARTIFACT_FIXTURES[3]!, title: 'دليل تكامل واجهة البرمجة' },
  { ...ARTIFACT_FIXTURES[4]!, title: 'قالب إيصال بالبريد الإلكتروني' },
  { ...ARTIFACT_FIXTURES[5]!, title: 'خطاف تأخير الاستجابة' },
];

/**
 * Emulates chrome.storage.local.getBytesInUse() for one artifact: Chrome bills
 * the key string plus the JSON-serialised value, and the vault stores one key
 * per artifact. Static previews have no chrome.* to ask, so they compute the
 * same number this way — never `artifact.bytes`, which is a declared content
 * length and is not a storage figure (CLAUDE.md, Rules).
 */
export function fixtureStorageBytes(artifact: Artifact): number {
  return `abrium.artifact.${artifact.id}`.length + JSON.stringify(artifact).length;
}

/** Per-artifact real-usage map, shaped like storage.getArtifactSizes(). */
export const FIXTURE_SIZES: ReadonlyMap<string, number> = new Map(
  ARTIFACT_FIXTURES.map((artifact) => [artifact.id, fixtureStorageBytes(artifact)]),
);

export const FIXTURE_USED_BYTES = ARTIFACT_FIXTURES.reduce(
  (total, artifact) => total + fixtureStorageBytes(artifact),
  0,
);
