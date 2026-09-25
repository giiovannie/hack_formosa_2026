import { matchedData } from 'express-validator';
import { buildProcessedRecordFilters } from '../helpers/processedRecordFilters.helper.js';
import { calculateHistoricalSeries } from '../helpers/historicalSeries.helper.js';
import { detectPatterns } from '../helpers/detectPatterns.helper.js';

export const createPatternControllers = (database, models) => ({
  analyze: async (req, res, next) => {
    try {
      const { from, to, interval, metric, field } = matchedData(req, { locations: ['query'] });
      if (from > to || (metric === 'count' ? !!field : !field)) {
        throw Object.assign(new Error('Período o métrica inválidos'), { status: 400 });
      }
      const { where, appliedFilters } = await buildProcessedRecordFilters(models, req);
      const points = await calculateHistoricalSeries(database, models, where, { from, to, interval, metric, field });
      const result = detectPatterns(points);
      return res.status(200).json({ message: result.status === 'insufficient_data' ? 'Información histórica insuficiente' : 'Patrones analizados',
        analysis: { metric, field: field ?? null, interval, from, to, filters: appliedFilters, ...result } });
    } catch (error) { return next(error); }
  },
});
