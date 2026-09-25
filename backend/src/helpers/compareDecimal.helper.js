import { parseDecimal } from './calculateMetric.helper.js';

export const compareDecimal = (left, right) => {
  const a = parseDecimal(left);
  const b = parseDecimal(right);
  if (!a || !b) return null;
  const scale = Math.max(a.scale, b.scale);
  const aUnits = a.units * 10n ** BigInt(scale - a.scale);
  const bUnits = b.units * 10n ** BigInt(scale - b.scale);
  return aUnits < bUnits ? -1 : aUnits > bUnits ? 1 : 0;
};
