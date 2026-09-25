import { Router } from 'express';
import { body, param } from 'express-validator';
import { authorizeRoles } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

export const createBackupRouter = (controllers, auth) => {
  const router = Router();
  router.use(auth, authorizeRoles('owner'));
  router.post('/', controllers.create);
  router.get('/', controllers.list);
  router.get('/restauraciones', controllers.restorations);
  router.post('/:id/restaurar', param('id').isInt({ min: 1 }).toInt(),
    body('confirm').custom((value) => value === true), validate, controllers.restore);
  return router;
};
