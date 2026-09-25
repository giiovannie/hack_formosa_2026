import { createDatabase } from './config/database.js';
import { initializeModels } from './models/relaciones.js';
import { createApp } from './app.js';

// Environment variables must be provided by the execution environment.
// This entry point does not read .env or create/alter tables automatically.
const start = async () => {
  const database = createDatabase(process.env);
  try {
    const port = Number(process.env.PORT);
    if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT inválido');
    const models = initializeModels(database);
    const app = createApp({ database, models, config: process.env });
    await database.authenticate();
    const server = app.listen(port, () => console.log(`Backend iniciado en puerto ${port}`));
    const shutdown = () => server.close(async () => { await database.close(); });
    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
    server.on('error', async () => { console.error('No se pudo iniciar el servidor'); await database.close(); process.exitCode = 1; });
  } catch {
    await database.close();
    console.error('No se pudo iniciar el backend. Revisá las variables de entorno y la base de datos.');
    process.exitCode = 1;
  }
};
start().catch(() => { console.error('Configuración de base de datos inválida'); process.exitCode = 1; });
