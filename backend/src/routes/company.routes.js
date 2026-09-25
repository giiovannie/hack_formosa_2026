import { Router } from 'express';
import { companyValidation, idValidation } from '../validators/user.validator.js';
import { validate } from '../middlewares/validate.middleware.js';

export const createCompanyRouter = (controllers, auth) => {
  const router = Router();
  router.post('/', companyValidation, validate, controllers.createCompany);
  router.get('/:id', auth, idValidation, validate, controllers.getCompanyById);
  return router;
};
