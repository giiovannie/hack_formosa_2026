import { Router } from 'express';
import { param, query } from 'express-validator';
import { validate } from '../middlewares/validate.middleware.js';

const date = (field) => query(field).optional().custom((value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
});
const filters = [date('from'), date('to'), query('dataType').optional().isString().trim().notEmpty().isLength({ max: 100 }),
  query('sourceId').optional().isInt({ min: 1 }).toInt()];

export const createDashboardRouter = (controllers, auth) => {
  const router = Router();
  router.use(auth);
  router.get('/', filters, validate, controllers.getDashboard);
  router.get('/widgets/:widgetId', param('widgetId').isIn(['records-by-type', 'records-by-source']),
    filters, validate, controllers.getWidget);
  return router;
};
