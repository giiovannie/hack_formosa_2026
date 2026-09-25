import { Router } from 'express';
import { query } from 'express-validator';
import { validate } from '../middlewares/validate.middleware.js';
import { processedRecordFilterValidators } from './dashboard.routes.js';

export const createVisualizationRouter = (controllers, auth) => {
  const router = Router();
  router.use(auth);
  router.get('/',
    query('type').isIn(['bar', 'line', 'pie', 'table', 'card']),
    query('metric').default('record_count').isIn(['record_count']),
    query('groupBy').optional().isIn(['dataType', 'sourceId', 'day']),
    processedRecordFilterValidators, validate, controllers.getVisualization);
  return router;
};
