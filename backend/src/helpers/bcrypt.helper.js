import bcrypt from 'bcryptjs';

export const hashPassword = async (password) => {
  if (typeof password !== 'string' || Buffer.byteLength(password, 'utf8') > 72) {
    throw new Error('La contraseña no puede superar 72 bytes');
  }
  return bcrypt.hash(password, 12);
};

export const comparePassword = async (password, hash) => {
  if (typeof password !== 'string' || Buffer.byteLength(password, 'utf8') > 72) return false;
  return bcrypt.compare(password, hash);
};
