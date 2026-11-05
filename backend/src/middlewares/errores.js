// Middleware para rutas que no existen
function noEncontrado(req, res) {
  res.status(404).json({ mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

// Middleware central de errores: traduce errores de MySQL a mensajes claros
function manejarErrores(err, req, res, next) {
  console.error(err.code || '', err.message);

  switch (err.code) {
    case 'ER_DUP_ENTRY':
      return res.status(409).json({ mensaje: 'Ya existe un registro con ese nombre' });
    case 'ER_ROW_IS_REFERENCED_2':
      return res.status(409).json({ mensaje: 'No se puede eliminar: la categoría tiene productos asociados' });
    case 'ER_NO_REFERENCED_ROW_2':
      return res.status(400).json({ mensaje: 'La categoría indicada no existe' });
    case 'ECONNREFUSED':
    case 'ER_ACCESS_DENIED_ERROR':
    case 'ER_BAD_DB_ERROR':
      return res.status(500).json({ mensaje: 'No se pudo conectar a la base de datos' });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ mensaje: 'El JSON enviado no es válido' });
  }

  res.status(500).json({ mensaje: 'Error interno del servidor' });
}

module.exports = { noEncontrado, manejarErrores };
