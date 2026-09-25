import { Router } from 'express';
import { param } from 'express-validator';
import { validate } from '../middlewares/validate.middleware.js';

const validId = (name) => param(name).isInt({ min: 1 }).toInt();

export const createEtlRouter = (controllers, auth) => {
  const router = Router();
  router.use(auth);
  router.post('/procesar/:importacionId', validId('importacionId'), validate, controllers.processImport);
  router.get('/procesos/:id', validId('id'), validate, controllers.getProcess);
  router.post('/reprocesar/:id', validId('id'), validate, controllers.reprocess);
  return router;
};
