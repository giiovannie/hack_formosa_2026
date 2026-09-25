import { Router } from 'express';
import { query } from 'express-validator';
import { validate } from '../middlewares/validate.middleware.js';
import { historicalSeriesValidators } from './history.routes.js';

export const createContextualizationRouter = (controllers, auth) => {
  const router = Router();
  router.use(auth);
  router.get('/', historicalSeriesValidators,
    query('externalSourceId').isString().trim().notEmpty().isLength({ max: 100 }),
    query('seriesId').matches(/^[A-Za-z0-9._-]{1,100}$/), validate, controllers.analyze);
  return router;
};
