import { matchedData } from 'express-validator';

const missing = () => Object.assign(new Error('Importación o registro no encontrado'), { status: 404 });
const notReady = () => Object.assign(new Error('Se requiere ETL y validación de calidad'), { status: 409 });

const loadedStages = (stages = [], loadedRecords = 0) => {
  let foundLoading = false;
  const updated = stages.map((stage) => {
    if (stage.name !== 'loading') return stage;
    foundLoading = true;
    return { ...stage, status: 'completed', loadedRecords };
  });
  if (!foundLoading) updated.push({ name: 'loading', status: 'completed', loadedRecords });
  return updated;
};

export const createProcessedRecordControllers = (database, models) => ({
  persist: async (req, res, next) => {
    try {
      const { importacionId } = matchedData(req, { locations: ['params'] });
      const output = await database.transaction(async (transaction) => {
        const dataImport = await models.DataImportModel.findOne({ where: { id: importacionId, companyId: req.user.companyId }, transaction });
        if (!dataImport) throw missing();
        const run = await models.ProcessingRunModel.findOne({ where: { companyId: req.user.companyId,
          dataImportId: dataImport.id, status: 'completed' }, order: [['id', 'DESC']], transaction, lock: transaction.LOCK.UPDATE });
        if (typeof run?.result === 'string') {
          try { run.setDataValue('result', JSON.parse(run.result)); }
          catch { throw notReady(); }
        }
        if (!run?.result?.quality || !Array.isArray(run.result.accepted) || !Array.isArray(run.result.rejected)) throw notReady();
        const count = await models.ProcessedRecordModel.count({ where: { companyId: req.user.companyId, processingRunId: run.id }, transaction });
        if (count) {
          await run.update({ stages: loadedStages(run.stages, count) }, { transaction });
          return { processingRunId: run.id, persistedRecords: count, alreadyPersisted: true };
        }
        const rejectedRows = new Set(run.result.quality.errors.map((error) => error.row));
        const corrections = run.result.corrections || {};
        const candidates = [...run.result.accepted, ...run.result.rejected];
        const records = candidates.filter((item) => !rejectedRows.has(item.row)).map((item) => {
          const values = corrections[item.row] || item.normalized || item.original;
          return {
            companyId: req.user.companyId, sourceId: dataImport.sourceId, dataImportId: dataImport.id,
            processingRunId: run.id, rowNumber: item.row, dataType: dataImport.dataType,
            values: Object.fromEntries(Object.entries(values).map(([key, value]) => [key.trim(), String(value ?? '').trim()])),
          };
        });
        if (records.length !== run.result.quality.validRecords) {
          throw Object.assign(new Error('La calidad debe recalcularse'), { status: 409 });
        }
        if (records.length) await models.ProcessedRecordModel.bulkCreate(records, { transaction });
        await run.update({ stages: loadedStages(run.stages, records.length) }, { transaction });
        return { processingRunId: run.id, persistedRecords: records.length, alreadyPersisted: false };
      });
      return res.status(200).json({ message: 'Datos procesados almacenados', ...output });
    } catch (error) { return next(error); }
  },
  list: async (req, res, next) => {
    try {
      const { page, limit } = matchedData(req, { locations: ['query'] });
      const { count, rows } = await models.ProcessedRecordModel.findAndCountAll({
        where: { companyId: req.user.companyId }, limit, offset: (page - 1) * limit, order: [['id', 'ASC']],
      });
      return res.status(200).json({ message: 'Datos procesados obtenidos', records: rows,
        pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } });
    } catch (error) { return next(error); }
  },
  getById: async (req, res, next) => {
    try {
      const { id } = matchedData(req, { locations: ['params'] });
      const record = await models.ProcessedRecordModel.findOne({ where: { id, companyId: req.user.companyId } });
      if (!record) throw missing();
      return res.status(200).json({ message: 'Dato procesado obtenido', record });
    } catch (error) { return next(error); }
  },
});
