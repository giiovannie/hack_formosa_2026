import { matchedData } from 'express-validator';
import { buildProcessedRecordFiltersFromValues } from '../helpers/processedRecordFilters.helper.js';
import { calculateMetric } from '../helpers/calculateMetric.helper.js';
import { calculateHistoricalSeries } from '../helpers/historicalSeries.helper.js';
import { toCsv } from '../helpers/csv.helper.js';

const invalid = (message) => Object.assign(new Error(message), { status: 400 });

export const createExportControllers = (database, models) => ({
  create: async (req, res, next) => {
    try {
      const { kind, format, from, to, dataType, sourceId, metric, field, interval } = matchedData(req, { locations: ['body'] });
      if (format !== 'csv' || (from && to && from > to) ||
          (kind === 'records' ? !!(metric || field || interval) :
            (!metric || (metric === 'count' ? !!field : !field) || (kind === 'history' ? !from || !to || !interval : !!interval)))) {
        throw invalid('Parámetros de exportación inválidos');
      }
      const { where, appliedFilters } = await buildProcessedRecordFiltersFromValues(models, req.user.companyId,
        { from, to, dataType, sourceId });
      let headers;
      let rows;
      if (kind === 'records') {
        const records = await models.ProcessedRecordModel.findAll({ where, order: [['id', 'ASC']], limit: 10001 });
        if (records.length > 10000) throw Object.assign(new Error('Demasiados registros para exportar'), { status: 413 });
        headers = ['id', 'sourceId', 'dataImportId', 'processingRunId', 'rowNumber', 'dataType', 'createdAt', 'values'];
        rows = records.map((record) => [record.id, record.sourceId, record.dataImportId, record.processingRunId,
          record.rowNumber, record.dataType, record.createdAt.toISOString(), record.values]);
      } else if (kind === 'metric') {
        const result = await database.transaction((transaction) =>
          calculateMetric(models.ProcessedRecordModel, where, metric, field, transaction));
        headers = ['metric', 'field', 'from', 'to', 'value', 'includedRecords', 'skippedRecords'];
        rows = [[metric, field ?? '', from ?? '', to ?? '', result.value, result.includedRecords, result.skippedRecords]];
      } else {
        const points = await calculateHistoricalSeries(database, models, where, { from, to, interval, metric, field });
        headers = ['period', 'metric', 'field', 'value', 'includedRecords', 'skippedRecords'];
        rows = points.map((point) => [point.period, metric, field ?? '', point.value, point.includedRecords, point.skippedRecords]);
      }
      const csv = toCsv(headers, rows);
      if (Buffer.byteLength(csv) > 20 * 1024 * 1024) {
        throw Object.assign(new Error('Archivo de exportación demasiado grande'), { status: 413 });
      }
      const exportRecord = await models.ExportRecordModel.create({ companyId: req.user.companyId, userId: req.user.id,
        kind, format, filters: { ...appliedFilters, metric: metric ?? null, field: field ?? null, interval: interval ?? null },
        rowCount: rows.length, status: 'completed' });
      res.set('Cache-Control', 'no-store');
      res.set('X-Export-Id', String(exportRecord.id));
      res.attachment(`${kind}-${exportRecord.id}.csv`);
      res.type('text/csv; charset=utf-8');
      return res.status(200).send(csv);
    } catch (error) { return next(error); }
  },
  list: async (req, res, next) => {
    try {
      const exports = await models.ExportRecordModel.findAll({ where: { companyId: req.user.companyId },
        attributes: ['id', 'kind', 'format', 'filters', 'rowCount', 'status', 'createdAt'], order: [['id', 'DESC']], limit: 100 });
      return res.status(200).json({ message: 'Exportaciones obtenidas', exports });
    } catch (error) { return next(error); }
  },
});
