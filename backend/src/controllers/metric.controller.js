import { matchedData } from 'express-validator';
import { buildProcessedRecordFilters } from '../helpers/processedRecordFilters.helper.js';
import { calculateMetric } from '../helpers/calculateMetric.helper.js';

export const createMetricControllers = (database, models) => ({
  getMetric: async (req, res, next) => {
    try {
      const { metric, field } = matchedData(req, { locations: ['query'] });
      if (metric !== 'count' && !field) {
        throw Object.assign(new Error('Se requiere field para esta métrica'), { status: 400 });
      }
      if (metric === 'count' && field) {
        throw Object.assign(new Error('La métrica count no requiere field'), { status: 400 });
      }
      const { where, appliedFilters } = await buildProcessedRecordFilters(models, req);
      const result = await database.transaction((transaction) =>
        calculateMetric(models.ProcessedRecordModel, where, metric, field, transaction));
      return res.status(200).json({ message: 'Métrica obtenida', metric: {
        name: metric, field: field ?? null, filters: appliedFilters, ...result,
      } });
    } catch (error) { return next(error); }
  },
});
