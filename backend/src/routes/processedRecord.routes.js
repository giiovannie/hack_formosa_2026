import { Router } from 'express';
import { param, query } from 'express-validator';
import { validate } from '../middlewares/validate.middleware.js';

export const createProcessedRecordRouter = (controllers, auth) => {
  const router = Router();
  router.use(auth);
  router.post('/importaciones/:importacionId', param('importacionId').isInt({ min: 1 }).toInt(), validate, controllers.persist);
  router.get('/', query('page').default(1).isInt({ min: 1 }).toInt(),
    query('limit').default(20).isInt({ min: 1, max: 100 }).toInt(), validate, controllers.list);
  router.get('/:id', param('id').isInt({ min: 1 }).toInt(), validate, controllers.getById);
  return router;
};
