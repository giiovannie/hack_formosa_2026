import { Router } from 'express';
import { param, query } from 'express-validator';
import { validate } from '../middlewares/validate.middleware.js';

export const createExternalSourceRouter = (controllers, auth) => {
  const router = Router();
  router.use(auth);
  router.get('/', controllers.list);
  router.get('/consultas', controllers.history);
  router.get('/:sourceId/consultar', param('sourceId').isString().trim().notEmpty().isLength({ max: 100 }),
    query('nombre').optional().isString().trim().notEmpty().isLength({ max: 80 }), validate, controllers.consult);
  return router;
};
