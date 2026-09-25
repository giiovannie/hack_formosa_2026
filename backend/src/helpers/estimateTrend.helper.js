const ordinal = (period, interval) => {
  if (interval === 'year') return Number(period);
  if (interval === 'month') {
    const [year, month] = period.split('-').map(Number);
    return year * 12 + month - 1;
  }
  return Math.floor(new Date(`${period}T00:00:00.000Z`).getTime() / 86400000);
};

const nextPeriod = (to, interval) => {
  const date = new Date(`${to}T00:00:00.000Z`);
  if (interval === 'day') date.setUTCDate(date.getUTCDate() + 1);
  else if (interval === 'month') { date.setUTCDate(1); date.setUTCMonth(date.getUTCMonth() + 1); }
  else { date.setUTCMonth(0, 1); date.setUTCFullYear(date.getUTCFullYear() + 1); }
  const iso = date.toISOString().slice(0, 10);
  return interval === 'year' ? iso.slice(0, 4) : interval === 'month' ? iso.slice(0, 7) : iso;
};

export const estimateTrend = (points, interval, to, metric) => {
  if (points.length < 3) return { status: 'insufficient_data', trend: null, estimate: null, evidence: points };
  const values = points.map((point) => Number(point.value));
  if (values.some((value) => !Number.isFinite(value) || Math.abs(value) > 1e12)) {
    return { status: 'not_estimable', trend: null, estimate: null, evidence: points };
  }
  const origin = ordinal(points[0].period, interval);
  const x = points.map((point) => ordinal(point.period, interval) - origin);
  const n = points.length;
  const sx = x.reduce((sum, value) => sum + value, 0);
  const sy = values.reduce((sum, value) => sum + value, 0);
  const sxx = x.reduce((sum, value) => sum + value * value, 0);
  const sxy = x.reduce((sum, value, index) => sum + value * values[index], 0);
  const denominator = n * sxx - sx * sx;
  if (denominator === 0) return { status: 'not_estimable', trend: null, estimate: null, evidence: points };
  const slope = (n * sxy - sx * sy) / denominator;
  const intercept = (sy - slope * sx) / n;
  const period = nextPeriod(to, interval);
  const rawEstimate = intercept + slope * (ordinal(period, interval) - origin);
  if (!Number.isFinite(rawEstimate)) return { status: 'not_estimable', trend: null, estimate: null, evidence: points };
  const value = metric === 'count' ? Math.max(0, rawEstimate) : rawEstimate;
  return {
    status: 'estimated',
    trend: { direction: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
      slopePerInterval: Number(slope.toFixed(6)), method: 'least_squares_linear' },
    estimate: { kind: 'estimate', period, value: Number(value.toFixed(6)), method: 'least_squares_linear' },
    evidence: points,
  };
};
