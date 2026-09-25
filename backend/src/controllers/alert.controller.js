import { Op } from 'sequelize';
import { matchedData } from 'express-validator';
import { calculateMetric } from '../helpers/calculateMetric.helper.js';
import { compareDecimal } from '../helpers/compareDecimal.helper.js';

const matches = (comparison, operator) => ({ lt: comparison < 0, lte: comparison <= 0,
  gt: comparison > 0, gte: comparison >= 0 }[operator]);

export const createAlertControllers = (database, models) => ({
  evaluate: async (req, res, next) => {
    try {
      const { metric, field, operator, threshold, from, to, dataType, sourceId } = matchedData(req, { locations: ['body'] });
      if (from > to || (metric === 'count' ? !!field : !field)) {
        return res.status(400).json({ message: 'Condición o período inválido' });
      }
      if (sourceId && !await models.SourceModel.findOne({ where: { id: sourceId, companyId: req.user.companyId } })) {
        return res.status(404).json({ message: 'Fuente no encontrada' });
      }
      const end = new Date(`${to}T00:00:00.000Z`);
      end.setUTCDate(end.getUTCDate() + 1);
      const where = { companyId: req.user.companyId, createdAt: { [Op.gte]: new Date(`${from}T00:00:00.000Z`), [Op.lt]: end } };
      if (dataType) where.dataType = dataType;
      if (sourceId) where.sourceId = sourceId;
      const evidence = await database.transaction((transaction) =>
        calculateMetric(models.ProcessedRecordModel, where, metric, field, transaction));
      const condition = { metric, field: field ?? null, operator, threshold, from, to,
        dataType: dataType ?? null, sourceId: sourceId ?? null };
      if (!evidence.includedRecords || evidence.value === null) {
        return res.status(200).json({ message: 'Información insuficiente para evaluar la alerta', evaluation: {
          status: 'insufficient_data', condition, evidence, alert: null } });
      }
      const comparison = compareDecimal(evidence.value, threshold);
      if (comparison === null) return res.status(400).json({ message: 'Umbral inválido' });
      if (!matches(comparison, operator)) return res.status(200).json({ message: 'Condición no cumplida', evaluation: {
        status: 'not_triggered', condition, evidence, alert: null } });
      const alert = await models.AlertModel.create({ companyId: req.user.companyId, userId: req.user.id,
        type: 'metric_threshold', condition, evidence, status: 'active', evaluatedAt: new Date() });
      return res.status(201).json({ message: 'Alerta generada', evaluation: { status: 'triggered', condition, evidence, alert } });
    } catch (error) { return next(error); }
  },
  list: async (req, res, next) => {
    try {
      const { status } = matchedData(req, { locations: ['query'] });
      const where = { companyId: req.user.companyId };
      if (status) where.status = status;
      const alerts = await models.AlertModel.findAll({ where, order: [['id', 'DESC']], limit: 100 });
      return res.status(200).json({ message: 'Alertas obtenidas', alerts });
    } catch (error) { return next(error); }
  },
  getById: async (req, res, next) => {
    try {
      const { id } = matchedData(req, { locations: ['params'] });
      const alert = await models.AlertModel.findOne({ where: { id, companyId: req.user.companyId } });
      if (!alert) return res.status(404).json({ message: 'Alerta no encontrada' });
      return res.status(200).json({ message: 'Alerta obtenida', alert });
    } catch (error) { return next(error); }
  },
  acknowledge: async (req, res, next) => {
    try {
      const { id } = matchedData(req, { locations: ['params'] });
      const alert = await models.AlertModel.findOne({ where: { id, companyId: req.user.companyId } });
      if (!alert) return res.status(404).json({ message: 'Alerta no encontrada' });
      if (alert.status !== 'acknowledged') await alert.update({ status: 'acknowledged' });
      return res.status(200).json({ message: 'Alerta reconocida', alert });
    } catch (error) { return next(error); }
  },
});
