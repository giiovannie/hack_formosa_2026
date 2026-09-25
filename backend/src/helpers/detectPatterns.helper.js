export const detectPatterns = (points) => {
  if (points.length < 3) return { status: 'insufficient_data', patterns: [], observedPeriods: points.length };
  const occurrences = new Map();
  for (const point of points) {
    const key = `${typeof point.value}:${point.value}`;
    if (!occurrences.has(key)) occurrences.set(key, []);
    occurrences.get(key).push({ period: point.period, value: point.value, includedRecords: point.includedRecords });
  }
  const patterns = [...occurrences.values()].filter((evidence) => evidence.length >= 3).map((evidence) => ({
    type: 'repeated_value', value: evidence[0].value, occurrences: evidence.length, evidence,
  }));
  return { status: 'analyzed', patterns, observedPeriods: points.length };
};
