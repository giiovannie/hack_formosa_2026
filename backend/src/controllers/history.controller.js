import { Op } from 'sequelize';
import { matchedData } from 'express-validator';
import { buildProcessedRecordFilters } from '../helpers/processedRecordFilters.helper.js';
import { calculateMetric, subtractMetricValues } from '../helpers/calculateMetric.helper.js';

const invalid = (message) => Object.assign(new Error(message), { status: 400 });
const dayAfter = (date) => { const result = new Date(`${date}T00:00:00.000Z`); result.setUTCDate(result.getUTCDate() + 1); return result; };
const wherePeriod = (base, start, endExclusive) => ({ ...base, createdAt: { [Op.gte]: start, [Op.lt]: endExclusive } });
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

export const createHistoryControllers = (database, models) => ({
  compare: async (req, res, next) => {
    try {
      const { fromA, toA, fromB, toB, metric, field } = matchedData(req, { locations: ['query'] });
      if (fromA > toA || fromB > toB || (metric === 'count' ? !!field : !field)) throw invalid('Períodos o métrica inválidos');
      const { where, appliedFilters } = await buildProcessedRecordFilters(models, req);
      const [periodA, periodB] = await database.transaction(async (transaction) => Promise.all([
        calculateMetric(models.ProcessedRecordModel, wherePeriod(where, new Date(`${fromA}T00:00:00.000Z`), dayAfter(toA)), metric, field, transaction),
        calculateMetric(models.ProcessedRecordModel, wherePeriod(where, new Date(`${fromB}T00:00:00.000Z`), dayAfter(toB)), metric, field, transaction),
      ]));
      return res.status(200).json({ message: 'Comparación obtenida', comparison: {
        metric, field: field ?? null, filters: appliedFilters,
        periodA: { from: fromA, to: toA, ...periodA }, periodB: { from: fromB, to: toB, ...periodB },
        difference: subtractMetricValues(periodB.value, periodA.value),
      } });
    } catch (error) { return next(error); }
  },
  series: async (req, res, next) => {
    try {
      const { from, to, interval, metric, field } = matchedData(req, { locations: ['query'] });
      if (from > to || (metric === 'count' ? !!field : !field)) throw invalid('Período o métrica inválidos');
      const { where, appliedFilters } = await buildProcessedRecordFilters(models, req);
      const end = dayAfter(to);
      let cursor = new Date(`${from}T00:00:00.000Z`);
      const periods = [];
      while (cursor < end) {
        if (periods.length >= 120) throw invalid('El período supera 120 intervalos');
        const next = nextBoundary(cursor, interval);
        periods.push({ label: labelFor(cursor, interval), start: new Date(cursor), end: next < end ? next : end });
        cursor = next < end ? next : end;
      }
      const points = await database.transaction(async (transaction) => {
        const result = [];
        for (const period of periods) {
          const value = await calculateMetric(models.ProcessedRecordModel,
            wherePeriod(where, period.start, period.end), metric, field, transaction);
          if (value.includedRecords > 0) result.push({ period: period.label, ...value });
        }
        return result;
      });
      return res.status(200).json({ message: 'Serie histórica obtenida', series: {
        metric, field: field ?? null, interval, filters: appliedFilters, from, to, points,
      } });
    } catch (error) { return next(error); }
  },
});
