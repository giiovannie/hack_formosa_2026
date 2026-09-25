export const errorMiddleware = (error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (!error.status || error.status >= 500) {
    console.error('[API error]', {
      method: req.method,
      path: req.path,
      name: error.name,
      code: error.code,
      stack: error.stack?.split('\n').slice(1, 6).join('\n'),
    });
  }
  if (error.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ message: 'El archivo supera el tamaño permitido' });
  if (typeof error.code === 'string' && error.code.startsWith('LIMIT_')) return res.status(400).json({ message: 'La carga no es válida' });
  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ message: 'El email ya está registrado' });
  }
  if (error.type === 'entity.parse.failed' || error.type === 'entity.too.large') {
    return res.status(400).json({ message: 'El cuerpo de la solicitud no es válido' });
  }
  if ([400, 403, 404, 409].includes(error.status)) {
    return res.status(error.status).json({ message: error.message });
  }
  return res.status(500).json({ message: 'Error interno en el servidor' });
};
