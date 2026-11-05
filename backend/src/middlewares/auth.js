const jwt = require('jsonwebtoken');

const SECRETO = () => process.env.JWT_SECRET || 'ferreteria-secreto-de-desarrollo';

// Crea el token que el cliente guardará después del login (dura 8 horas)
function crearToken(usuario) {
  return jwt.sign(
    { id: usuario.id_usuario, nombre: usuario.nombre, rol: usuario.rol },
    SECRETO(),
    { expiresIn: '8h' }
  );
}

// Verifica que la petición traiga un token válido en la cabecera:
//   Authorization: Bearer <token>
function requiereLogin(req, res, next) {
  const cabecera = req.headers.authorization || '';
  const [tipo, token] = cabecera.split(' ');
  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ mensaje: 'Debes iniciar sesión' });
  }
  try {
    req.usuario = jwt.verify(token, SECRETO());
    next();
  } catch {
    return res.status(401).json({ mensaje: 'Tu sesión no es válida o expiró. Vuelve a iniciar sesión.' });
  }
}

// Solo deja pasar al administrador (el ferretero)
function soloAdmin(req, res, next) {
  if (req.usuario?.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'Solo el administrador puede realizar esta acción' });
  }
  next();
}

module.exports = { crearToken, requiereLogin, soloAdmin };
