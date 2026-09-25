import { body, param, query, checkExact } from 'express-validator';

const textField = (field) => body(field).isString().withMessage('Debe ser texto').bail()
  .trim().notEmpty().withMessage('Es obligatorio').isLength({ max: 255 }).withMessage('Máximo 255 caracteres');
const emailField = (field) => body(field).isString().bail().trim().isEmail().withMessage('Email inválido')
  .isLength({ max: 255 }).withMessage('Máximo 255 caracteres').customSanitizer((value) => value.toLowerCase());
const passwordField = (field) => body(field).isString().bail().isLength({ min: 8 }).withMessage('Mínimo 8 caracteres')
  .custom((value) => Buffer.byteLength(value, 'utf8') <= 72).withMessage('Máximo 72 bytes');
const userFields = (prefix = '') => [textField(`${prefix}firstName`), textField(`${prefix}lastName`), emailField(`${prefix}email`)];
const roleField = () => body('role').isIn(['owner', 'member']).withMessage('Rol inválido');
const exact = () => checkExact([], { locations: ['body'], message: 'Hay campos no permitidos' });

export const companyValidation = [...userFields('owner.'), textField('name'), passwordField('owner.password'), exact()];
export const loginValidation = [emailField('email'), body('password').isString().bail().notEmpty()
  .custom((value) => Buffer.byteLength(value, 'utf8') <= 72).withMessage('Contraseña inválida'), exact()];
export const createUserValidation = [...userFields(), passwordField('password'), roleField(), exact()];
export const updateUserValidation = [...userFields(), passwordField('password').optional(), roleField(), exact()];
export const idValidation = [param('id').isInt({ min: 1, max: 2147483647 }).withMessage('ID inválido').toInt()];
export const paginationValidation = [
  query('page').default(1).isInt({ min: 1, max: 2147483647 }).withMessage('Página inválida').toInt(),
  query('limit').default(10).isInt({ min: 1, max: 100 }).withMessage('Límite inválido').toInt(),
];
