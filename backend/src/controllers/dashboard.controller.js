import { fn, col } from 'sequelize';
import { matchedData } from 'express-validator';
import { buildProcessedRecordFilters } from '../helpers/processedRecordFilters.helper.js';

const widgets = ['records-by-type', 'records-by-source'];

export const createDashboardControllers = (models) => {
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
        const { where, appliedFilters } = await buildProcessedRecordFilters(models, req);
        const [profile, byType, bySource] = await Promise.all([
          models.CompanyProfileModel.findOne({ where: { companyId: req.user.companyId } }),
          grouped(where, 'dataType'), grouped(where, 'sourceId'),
        ]);
        const hasData = byType.length > 0;
        return res.status(200).json({ message: 'Dashboard obtenido', dashboard: {
          companyId: req.user.companyId,
          profile: profile ? { industry: profile.industry, areas: profile.areas,
            availableData: profile.availableData, analysisObjectives: profile.analysisObjectives } : null,
          filters: appliedFilters,
          availableWidgets: hasData ? widgets : [],
          widgets: hasData ? [{ id: widgets[0], data: byType }, { id: widgets[1], data: bySource }] : [],
        } });
      } catch (error) { return next(error); }
    },
    getWidget: async (req, res, next) => {
      try {
        const { widgetId } = matchedData(req, { locations: ['params'] });
        const { where, appliedFilters } = await buildProcessedRecordFilters(models, req);
        const widget = await widgetData(where, widgetId);
        return res.status(200).json({ message: 'Widget obtenido', filters: appliedFilters, widget });
      } catch (error) { return next(error); }
    },
  };
};
