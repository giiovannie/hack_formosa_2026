import { body, checkExact } from 'express-validator';

const textList = (field) => body(field)
  .custom((value) => Array.isArray(value) && value.every((item) => typeof item === 'string' && item.trim().length > 0))
  .withMessage('Debe ser una lista de textos no vacíos').bail()
  .customSanitizer((value) => value.map((item) => item.trim()));

export const getProfileValidation = [checkExact([], { locations: ['query', 'body'], message: 'No se permiten parámetros adicionales' })];
export const updateProfileValidation = [
  checkExact([], { locations: ['query'], message: 'No se permiten parámetros adicionales' }),
  body('industry').isString().withMessage('El rubro debe ser texto').bail().trim()
    .notEmpty().withMessage('El rubro es obligatorio').isLength({ max: 255 }).withMessage('Máximo 255 caracteres'),
  textList('areas'), textList('availableData'), textList('analysisObjectives'),
  checkExact([], { locations: ['body'], message: 'No se permiten campos adicionales' }),
];
