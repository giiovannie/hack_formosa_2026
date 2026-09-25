import { Router } from 'express';
import { query } from 'express-validator';
import { validate } from '../middlewares/validate.middleware.js';
import { processedRecordFilterValidators } from './dashboard.routes.js';

const column = (name) => query(name).optional().isString().trim().notEmpty().isLength({ max: 100 });

export const createProductivityRouter = (controllers, auth) => {
  const router = Router();
  router.use(auth);
  router.get('/', query('from').exists(), query('to').exists(), query('dataType').exists(),
    query('interval').isIn(['day', 'month', 'year']),
    column('areaField'), column('operationField'), column('employeeField'),
    query('area').optional().isString().trim().notEmpty().isLength({ max: 255 }),
    query('employee').optional().isString().trim().notEmpty().isLength({ max: 255 }),
    processedRecordFilterValidators, validate, controllers.getIndicators);
  return router;
};
