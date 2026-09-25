import { Sequelize } from 'sequelize';

// Configuration is supplied by the caller. Importing this module never reads .env
// or opens a connection, and no schema is synchronized automatically.
export const createDatabase = (config) => {
  for (const key of ['DB_NAME', 'DB_USER', 'DB_HOST', 'DB_PORT']) {
    if (!config[key]) throw new Error(`Falta configurar ${key}`);
  }
  const port = Number(config.DB_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('DB_PORT debe ser un puerto válido');
  }
  if (config.DB_DIALECT && config.DB_DIALECT !== 'mysql') {
    throw new Error('El motor de base de datos debe ser MySQL');
  }
  return new Sequelize(config.DB_NAME, config.DB_USER, config.DB_PASSWORD ?? '', {
    host: config.DB_HOST, port, dialect: 'mysql', logging: false,
  });
};
