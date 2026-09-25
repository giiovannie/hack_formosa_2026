import { createDatabase } from '../src/config/database.js';
import { initializeModels } from '../src/models/relaciones.js';

// Explicit first-time initialization only: no force, alter, or automatic sync
// at server startup. The database itself must already exist.
const initialize = async () => {
  const database = createDatabase(process.env);
  try {
    initializeModels(database);
    await database.authenticate();
    await database.sync({ force: false });
    console.log('Tablas iniciales verificadas');
  } finally { await database.close(); }
};
initialize().catch(() => {
  console.error('No se pudieron inicializar las tablas. Revisá configuración y permisos.');
  process.exitCode = 1;
});
