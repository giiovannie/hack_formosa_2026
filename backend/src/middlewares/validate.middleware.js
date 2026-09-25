import { validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) return res.status(400).json({
    message: 'Los datos enviados no son válidos',
    errors: result.array({ onlyFirstError: true }).map((error) => ({
      field: error.path ?? 'body', message: error.msg,
    })),
  });
  return next();
};
