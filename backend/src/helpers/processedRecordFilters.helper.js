import { Op } from 'sequelize';
import { matchedData } from 'express-validator';

export const buildProcessedRecordFilters = async (models, req) => {
  const { from, to, dataType, sourceId } = matchedData(req, { locations: ['query'] });
  if (from && to && from > to) throw Object.assign(new Error('El período es inválido'), { status: 400 });
  if (sourceId && !await models.SourceModel.findOne({ where: { id: sourceId, companyId: req.user.companyId }, paranoid: false })) {
    throw Object.assign(new Error('Fuente no encontrada'), { status: 404 });
  }
  const where = { companyId: req.user.companyId };
  if (dataType) where.dataType = dataType;
  if (sourceId) where.sourceId = sourceId;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt[Op.gte] = new Date(`${from}T00:00:00.000Z`);
    if (to) {
      const end = new Date(`${to}T00:00:00.000Z`);
      end.setUTCDate(end.getUTCDate() + 1);
      where.createdAt[Op.lt] = end;
    }
  }
  return { where, appliedFilters: { from: from ?? null, to: to ?? null, dataType: dataType ?? null, sourceId: sourceId ?? null } };
};
