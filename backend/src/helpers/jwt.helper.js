import jwt from 'jsonwebtoken';

export const createTokenHelpers = (config) => {
  if (!config.JWT_SECRET || !config.JWT_EXPIRES_IN) {
    throw new Error('Falta configurar JWT_SECRET o JWT_EXPIRES_IN');
  }
  const duration = String(config.JWT_EXPIRES_IN);
  const expiresIn = /^\d+$/.test(duration) ? Number(duration) : duration;
  if ((typeof expiresIn === 'number' && expiresIn <= 0) ||
      (typeof expiresIn === 'string' && !/^[1-9]\d*(ms|s|m|h|d|w)$/.test(duration))) {
    throw new Error('JWT_EXPIRES_IN debe ser una duración positiva con unidad o segundos');
  }
  const generateToken = (user) => jwt.sign({ id: user.id, companyId: user.companyId }, config.JWT_SECRET, {
    algorithm: 'HS256', expiresIn,
  });
  const verifyToken = (token) => {
    const payload = jwt.verify(token, config.JWT_SECRET, { algorithms: ['HS256'] });
    if (!Number.isInteger(payload.id) || payload.id < 1 ||
        !Number.isInteger(payload.companyId) || payload.companyId < 1) {
      throw new Error('Sesión inválida');
    }
    return payload;
  };
  return { generateToken, verifyToken };
};
