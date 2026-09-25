import { matchedData } from 'express-validator';

const missing = () => Object.assign(new Error('Traza no encontrada'), { status: 404 });

export const createTraceControllers = (models) => ({
  getRecordTrace: async (req, res, next) => {
    try {
      const { registroId } = matchedData(req, { locations: ['params'] });
      const companyId = req.user.companyId;
      const record = await models.ProcessedRecordModel.findOne({ where: { id: registroId, companyId } });
      if (!record) throw missing();
      const [source, dataImport, run] = await Promise.all([
        models.SourceModel.findOne({ where: { id: record.sourceId, companyId }, paranoid: false }),
        models.DataImportModel.findOne({ where: { id: record.dataImportId, companyId } }),
        models.ProcessingRunModel.findOne({ where: { id: record.processingRunId, companyId } }),
      ]);
      if (!source || !dataImport || !run) throw missing();
      return res.status(200).json({ message: 'Traza obtenida', trace: {
        recordId: record.id,
        source: { id: source.id, name: source.name, type: source.type, origin: source.origin, deletedAt: source.deletedAt },
        importation: { id: dataImport.id, kind: dataImport.kind, dataType: dataImport.dataType, createdAt: dataImport.createdAt },
        processing: { id: run.id, status: run.status, stages: run.stages, createdAt: run.createdAt, updatedAt: run.updatedAt },
        validation: { status: 'valid', validatedAt: run.result?.qualityValidatedAt ?? null },
        persistence: { recordId: record.id, createdAt: record.createdAt },
      } });
    } catch (error) { return next(error); }
  },
  getImportHistory: async (req, res, next) => {
    try {
      const { importacionId } = matchedData(req, { locations: ['params'] });
      const { page, limit } = matchedData(req, { locations: ['query'] });
      const companyId = req.user.companyId;
      const dataImport = await models.DataImportModel.findOne({ where: { id: importacionId, companyId } });
      if (!dataImport) throw missing();
      const [source, { count, rows }] = await Promise.all([
        models.SourceModel.findOne({ where: { id: dataImport.sourceId, companyId }, paranoid: false }),
        models.ProcessingRunModel.findAndCountAll({ where: { dataImportId: importacionId, companyId },
          order: [['id', 'ASC']], limit, offset: (page - 1) * limit }),
      ]);
      if (!source) throw missing();
      const runs = await Promise.all(rows.map(async (run) => ({
        id: run.id, status: run.status, stages: run.stages, errors: run.errors,
        quality: run.result?.quality ? Object.fromEntries(Object.entries(run.result.quality).filter(([key]) => key !== 'errors')) : null,
        qualityValidatedAt: run.result?.qualityValidatedAt ?? null,
        persistedRecords: await models.ProcessedRecordModel.count({ where: { processingRunId: run.id, companyId } }),
        createdAt: run.createdAt, updatedAt: run.updatedAt,
      })));
      return res.status(200).json({ message: 'Historial obtenido', history: {
        importation: { id: dataImport.id, sourceId: dataImport.sourceId, kind: dataImport.kind,
          dataType: dataImport.dataType, createdAt: dataImport.createdAt },
        source: { id: source.id, name: source.name, type: source.type, origin: source.origin, deletedAt: source.deletedAt },
        runs,
      }, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } });
    } catch (error) { return next(error); }
  },
});
