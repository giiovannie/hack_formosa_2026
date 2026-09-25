import { Router } from 'express';
import { authorizeRoles } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { getProfileValidation, updateProfileValidation } from '../validators/companyProfile.validator.js';

export const createCompanyProfileRouter = (controllers, auth) => {
  const router = Router();
  router.use(auth);
  router.get('/', getProfileValidation, validate, controllers.getCompanyProfile);
  router.put('/', authorizeRoles('owner'), updateProfileValidation, validate, controllers.updateCompanyProfile);
  return router;
};
