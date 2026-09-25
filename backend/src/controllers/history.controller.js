import { matchedData } from 'express-validator';
import { buildProcessedRecordFilters } from '../helpers/processedRecordFilters.helper.js';
import { calculateMetric, subtractMetricValues } from '../helpers/calculateMetric.helper.js';
import { dayAfter, wherePeriod, calculateHistoricalSeries } from '../helpers/historicalSeries.helper.js';

const invalid = (message) => Object.assign(new Error(message), { status: 400 });

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
      const points = await calculateHistoricalSeries(database, models, where, { from, to, interval, metric, field });
      return res.status(200).json({ message: 'Serie histórica obtenida', series: {
        metric, field: field ?? null, interval, filters: appliedFilters, from, to, points,
      } });
    } catch (error) { return next(error); }
  },
});
