import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateMetric, subtractMetricValues } from '../src/helpers/calculateMetric.helper.js';
import { compareDecimal } from '../src/helpers/compareDecimal.helper.js';

const rows = [
  { values: { amount: '-0.1' } },
  { values: { amount: '0.2' } },
  { values: { amount: 'no disponible' } },
  { values: {} },
];
const model = {
  count: async () => rows.length,
  findAll: async ({ offset, limit }) => rows.slice(offset, offset + limit),
};

test('metrics preserve decimal precision and disclose skipped records', async () => {
  assert.deepEqual(await calculateMetric(model, {}, 'count'), { value: 4, includedRecords: 4, skippedRecords: 0 });
  assert.deepEqual(await calculateMetric(model, {}, 'sum', 'amount'), { value: '0.1', includedRecords: 2, skippedRecords: 2 });
  assert.equal((await calculateMetric(model, {}, 'average', 'amount')).value, '0.05');
  assert.equal((await calculateMetric(model, {}, 'min', 'amount')).value, '-0.1');
  assert.equal((await calculateMetric(model, {}, 'max', 'amount')).value, '0.2');
  assert.deepEqual(await calculateMetric(model, {}, 'sum', 'missing'), { value: null, includedRecords: 0, skippedRecords: 4 });
});

test('historical differences keep decimal precision and do not invent missing values', () => {
  assert.equal(subtractMetricValues('0.2', '0.1'), '0.1');
  assert.equal(subtractMetricValues('0.1', '0.2'), '-0.1');
  assert.equal(subtractMetricValues(3, 1), 2);
  assert.equal(subtractMetricValues(null, '1'), null);
});

test('alert thresholds compare decimals exactly across different scales', () => {
  assert.equal(compareDecimal('0.10', '0.1'), 0);
  assert.equal(compareDecimal('-0.2', '-0.10'), -1);
  assert.equal(compareDecimal('9007199254740993', '9007199254740992'), 1);
  assert.equal(compareDecimal('invalid', '1'), null);
});
