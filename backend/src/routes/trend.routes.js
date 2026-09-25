import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware.js';
import { historicalSeriesValidators } from './history.routes.js';

export const createTrendRouter = (controllers, auth) => {
  const router = Router();
  router.use(auth);
  router.get('/', historicalSeriesValidators, validate, controllers.analyze);
  return router;
};
