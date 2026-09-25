export const errorMiddleware = (error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ message: 'El email ya está registrado' });
  }
  if (error.type === 'entity.parse.failed' || error.type === 'entity.too.large') {
    return res.status(400).json({ message: 'El cuerpo de la solicitud no es válido' });
  }
  if (error.status === 404 || error.status === 409 || error.status === 403) {
    return res.status(error.status).json({ message: error.message });
  }
  return res.status(500).json({ message: 'Error interno en el servidor' });
};
