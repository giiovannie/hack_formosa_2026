import test from 'node:test';
import assert from 'node:assert/strict';
import { detectPatterns } from '../src/helpers/detectPatterns.helper.js';

test('pattern detection reports insufficient data or exact recurrence with evidence', () => {
  assert.deepEqual(detectPatterns([{ period: '2026-01', value: 2, includedRecords: 2 }]),
    { status: 'insufficient_data', patterns: [], observedPeriods: 1 });
  const points = ['2026-01', '2026-02', '2026-03', '2026-04'].map((period) => ({ period, value: 2, includedRecords: 2 }));
  const result = detectPatterns(points);
  assert.equal(result.status, 'analyzed');
  assert.equal(result.patterns[0].type, 'repeated_value');
  assert.equal(result.patterns[0].occurrences, 4);
  assert.deepEqual(result.patterns[0].evidence, points);
  assert.deepEqual(detectPatterns(points.map((point, index) => ({ ...point, value: index }))).patterns, []);
});
