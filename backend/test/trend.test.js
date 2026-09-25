import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateTrend } from '../src/helpers/estimateTrend.helper.js';

test('trend uses real periods and labels extrapolation as an estimate', () => {
  const points = [
    { period: '2026-01', value: 1, includedRecords: 1 },
    { period: '2026-03', value: 3, includedRecords: 3 },
    { period: '2026-05', value: 5, includedRecords: 5 },
  ];
  const result = estimateTrend(points, 'month', '2026-05-31', 'count');
  assert.equal(result.status, 'estimated');
  assert.deepEqual(result.trend, { direction: 'increasing', slopePerInterval: 1, method: 'least_squares_linear' });
  assert.deepEqual(result.estimate, { kind: 'estimate', period: '2026-06', value: 6, method: 'least_squares_linear' });
  assert.deepEqual(result.evidence, points);
  assert.equal(estimateTrend(points.slice(0, 2), 'month', '2026-05-31', 'count').status, 'insufficient_data');
  assert.equal(estimateTrend(points.map((point) => ({ ...point, value: '999999999999999999' })),
    'month', '2026-05-31', 'sum').status, 'not_estimable');
});
