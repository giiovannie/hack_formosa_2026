import { matchedData } from 'express-validator';

export const createSourceControllers = (database, models) => {
  const findSource = (id, companyId) => models.SourceModel.findOne({ where: { id, companyId } });
  return {
    getAllSources: async (req, res, next) => {
      try {
        const { page, limit } = matchedData(req, { locations: ['query'] });
        const { count, rows } = await models.SourceModel.findAndCountAll({
          where: { companyId: req.user.companyId }, limit, offset: (page - 1) * limit, order: [['id', 'ASC']],
        });
        return res.status(200).json({ message: 'Fuentes obtenidas correctamente', sources: rows,
          pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } });
      } catch (error) { return next(error); }
    },
    getSourceById: async (req, res, next) => {
      try {
        const { id } = matchedData(req, { locations: ['params'] });
        const source = await findSource(id, req.user.companyId);
        if (!source) return res.status(404).json({ message: 'Fuente no encontrada' });
        return res.status(200).json({ message: 'Fuente obtenida correctamente', source });
      } catch (error) { return next(error); }
    },
    createSource: async (req, res, next) => {
      try {
        const data = matchedData(req, { locations: ['body'] });
        const source = await models.SourceModel.create({ ...data, companyId: req.user.companyId });
        return res.status(201).json({ message: 'Fuente creada correctamente', source });
      } catch (error) { return next(error); }
    },
    updateSource: async (req, res, next) => {
      try {
        const { id } = matchedData(req, { locations: ['params'] });
        const data = matchedData(req, { locations: ['body'] });
        const source = await findSource(id, req.user.companyId);
        if (!source) return res.status(404).json({ message: 'Fuente no encontrada' });
        await source.update({ ...data, description: data.description ?? null, sourceUpdatedAt: data.sourceUpdatedAt ?? null });
        return res.status(200).json({ message: 'Fuente actualizada correctamente', source });
      } catch (error) { return next(error); }
    },
    deleteSource: async (req, res, next) => {
      try {
        const { id } = matchedData(req, { locations: ['params'] });
        await database.transaction(async (transaction) => {
          const source = await models.SourceModel.findOne({ where: { id, companyId: req.user.companyId }, transaction, lock: transaction.LOCK.UPDATE });
          if (!source) throw Object.assign(new Error('Fuente no encontrada'), { status: 404 });
          const count = await models.DataImportModel.count({ where: { sourceId: id, companyId: req.user.companyId }, transaction });
          if (count) throw Object.assign(new Error('La fuente tiene importaciones asociadas'), { status: 409 });
          await source.destroy({ transaction });
        });
        return res.status(200).json({ message: 'Fuente eliminada correctamente' });
      } catch (error) { return next(error); }
    },
  };
};
