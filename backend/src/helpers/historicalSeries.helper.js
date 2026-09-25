import { Op } from 'sequelize';
import { calculateMetric } from './calculateMetric.helper.js';

export const dayAfter = (date) => { const result = new Date(`${date}T00:00:00.000Z`); result.setUTCDate(result.getUTCDate() + 1); return result; };
export const wherePeriod = (base, start, endExclusive) => ({ ...base, createdAt: { [Op.gte]: start, [Op.lt]: endExclusive } });

const labelFor = (date, interval) => {
  const iso = date.toISOString().slice(0, 10);
  return interval === 'year' ? iso.slice(0, 4) : interval === 'month' ? iso.slice(0, 7) : iso;
};
const nextBoundary = (date, interval) => {
  const next = new Date(date);
  if (interval === 'day') next.setUTCDate(next.getUTCDate() + 1);
  else if (interval === 'month') { next.setUTCDate(1); next.setUTCMonth(next.getUTCMonth() + 1); }
  else { next.setUTCMonth(0, 1); next.setUTCFullYear(next.getUTCFullYear() + 1); }
  return next;
};

export const calculateHistoricalSeries = async (database, models, where, { from, to, interval, metric, field }) => {
  const end = dayAfter(to);
  let cursor = new Date(`${from}T00:00:00.000Z`);
  const periods = [];
  while (cursor < end) {
    if (periods.length >= 120) throw Object.assign(new Error('El período supera 120 intervalos'), { status: 400 });
    const next = nextBoundary(cursor, interval);
    periods.push({ label: labelFor(cursor, interval), start: new Date(cursor), end: next < end ? next : end });
    cursor = next < end ? next : end;
  }
  return database.transaction(async (transaction) => {
    const points = [];
    for (const period of periods) {
      const value = await calculateMetric(models.ProcessedRecordModel,
        wherePeriod(where, period.start, period.end), metric, field, transaction);
      if (value.includedRecords > 0) points.push({ period: period.label, ...value });
    }
    return points;
  });
};
