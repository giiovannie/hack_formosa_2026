import { Router } from 'express';
import { createUserValidation, updateUserValidation, idValidation, paginationValidation } from '../validators/user.validator.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authorizeRoles } from '../middlewares/auth.middleware.js';

export const createUserRouter = (controllers, auth) => {
  const router = Router();
  router.use(auth, authorizeRoles('owner'));
  router.get('/', paginationValidation, validate, controllers.getAllUsers);
  router.post('/', createUserValidation, validate, controllers.createUser);
  router.put('/:id', idValidation, updateUserValidation, validate, controllers.updateUser);
  router.delete('/:id', idValidation, validate, controllers.deleteUser);
  return router;
};
