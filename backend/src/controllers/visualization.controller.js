import { col, fn } from 'sequelize';
import { matchedData } from 'express-validator';
import { buildProcessedRecordFilters } from '../helpers/processedRecordFilters.helper.js';

const invalid = () => Object.assign(new Error('Combinación de visualización y agrupación inválida'), { status: 400 });

export const createVisualizationControllers = (models) => ({
  getVisualization: async (req, res, next) => {
    try {
      const { type, metric, groupBy: requestedGroup } = matchedData(req, { locations: ['query'] });
      const { where, appliedFilters } = await buildProcessedRecordFilters(models, req);
      if (metric !== 'record_count') throw invalid();
      if (type === 'card') {
        if (requestedGroup) throw invalid();
        const value = await models.ProcessedRecordModel.count({ where });
        return res.status(200).json({ message: 'Visualización obtenida', visualization: { type, metric, groupBy: null,
          filters: appliedFilters, data: { value } } });
      }
      const groupBy = requestedGroup || (type === 'line' ? 'day' : 'dataType');
      if (!['dataType', 'sourceId', 'day'].includes(groupBy) || (type === 'line' && groupBy !== 'day')) throw invalid();
      const expression = groupBy === 'day' ? fn('DATE', col('createdAt')) : col(groupBy);
      const rows = await models.ProcessedRecordModel.findAll({
        attributes: [[expression, 'groupValue'], [fn('COUNT', col('id')), 'count']],
        where, group: [expression], order: [[expression, 'ASC']], raw: true,
      });
      const points = rows.map((row) => ({ group: String(row.groupValue), value: Number(row.count) }));
      const data = type === 'table'
        ? { columns: ['group', 'value'], rows: points }
        : { labels: points.map((point) => point.group), values: points.map((point) => point.value) };
      return res.status(200).json({ message: 'Visualización obtenida', visualization: {
        type, metric, groupBy, filters: appliedFilters, data,
      } });
    } catch (error) { return next(error); }
  },
});
