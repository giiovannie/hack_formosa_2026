import { body, param, query, checkExact } from 'express-validator';

const requiredText = (field) => body(field).isString().withMessage('Debe ser texto').bail()
  .trim().notEmpty().withMessage('Es obligatorio').isLength({ max: 100 }).withMessage('Máximo 100 caracteres');
const sourceId = () => body('sourceId').isInt({ min: 1, max: 2147483647 }).withMessage('Fuente inválida').toInt();
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const noQuery = () => checkExact([], { locations: ['query'], message: 'No se permiten parámetros adicionales' });
const noExtraBody = () => checkExact([], { locations: ['body'], message: 'No se permiten campos adicionales' });

export const manualImportValidation = [
  noQuery(), sourceId(), requiredText('dataType'),
  body('record').custom((value) => isObject(value) && Object.keys(value).length > 0).withMessage('El registro debe ser un objeto no vacío'),
  body('metadata').optional().custom(isObject).withMessage('Los metadatos deben ser un objeto'),
  noExtraBody(),
];
export const fileImportValidation = [
  noQuery(), sourceId(), requiredText('dataType'),
  body('metadata').optional().custom((value) => {
    try { return isObject(JSON.parse(value)); } catch { return false; }
  }).withMessage('Los metadatos deben ser un objeto JSON'), noExtraBody(),
];
export const importIdValidation = [param('id').isInt({ min: 1, max: 2147483647 }).withMessage('ID inválido').toInt(), noQuery()];
export const importListValidation = [
  query('page').default(1).isInt({ min: 1, max: 2147483647 }).withMessage('Página inválida').toInt(),
  query('limit').default(10).isInt({ min: 1, max: 100 }).withMessage('Límite inválido').toInt(),
  checkExact([], { locations: ['query'], message: 'No se permiten parámetros adicionales' }),
];
