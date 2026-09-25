import { matchedData } from 'express-validator';
import { TextDecoder } from 'node:util';
import { publicDataImport } from '../helpers/publicDataImport.helper.js';

const invalid = (message) => Object.assign(new Error(message), { status: 400 });

export const createDataImportControllers = (database, models) => {
  const create = (user, fields) => database.transaction(async (transaction) => {
    const source = await models.SourceModel.findOne({
      where: { id: fields.sourceId, companyId: user.companyId }, transaction, lock: transaction.LOCK.UPDATE,
    });
    if (!source) throw Object.assign(new Error('Fuente no encontrada'), { status: 404 });
    return models.DataImportModel.create({ ...fields, companyId: user.companyId, status: 'pending' }, { transaction });
  });
  return {
    createFileImport: async (req, res, next) => {
      try {
        if (!req.file || !/\.csv$/i.test(req.file.originalname) || req.file.originalname.length > 255) {
          throw invalid('Se requiere un archivo CSV válido');
        }
        let rawPayload;
        try { rawPayload = new TextDecoder('utf-8', { fatal: true }).decode(req.file.buffer); }
        catch { throw invalid('El archivo debe estar codificado en UTF-8'); }
        if (!rawPayload.trim() || rawPayload.includes('\0') || !rawPayload.split(/\r?\n/, 1)[0].trim()) {
          throw invalid('El archivo CSV está vacío o no es válido');
        }
        const data = matchedData(req, { locations: ['body'] });
        const dataImport = await create(req.user, {
          sourceId: data.sourceId, dataType: data.dataType, metadata: data.metadata ? JSON.parse(data.metadata) : {},
          kind: 'file', originalFilename: req.file.originalname, mimeType: 'text/csv', rawPayload,
        });
        return res.status(201).json({ message: 'Importación recibida correctamente', dataImport: publicDataImport(dataImport) });
      } catch (error) { return next(error); }
    },
    createManualImport: async (req, res, next) => {
      try {
        const data = matchedData(req, { locations: ['body'] });
        const dataImport = await create(req.user, {
          sourceId: data.sourceId, dataType: data.dataType, metadata: data.metadata ?? {},
          kind: 'manual', originalFilename: null, mimeType: null, rawPayload: JSON.stringify(data.record),
        });
        return res.status(201).json({ message: 'Registro recibido correctamente', dataImport: publicDataImport(dataImport) });
      } catch (error) { return next(error); }
    },
    getAllImports: async (req, res, next) => {
      try {
        const { page, limit } = matchedData(req, { locations: ['query'] });
        const { count, rows } = await models.DataImportModel.findAndCountAll({
          where: { companyId: req.user.companyId }, limit, offset: (page - 1) * limit, order: [['id', 'ASC']],
        });
        return res.status(200).json({ message: 'Importaciones obtenidas correctamente', dataImports: rows.map(publicDataImport),
          pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } });
      } catch (error) { return next(error); }
    },
    getImportById: async (req, res, next) => {
      try {
        const { id } = matchedData(req, { locations: ['params'] });
        const dataImport = await models.DataImportModel.findOne({ where: { id, companyId: req.user.companyId } });
        if (!dataImport) return res.status(404).json({ message: 'Importación no encontrada' });
        return res.status(200).json({ message: 'Importación obtenida correctamente', dataImport: publicDataImport(dataImport) });
      } catch (error) { return next(error); }
    },
  };
};
