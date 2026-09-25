import { Router } from 'express';
import { query } from 'express-validator';
import { validate } from '../middlewares/validate.middleware.js';
import { processedRecordFilterValidators } from './dashboard.routes.js';

export const createMetricRouter = (controllers, auth) => {
  const router = Router();
  router.use(auth);
  router.get('/', query('metric').isIn(['count', 'sum', 'average', 'min', 'max']),
    query('field').optional().isString().trim().notEmpty().isLength({ max: 100 }),
    processedRecordFilterValidators, validate, controllers.getMetric);
  return router;
};
