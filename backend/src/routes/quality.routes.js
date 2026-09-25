import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middlewares/validate.middleware.js';

const id = param('importacionId').isInt({ min: 1 }).toInt();
const rules = body('rules').optional().custom((value) => value && typeof value === 'object' && !Array.isArray(value)
  && Object.keys(value).length <= 100 && Object.entries(value).every(([field, type]) =>
    field.length > 0 && field.length <= 100 && field === field.trim()
    && ['text', 'integer', 'number', 'money', 'date', 'email'].includes(type)));
const record = body('record').custom((value) => value && typeof value === 'object' && !Array.isArray(value)
  && Object.keys(value).length > 0 && Object.keys(value).length <= 100
  && Object.entries(value).every(([field, entry]) => field.length > 0 && field.length <= 100
    && field === field.trim() && ['string', 'number'].includes(typeof entry) && String(entry).length <= 500));

export const createQualityRouter = (controllers, auth) => {
  const router = Router();
  router.use(auth);
  router.post('/:importacionId/validar', id, rules, validate, controllers.validateImport);
  router.get('/:importacionId', id, validate, controllers.getQuality);
  router.get('/:importacionId/errores', id,
    query('page').default(1).isInt({ min: 1 }).toInt(),
    query('limit').default(20).isInt({ min: 1, max: 100 }).toInt(), validate, controllers.getErrors);
  router.put('/:importacionId/registros/:row', id, param('row').isInt({ min: 1 }).toInt(), record, validate, controllers.correctRecord);
  return router;
};
