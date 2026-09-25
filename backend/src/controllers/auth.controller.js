import { matchedData } from 'express-validator';
import { comparePassword } from '../helpers/bcrypt.helper.js';
import { publicUser } from '../helpers/publicData.helper.js';

export const createLoginController = (models, tokens, config) => async (req, res, next) => {
  try {
    const { email, password } = matchedData(req);
    const user = await models.UserModel.scope('withPassword').findOne({
      where: { email }, include: [{ model: models.CompanyModel, as: 'company', required: true }],
    });
    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    const token = tokens.generateToken(user);
    const payload = tokens.verifyToken(token);
    res.cookie('token', token, {
      httpOnly: true, sameSite: 'strict', secure: config.NODE_ENV === 'production',
      path: '/api/v1', maxAge: Math.max(0, payload.exp * 1000 - Date.now()),
    });
    return res.status(200).json({ message: 'Sesión iniciada correctamente', user: publicUser(user) });
  } catch (error) { return next(error); }
};
