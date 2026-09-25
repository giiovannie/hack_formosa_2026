import { matchedData } from 'express-validator';
import { buildProcessedRecordFilters } from '../helpers/processedRecordFilters.helper.js';

const invalid = (message) => Object.assign(new Error(message), { status: 400 });
const periodLabel = (date, interval) => {
  const iso = date.toISOString().slice(0, 10);
  return interval === 'year' ? iso.slice(0, 4) : interval === 'month' ? iso.slice(0, 7) : iso;
};
const sortedCounts = (map, key) => [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
  .map(([label, count]) => ({ [key]: label, count }));

export const createProductivityControllers = (models) => ({
  getIndicators: async (req, res, next) => {
    try {
      const { from, to, interval, dataType, areaField, area, operationField, employeeField, employee } =
        matchedData(req, { locations: ['query'] });
      if (from > to || (area && !areaField) || (!!employee !== !!employeeField)) {
        throw invalid('Filtros de productividad inválidos');
      }
      const { where, appliedFilters } = await buildProcessedRecordFilters(models, req);
      const periods = new Map();
      const areas = new Map();
      const operations = new Map();
      let total = 0;
      let missingArea = 0;
      let missingOperation = 0;
      let offset = 0;
      while (true) {
        const rows = await models.ProcessedRecordModel.findAll({ where, attributes: ['id', 'values', 'createdAt'],
          order: [['id', 'ASC']], limit: 500, offset });
        if (!rows.length) break;
        for (const row of rows) {
          const values = row.values;
          if (employee && String(values[employeeField] ?? '').trim() !== employee) continue;
          const areaValue = areaField ? String(values[areaField] ?? '').trim() : '';
          if (area && areaValue !== area) continue;
          total += 1;
          const period = periodLabel(row.createdAt, interval);
          periods.set(period, (periods.get(period) || 0) + 1);
          if (areaField) {
            if (areaValue) areas.set(areaValue, (areas.get(areaValue) || 0) + 1);
            else missingArea += 1;
          }
          if (operationField) {
            const operation = String(values[operationField] ?? '').trim();
            if (operation) operations.set(operation, (operations.get(operation) || 0) + 1);
            else missingOperation += 1;
          }
          if (areas.size > 1000 || operations.size > 1000) throw invalid('Demasiadas categorías para una consulta');
        }
        offset += rows.length;
        if (rows.length < 500) break;
      }
      return res.status(200).json({ message: 'Indicadores de productividad obtenidos', indicators: {
        dataType, from, to, interval, filters: { ...appliedFilters, areaField: areaField ?? null, area: area ?? null,
          operationField: operationField ?? null, employeeField: employeeField ?? null, employee: employee ?? null },
        totalOperations: total,
        averagePerObservedPeriod: periods.size ? Number((total / periods.size).toFixed(6)) : null,
        periods: sortedCounts(periods, 'period'), byArea: sortedCounts(areas, 'area'),
        byOperation: sortedCounts(operations, 'operation'), missingArea, missingOperation,
        interpretation: 'descriptive',
      } });
    } catch (error) { return next(error); }
  },
});
