import { matchedData } from 'express-validator';
import { assessQuality } from '../helpers/assessQuality.helper.js';

const notFound = () => Object.assign(new Error('Calidad o importación no encontrada'), { status: 404 });
const conflict = () => Object.assign(new Error('La importación debe procesarse primero'), { status: 409 });

export const createQualityControllers = (database, models) => {
  const latest = async (companyId, dataImportId, transaction, lock) => {
    const dataImport = await models.DataImportModel.findOne({ where: { id: dataImportId, companyId }, transaction });
    if (!dataImport) throw notFound();
    const run = await models.ProcessingRunModel.findOne({ where: { companyId, dataImportId, status: 'completed' },
      order: [['id', 'DESC']], transaction, ...(lock ? { lock: transaction.LOCK.UPDATE } : {}) });
    if (!run) throw conflict();
    return run;
  };
  const publicQuality = (run) => {
    if (!run.result?.quality) throw notFound();
    const { errors, ...quality } = run.result.quality;
    return { processId: run.id, dataImportId: run.dataImportId, quality };
  };
  return {
    validateImport: async (req, res, next) => {
      try {
        const { importacionId } = matchedData(req, { locations: ['params'] });
        const { rules = {} } = matchedData(req, { locations: ['body'] });
        const output = await database.transaction(async (transaction) => {
          const run = await latest(req.user.companyId, importacionId, transaction, true);
          if (await models.ProcessedRecordModel.count({ where: { companyId: req.user.companyId, processingRunId: run.id }, transaction })) {
            throw Object.assign(new Error('El proceso ya fue almacenado; reprocesá para cambiar la calidad'), { status: 409 });
          }
          const columns = new Set([...run.result.accepted, ...run.result.rejected]
            .flatMap((record) => Object.keys(record.normalized || record.original || {}).map((key) => key.trim())));
          if (Object.keys(rules).some((field) => !columns.has(field))) {
            throw Object.assign(new Error('Regla para columna inexistente'), { status: 400 });
          }
          const quality = assessQuality(run.result, rules, run.result.corrections || {});
          await run.update({ result: { ...run.result, rules, quality } }, { transaction });
          return publicQuality(run);
        });
        return res.status(200).json({ message: 'Calidad validada', ...output });
      } catch (error) { return next(error); }
    },
    getQuality: async (req, res, next) => {
      try {
        const { importacionId } = matchedData(req, { locations: ['params'] });
        const run = await latest(req.user.companyId, importacionId);
        return res.status(200).json({ message: 'Calidad obtenida', ...publicQuality(run) });
      } catch (error) { return next(error); }
    },
    getErrors: async (req, res, next) => {
      try {
        const { importacionId } = matchedData(req, { locations: ['params'] });
        const { page, limit } = matchedData(req, { locations: ['query'] });
        const run = await latest(req.user.companyId, importacionId);
        if (!run.result?.quality) throw notFound();
        const errors = run.result.quality.errors;
        return res.status(200).json({ message: 'Errores de calidad obtenidos', processId: run.id,
          errors: errors.slice((page - 1) * limit, page * limit),
          pagination: { page, limit, total: errors.length, totalPages: Math.ceil(errors.length / limit) } });
      } catch (error) { return next(error); }
    },
    correctRecord: async (req, res, next) => {
      try {
        const { importacionId, row } = matchedData(req, { locations: ['params'] });
        const { record } = matchedData(req, { locations: ['body'] });
        const output = await database.transaction(async (transaction) => {
          const run = await latest(req.user.companyId, importacionId, transaction, true);
          if (await models.ProcessedRecordModel.count({ where: { companyId: req.user.companyId, processingRunId: run.id }, transaction })) {
            throw Object.assign(new Error('El proceso ya fue almacenado; reprocesá para corregir'), { status: 409 });
          }
          if (!run.result?.quality) throw notFound();
          const existing = [...run.result.accepted, ...run.result.rejected].find((item) => item.row === row);
          if (!existing) throw notFound();
          if (!run.result.quality.errors.some((error) => error.row === row)) {
            throw Object.assign(new Error('El registro no tiene errores corregibles'), { status: 409 });
          }
          const fields = Object.keys(existing.normalized || existing.original || {}).map((key) => key.trim());
          if (fields.length !== Object.keys(record).length || fields.some((field) => !(field in record))) {
            throw Object.assign(new Error('La corrección debe conservar las columnas'), { status: 400 });
          }
          const corrections = { ...(run.result.corrections || {}), [row]: record };
          const quality = assessQuality(run.result, run.result.rules || {}, corrections);
          await run.update({ result: { ...run.result, corrections, quality } }, { transaction });
          return publicQuality(run);
        });
        return res.status(200).json({ message: 'Registro corregido', ...output });
      } catch (error) { return next(error); }
    },
  };
};
