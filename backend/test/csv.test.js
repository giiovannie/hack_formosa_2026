import test from 'node:test';
import assert from 'node:assert/strict';
import { toCsv } from '../src/helpers/csv.helper.js';

test('CSV quotes delimiters and neutralizes spreadsheet formulas in text', () => {
  const csv = toCsv(['name', 'value'], [['A,"B"', '=SUM(1,1)'], ['safe', '-2.5']]);
  assert.match(csv, /^\uFEFF"name","value"\r\n"A,""B""","'=SUM\(1,1\)"\r\n"safe","-2\.5"\r\n$/);
});
