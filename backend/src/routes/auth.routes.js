import { Router } from 'express';
import { loginValidation } from '../validators/user.validator.js';
import { validate } from '../middlewares/validate.middleware.js';

export const createAuthRouter = ({ login, logout }) => {
  const router = Router();
  router.post('/login', loginValidation, validate, login);
  router.post('/logout', logout);
  return router;
};
