export const createAuthMiddleware = (models, tokens) => async (req, res, next) => {
  let payload;
  try {
    payload = tokens.verifyToken(req.cookies.token);
  } catch {
    return res.status(401).json({ message: 'Sesión inválida' });
  }
  try {
    const user = await models.UserModel.findOne({
      where: { id: payload.id, companyId: payload.companyId },
      include: [{ model: models.CompanyModel, as: 'company', required: true }],
    });
    if (!user) return res.status(401).json({ message: 'Sesión inválida' });
    req.user = user;
    return next();
  } catch (error) { return next(error); }
};

export const authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'No tenés permisos para esta operación' });
  return next();
};
