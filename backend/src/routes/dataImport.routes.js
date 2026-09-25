import { Router } from 'express';
import multer from 'multer';
import { validate } from '../middlewares/validate.middleware.js';
import { fileImportValidation, manualImportValidation, importIdValidation, importListValidation } from '../validators/dataImport.validator.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1024 * 1024, files: 1, fields: 3, fieldSize: 16 * 1024 } });
const requireMultipart = (req, res, next) => {
  if (!req.is('multipart/form-data')) return res.status(400).json({ message: 'Se requiere multipart/form-data' });
  return next();
};

export const createDataImportRouter = (controllers, auth) => {
  const router = Router();
  router.use(auth);
  router.post('/importaciones', requireMultipart, upload.single('file'), fileImportValidation, validate, controllers.createFileImport);
  router.post('/registros', manualImportValidation, validate, controllers.createManualImport);
  router.get('/importaciones', importListValidation, validate, controllers.getAllImports);
  router.get('/importaciones/:id', importIdValidation, validate, controllers.getImportById);
  return router;
};
