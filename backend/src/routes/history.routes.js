import { Router } from 'express';
import { query } from 'express-validator';
import { validate } from '../middlewares/validate.middleware.js';
import { processedRecordFilterValidators } from './dashboard.routes.js';

const date = (field) => query(field).custom((value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
});
const metric = [query('metric').isIn(['count', 'sum', 'average', 'min', 'max']),
  query('field').optional().isString().trim().notEmpty().isLength({ max: 100 })];

export const createHistoryRouter = (controllers, auth) => {
  const router = Router();
  router.use(auth);
  router.get('/comparar', date('fromA'), date('toA'), date('fromB'), date('toB'),
    metric, processedRecordFilterValidators, validate, controllers.compare);
  router.get('/serie', date('from'), date('to'), query('interval').isIn(['day', 'month', 'year']),
    metric, processedRecordFilterValidators, validate, controllers.series);
  return router;
};
