import { describe, expect, it } from 'vitest';

import { formatBytes, formatCount, formatDate } from './format.ts';

const FIXTURE_EPOCH = Date.parse('2026-07-31T12:00:00Z');

describe('formatDate', () => {
  it('formats an epoch timestamp using the given locale', () => {
    expect(formatDate(FIXTURE_EPOCH, 'en')).toBe('Jul 31, 2026');
    expect(formatDate(FIXTURE_EPOCH, 'ar')).toBe('31 يوليو 2026');
  });

  it('returns an empty string for a non-finite input instead of "Invalid Date"', () => {
    expect(formatDate(Number.NaN, 'en')).toBe('');
    expect(formatDate(Number.POSITIVE_INFINITY, 'en')).toBe('');
  });
});

describe('formatCount', () => {
  it('formats an integer with locale grouping', () => {
    expect(formatCount(1234, 'en')).toBe('1,234');
  });

  it('formats zero', () => {
    expect(formatCount(0, 'en')).toBe('0');
  });
});

describe('formatBytes', () => {
  it('picks the byte/kilobyte/megabyte unit based on magnitude', () => {
    expect(formatBytes(500, 'en')).toBe('500 byte');
    expect(formatBytes(2048, 'en')).toBe('2 kB');
    expect(formatBytes(5 * 1024 * 1024, 'en')).toBe('5 MB');
  });

  it('normalizes a negative or non-finite size to "0 byte" instead of throwing or showing a negative figure', () => {
    expect(formatBytes(-42, 'en')).toBe('0 byte');
    expect(formatBytes(Number.NaN, 'en')).toBe('0 byte');
  });
});
