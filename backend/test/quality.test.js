import test from 'node:test';
import assert from 'node:assert/strict';
import { assessQuality } from '../src/helpers/assessQuality.helper.js';

test('quality counts real rejected rows and identifies missing fields without guessing a schema', () => {
  const quality = assessQuality({
    summary: { total: 5, accepted: 3, rejected: 2 },
    accepted: [
      { row: 1, normalized: { product: 'A', quantity: '2' } },
      { row: 2, normalized: { product: 'B', quantity: '' } },
      { row: 5, normalized: { product: 'C', quantity: '' } },
    ],
    rejected: [{ row: 3, reason: 'duplicate', original: { product: 'A', quantity: '2' } },
      { row: 4, reason: 'empty', original: { product: '', quantity: '' } }],
  });
  assert.deepEqual({ total: quality.totalProcessed, valid: quality.validRecords,
    rejected: quality.rejectedRecords, duplicates: quality.duplicates, incomplete: quality.incompleteRecords },
  { total: 5, valid: 1, rejected: 4, duplicates: 1, incomplete: 3 });
  assert.deepEqual(quality.errors, [
    { row: 2, reason: 'missing', field: 'quantity' }, { row: 3, reason: 'duplicate', field: null },
    { row: 4, reason: 'empty', field: null }, { row: 5, reason: 'missing', field: 'quantity' },
  ]);
});

test('column rules validate dates, money and types and corrections can resolve errors', () => {
  const result = { summary: { total: 2, accepted: 2, rejected: 0 }, rejected: [], accepted: [
    { row: 1, normalized: { date: '2026-02-30', amount: '1.234', count: 'x' } },
    { row: 2, normalized: { date: '2026-02-28', amount: '12.50', count: '2' } },
  ] };
  const rules = { date: 'date', amount: 'money', count: 'integer' };
  const invalid = assessQuality(result, rules);
  assert.equal(invalid.validRecords, 1);
  assert.deepEqual(invalid.errors.map((error) => error.reason), ['invalid_date', 'invalid_money', 'invalid_integer']);
  const corrected = assessQuality(result, rules, { 1: { date: '2026-02-27', amount: '1.23', count: '1' } });
  assert.equal(corrected.validRecords, 2);
  assert.deepEqual(corrected.errors, []);
});
