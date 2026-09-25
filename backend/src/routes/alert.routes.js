import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middlewares/validate.middleware.js';

const date = (field) => body(field).custom((value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
});
const id = param('id').isInt({ min: 1 }).toInt();

export const createAlertRouter = (controllers, auth) => {
  const router = Router();
  router.use(auth);
  router.post('/evaluar', body('metric').isIn(['count', 'sum', 'average', 'min', 'max']),
    body('field').optional().isString().trim().notEmpty().isLength({ max: 100 }),
    body('operator').isIn(['lt', 'lte', 'gt', 'gte']),
    body('threshold').isString().trim().matches(/^-?\d+(?:\.\d+)?$/).isLength({ max: 100 }),
    date('from'), date('to'), body('dataType').optional().isString().trim().notEmpty().isLength({ max: 100 }),
    body('sourceId').optional().isInt({ min: 1 }).toInt(), validate, controllers.evaluate);
  router.get('/', query('status').optional().isIn(['active', 'acknowledged']), validate, controllers.list);
  router.get('/:id', id, validate, controllers.getById);
  router.patch('/:id/reconocer', id, validate, controllers.acknowledge);
  return router;
};
