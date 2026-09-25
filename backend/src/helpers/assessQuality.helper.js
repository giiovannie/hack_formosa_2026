const dateIsValid = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};

const matches = (value, type) => {
  switch (type) {
    case 'text': return true;
    case 'integer': return /^-?\d+$/.test(value) && Number.isSafeInteger(Number(value));
    case 'number': return /^-?\d+(?:\.\d+)?$/.test(value) && Number.isFinite(Number(value));
    case 'money': return /^-?\d+(?:\.\d{1,2})?$/.test(value) && Number.isFinite(Number(value));
    case 'date': return dateIsValid(value);
    case 'email': return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    default: return false;
  }
};

export const assessQuality = (result, rules = {}, corrections = {}) => {
  const records = [...result.accepted, ...result.rejected].sort((a, b) => a.row - b.row);
  const seen = new Set();
  const errors = [];
  let validRecords = 0;
  let duplicates = 0;
  let incompleteRecords = 0;
  for (const item of records) {
    const corrected = corrections[item.row];
    const values = corrected || item.normalized || item.original;
    if (!values || typeof values !== 'object' || Array.isArray(values)) {
      errors.push({ row: item.row, field: null, reason: 'invalid' });
      continue;
    }
    const normalized = Object.fromEntries(Object.entries(values).map(([key, value]) => [key.trim(), String(value ?? '').trim()]));
    const fields = Object.entries(normalized);
    if (!fields.length || fields.every(([, value]) => value === '')) {
      errors.push({ row: item.row, field: null, reason: 'empty' });
      incompleteRecords += 1;
      continue;
    }
    const fingerprint = JSON.stringify(Object.fromEntries([...fields].sort(([a], [b]) => a.localeCompare(b))));
    if (seen.has(fingerprint)) {
      errors.push({ row: item.row, field: null, reason: 'duplicate' });
      duplicates += 1;
      continue;
    }
    seen.add(fingerprint);
    let invalid = false;
    let incomplete = false;
    for (const [field, value] of fields) {
      if (value === '') {
        errors.push({ row: item.row, field, reason: 'missing' });
        invalid = true;
        incomplete = true;
      } else if (Object.hasOwn(rules, field) && !matches(value, rules[field])) {
        errors.push({ row: item.row, field, reason: `invalid_${rules[field]}` });
        invalid = true;
      }
    }
    if (incomplete) incompleteRecords += 1;
    if (!invalid) validRecords += 1;
  }
  return { totalProcessed: records.length, validRecords, rejectedRecords: records.length - validRecords,
    duplicates, incompleteRecords, errors };
};
