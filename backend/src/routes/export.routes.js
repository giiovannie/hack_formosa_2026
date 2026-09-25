import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middlewares/validate.middleware.js';

const date = (field) => body(field).optional().custom((value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
});

export const createExportRouter = (controllers, auth) => {
  const router = Router();
  router.use(auth);
  router.post('/', body('kind').isIn(['records', 'metric', 'history']), body('format').equals('csv'),
    date('from'), date('to'), body('dataType').optional().isString().trim().notEmpty().isLength({ max: 100 }),
    body('sourceId').optional().isInt({ min: 1 }).toInt(),
    body('metric').optional().isIn(['count', 'sum', 'average', 'min', 'max']),
    body('field').optional().isString().trim().notEmpty().isLength({ max: 100 }),
    body('interval').optional().isIn(['day', 'month', 'year']), validate, controllers.create);
  router.get('/', controllers.list);
  return router;
};
