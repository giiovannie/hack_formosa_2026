import { Op, fn, col } from 'sequelize';
import { matchedData } from 'express-validator';

const invalid = (message) => Object.assign(new Error(message), { status: 400 });
const widgets = ['records-by-type', 'records-by-source'];

export const createDashboardControllers = (models) => {
  const filters = async (req) => {
    const { from, to, dataType, sourceId } = matchedData(req, { locations: ['query'] });
    if (from && to && from > to) throw invalid('El período es inválido');
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
  const grouped = (where, field) => models.ProcessedRecordModel.findAll({
    attributes: [field, [fn('COUNT', col('id')), 'count']], where, group: [field], order: [[field, 'ASC']], raw: true,
  }).then((rows) => rows.map((row) => ({ [field]: row[field], count: Number(row.count) })));
  const widgetData = async (where, id) => {
    if (id === 'records-by-type') return { id, data: await grouped(where, 'dataType') };
    if (id === 'records-by-source') return { id, data: await grouped(where, 'sourceId') };
    throw Object.assign(new Error('Widget no encontrado'), { status: 404 });
  };
  return {
    getDashboard: async (req, res, next) => {
      try {
        const { where, appliedFilters } = await filters(req);
        const [profile, byType, bySource] = await Promise.all([
          models.CompanyProfileModel.findOne({ where: { companyId: req.user.companyId } }),
          grouped(where, 'dataType'), grouped(where, 'sourceId'),
        ]);
        const hasData = byType.length > 0;
        return res.status(200).json({ message: 'Dashboard obtenido', dashboard: {
          companyId: req.user.companyId,
          profile: profile ? { rubro: profile.rubro, areas: profile.areas,
            datosDisponibles: profile.datosDisponibles, objetivosAnalisis: profile.objetivosAnalisis } : null,
          filters: appliedFilters,
          availableWidgets: hasData ? widgets : [],
          widgets: hasData ? [{ id: widgets[0], data: byType }, { id: widgets[1], data: bySource }] : [],
        } });
      } catch (error) { return next(error); }
    },
    getWidget: async (req, res, next) => {
      try {
        const { widgetId } = matchedData(req, { locations: ['params'] });
        const { where, appliedFilters } = await filters(req);
        const widget = await widgetData(where, widgetId);
        return res.status(200).json({ message: 'Widget obtenido', filters: appliedFilters, widget });
      } catch (error) { return next(error); }
    },
  };
};
