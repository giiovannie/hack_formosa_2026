import { body, param, query, checkExact } from 'express-validator';

const requiredText = (field, max) => body(field).isString().withMessage('Debe ser texto').bail()
  .trim().notEmpty().withMessage('Es obligatorio').isLength({ max }).withMessage(`Máximo ${max} caracteres`);
const noQuery = () => checkExact([], { locations: ['query'], message: 'No se permiten parámetros adicionales' });
const noExtraBody = () => checkExact([], { locations: ['body'], message: 'No se permiten campos adicionales' });

export const sourceIdValidation = [param('id').isInt({ min: 1, max: 2147483647 }).withMessage('ID inválido').toInt(), noQuery()];
export const sourceListValidation = [
  query('page').default(1).isInt({ min: 1, max: 2147483647 }).withMessage('Página inválida').toInt(),
  query('limit').default(10).isInt({ min: 1, max: 100 }).withMessage('Límite inválido').toInt(),
  checkExact([], { locations: ['query'], message: 'No se permiten parámetros adicionales' }),
];
export const sourceBodyValidation = [
  noQuery(), requiredText('name', 255),
  body('type').isIn(['internal', 'external']).withMessage('Tipo inválido'),
  requiredText('origin', 255), requiredText('status', 100),
  body('description').optional().isString().withMessage('Debe ser texto').bail().trim()
    .isLength({ max: 2000 }).withMessage('Máximo 2000 caracteres'),
  body('sourceUpdatedAt').optional().isISO8601({ strict: true }).withMessage('Fecha inválida').toDate(),
  noExtraBody(),
];
