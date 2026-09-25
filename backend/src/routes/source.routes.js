import { Router } from 'express';
import { authorizeRoles } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { sourceIdValidation, sourceListValidation, sourceBodyValidation } from '../validators/source.validator.js';

export const createSourceRouter = (controllers, auth) => {
  const router = Router();
  router.use(auth);
  router.get('/', sourceListValidation, validate, controllers.getAllSources);
  router.get('/:id', sourceIdValidation, validate, controllers.getSourceById);
  router.post('/', authorizeRoles('owner'), sourceBodyValidation, validate, controllers.createSource);
  router.put('/:id', authorizeRoles('owner'), sourceIdValidation, sourceBodyValidation, validate, controllers.updateSource);
  router.delete('/:id', authorizeRoles('owner'), sourceIdValidation, validate, controllers.deleteSource);
  return router;
};
