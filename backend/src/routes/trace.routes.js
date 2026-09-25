import { Router } from 'express';
import { param, query } from 'express-validator';
import { validate } from '../middlewares/validate.middleware.js';

export const createTraceRouter = (controllers, auth) => {
  const router = Router();
  router.use(auth);
  router.get('/registros/:registroId', param('registroId').isInt({ min: 1 }).toInt(), validate, controllers.getRecordTrace);
  router.get('/importaciones/:importacionId', param('importacionId').isInt({ min: 1 }).toInt(),
    query('page').default(1).isInt({ min: 1 }).toInt(),
    query('limit').default(20).isInt({ min: 1, max: 100 }).toInt(), validate, controllers.getImportHistory);
  return router;
};
