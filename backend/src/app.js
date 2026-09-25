import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createTokenHelpers } from './helpers/jwt.helper.js';
import { createAuthMiddleware } from './middlewares/auth.middleware.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { createCompanyControllers } from './controllers/company.controller.js';
import { createUserControllers } from './controllers/user.controller.js';
import { createLoginController } from './controllers/auth.controller.js';
import { createCompanyRouter } from './routes/company.routes.js';
import { createUserRouter } from './routes/user.routes.js';
import { createAuthRouter } from './routes/auth.routes.js';
import { createCompanyProfileRouter } from './routes/companyProfile.routes.js';
import { createCompanyProfileControllers } from './controllers/companyProfile.controller.js';
import { createSourceRouter } from './routes/source.routes.js';
import { createSourceControllers } from './controllers/source.controller.js';
import { createDataImportRouter } from './routes/dataImport.routes.js';
import { createDataImportControllers } from './controllers/dataImport.controller.js';
import { createEtlRouter } from './routes/etl.routes.js';
import { createEtlControllers } from './controllers/etl.controller.js';
import { createQualityRouter } from './routes/quality.routes.js';
import { createQualityControllers } from './controllers/quality.controller.js';

export const createApp = ({ database, models, config }) => {
  if (!config.FRONTEND_URL || !/^https?:$/.test(new URL(config.FRONTEND_URL).protocol)) {
    throw new Error('FRONTEND_URL debe ser un origen HTTP válido');
  }
  const origin = new URL(config.FRONTEND_URL).origin;
  if (origin !== config.FRONTEND_URL) throw new Error('FRONTEND_URL debe contener solo el origen');
  const tokens = createTokenHelpers(config);
  const auth = createAuthMiddleware(models, tokens);
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin, credentials: true }));
  app.use((req, res, next) => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) &&
        ((req.headers.origin && req.headers.origin !== origin) || req.headers['sec-fetch-site'] === 'cross-site')) {
      return res.status(403).json({ message: 'Origen no permitido' });
    }
    return next();
  });
  app.use(express.json({ limit: '32kb' }), cookieParser());
  app.use('/api/v1/auth', createAuthRouter(createLoginController(models, tokens, config)));
  app.use('/api/v1/empresas', createCompanyRouter(createCompanyControllers(database, models), auth));
  app.use('/api/v1/usuarios', createUserRouter(createUserControllers(database, models), auth));
  app.use('/api/v1/empresa/perfil', createCompanyProfileRouter(createCompanyProfileControllers(database, models), auth));
  app.use('/api/v1/fuentes', createSourceRouter(createSourceControllers(database, models), auth));
  app.use('/api/v1/datos', createDataImportRouter(createDataImportControllers(database, models), auth));
  app.use('/api/v1/etl', createEtlRouter(createEtlControllers(database, models, config), auth));
  app.use('/api/v1/calidad', createQualityRouter(createQualityControllers(database, models), auth));
  app.use((req, res) => res.status(404).json({ message: 'Recurso no encontrado' }));
  app.use(errorMiddleware);
  return app;
};
