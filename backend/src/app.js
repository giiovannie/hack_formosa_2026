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
import { createProcessedRecordRouter } from './routes/processedRecord.routes.js';
import { createProcessedRecordControllers } from './controllers/processedRecord.controller.js';
import { createTraceRouter } from './routes/trace.routes.js';
import { createTraceControllers } from './controllers/trace.controller.js';
import { createDashboardRouter } from './routes/dashboard.routes.js';
import { createDashboardControllers } from './controllers/dashboard.controller.js';
import { createVisualizationRouter } from './routes/visualization.routes.js';
import { createVisualizationControllers } from './controllers/visualization.controller.js';
import { createMetricRouter } from './routes/metric.routes.js';
import { createMetricControllers } from './controllers/metric.controller.js';
import { createHistoryRouter } from './routes/history.routes.js';
import { createHistoryControllers } from './controllers/history.controller.js';
import { createPatternRouter } from './routes/pattern.routes.js';
import { createPatternControllers } from './controllers/pattern.controller.js';
import { createTrendRouter } from './routes/trend.routes.js';
import { createTrendControllers } from './controllers/trend.controller.js';
import { createProductivityRouter } from './routes/productivity.routes.js';
import { createProductivityControllers } from './controllers/productivity.controller.js';
import { createExternalSourceRouter } from './routes/externalSource.routes.js';
import { createExternalSourceControllers } from './controllers/externalSource.controller.js';
import { createContextualizationRouter } from './routes/contextualization.routes.js';
import { createContextualizationControllers } from './controllers/contextualization.controller.js';

export const createApp = ({ database, models, config, externalFetch }) => {
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
  app.use('/api/v1/datos-procesados', createProcessedRecordRouter(createProcessedRecordControllers(database, models), auth));
  app.use('/api/v1/trazabilidad', createTraceRouter(createTraceControllers(models), auth));
  app.use('/api/v1/dashboard', createDashboardRouter(createDashboardControllers(models), auth));
  app.use('/api/v1/visualizaciones', createVisualizationRouter(createVisualizationControllers(models), auth));
  app.use('/api/v1/metricas', createMetricRouter(createMetricControllers(database, models), auth));
  app.use('/api/v1/historicos', createHistoryRouter(createHistoryControllers(database, models), auth));
  app.use('/api/v1/patrones', createPatternRouter(createPatternControllers(database, models), auth));
  app.use('/api/v1/tendencias', createTrendRouter(createTrendControllers(database, models), auth));
  app.use('/api/v1/productividad', createProductivityRouter(createProductivityControllers(models), auth));
  app.use('/api/v1/fuentes-externas', createExternalSourceRouter(createExternalSourceControllers(models, externalFetch), auth));
  app.use('/api/v1/contextualizacion', createContextualizationRouter(createContextualizationControllers(database, models, externalFetch), auth));
  app.use((req, res) => res.status(404).json({ message: 'Recurso no encontrado' }));
  app.use(errorMiddleware);
  return app;
};
