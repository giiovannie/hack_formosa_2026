import { matchedData } from 'express-validator';
import { buildProcessedRecordFilters } from '../helpers/processedRecordFilters.helper.js';
import { calculateHistoricalSeries } from '../helpers/historicalSeries.helper.js';
import { estimateTrend } from '../helpers/estimateTrend.helper.js';

export const createTrendControllers = (database, models) => ({
  analyze: async (req, res, next) => {
    try {
      const { from, to, interval, metric, field } = matchedData(req, { locations: ['query'] });
      if (from > to || (metric === 'count' ? !!field : !field)) {
        throw Object.assign(new Error('Período o métrica inválidos'), { status: 400 });
      }
      const { where, appliedFilters } = await buildProcessedRecordFilters(models, req);
      const points = await calculateHistoricalSeries(database, models, where, { from, to, interval, metric, field });
      const result = estimateTrend(points, interval, to, metric);
      return res.status(200).json({ message: 'Tendencia analizada', analysis: {
        metric, field: field ?? null, from, to, interval, filters: appliedFilters, ...result,
      } });
    } catch (error) { return next(error); }
  },
});
