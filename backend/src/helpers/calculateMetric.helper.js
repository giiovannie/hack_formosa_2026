// Generic arithmetic over values that passed ETL and quality. No business field is inferred.
export const parseDecimal = (value) => {
  const text = String(value ?? '').trim();
  if (!/^-?\d+(?:\.\d+)?$/.test(text) || text.length > 100) return null;
  const negative = text.startsWith('-');
  const [whole, fraction = ''] = (negative ? text.slice(1) : text).split('.');
  return { units: BigInt(`${negative ? '-' : ''}${whole}${fraction}`), scale: fraction.length };
};

export const formatDecimal = (units, scale) => {
  const sign = units < 0n ? '-' : '';
  const digits = (units < 0n ? -units : units).toString().padStart(scale + 1, '0');
  if (scale === 0) return `${sign}${digits}`;
  const whole = digits.slice(0, -scale);
  const fraction = digits.slice(-scale).replace(/0+$/, '');
  return fraction ? `${sign}${whole}.${fraction}` : `${sign}${whole}`;
};

export const subtractMetricValues = (current, previous) => {
  if (current === null || previous === null) return null;
  if (typeof current === 'number' && typeof previous === 'number') return current - previous;
  const a = parseDecimal(current);
  const b = parseDecimal(previous);
  if (!a || !b) return null;
  const scale = Math.max(a.scale, b.scale);
  const left = a.units * 10n ** BigInt(scale - a.scale);
  const right = b.units * 10n ** BigInt(scale - b.scale);
  return formatDecimal(left - right, scale);
};

export const calculateMetric = async (ProcessedRecordModel, where, metric, field, transaction) => {
  if (metric === 'count') {
    const value = await ProcessedRecordModel.count({ where, transaction });
    return { value, includedRecords: value, skippedRecords: 0 };
  }
  let offset = 0;
  let includedRecords = 0;
  let skippedRecords = 0;
  let scale = 0;
  let sum = 0n;
  let minimum = null;
  let maximum = null;
  while (true) {
    const rows = await ProcessedRecordModel.findAll({ where, attributes: ['id', 'values'], order: [['id', 'ASC']],
      limit: 500, offset, transaction });
    if (!rows.length) break;
    for (const row of rows) {
      const parsed = Object.hasOwn(row.values, field) ? parseDecimal(row.values[field]) : null;
      if (!parsed) { skippedRecords += 1; continue; }
      if (parsed.scale > scale) {
        const factor = 10n ** BigInt(parsed.scale - scale);
        sum *= factor;
        if (minimum !== null) minimum *= factor;
        if (maximum !== null) maximum *= factor;
        scale = parsed.scale;
      }
      const units = parsed.units * (10n ** BigInt(scale - parsed.scale));
      sum += units;
      minimum = minimum === null || units < minimum ? units : minimum;
      maximum = maximum === null || units > maximum ? units : maximum;
      includedRecords += 1;
    }
    offset += rows.length;
    if (rows.length < 500) break;
  }
  if (!includedRecords) return { value: null, includedRecords, skippedRecords };
  if (metric === 'sum') return { value: formatDecimal(sum, scale), includedRecords, skippedRecords };
  if (metric === 'min') return { value: formatDecimal(minimum, scale), includedRecords, skippedRecords };
  if (metric === 'max') return { value: formatDecimal(maximum, scale), includedRecords, skippedRecords };
  const multiplier = 10n ** 6n;
  const numerator = sum * multiplier;
  const denominator = BigInt(includedRecords);
  const quotient = numerator / denominator;
  const remainder = numerator % denominator;
  const rounded = quotient + (remainder < 0n ? -1n : 1n) * (2n * (remainder < 0n ? -remainder : remainder) >= denominator ? 1n : 0n);
  return { value: formatDecimal(rounded, scale + 6), includedRecords, skippedRecords };
};
