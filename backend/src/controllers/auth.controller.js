const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { crearToken } = require('../middlewares/auth');

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Valida los datos de un usuario nuevo
function validarUsuario({ nombre, correo, password }) {
  if (!nombre || !String(nombre).trim()) return 'El nombre es obligatorio';
  if (!correo || !CORREO_VALIDO.test(correo)) return 'Escribe un correo válido';
  if (!password || String(password).length < 6) return 'La contraseña debe tener al menos 6 caracteres';
  return null;
}

// Datos del usuario que se pueden enviar al cliente (sin la contraseña)
const publico = (u) => ({ id_usuario: u.id_usuario, nombre: u.nombre, correo: u.correo, rol: u.rol });

async function hayUsuarios() {
  const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM usuarios');
  return total > 0;
}

// GET /api/auth/estado
// Le dice al cliente si debe mostrar el registro inicial (no hay usuarios todavía)
async function estado(req, res, next) {
  try {
    res.json({ necesitaRegistro: !(await hayUsuarios()) });
  } catch (err) { next(err); }
}

// POST /api/auth/registro
// Registro inicial: crea la cuenta del ferretero (admin).
// Solo funciona mientras no exista ningún usuario; después queda cerrado.
async function registroInicial(req, res, next) {
  try {
    if (await hayUsuarios()) {
      return res.status(403).json({ mensaje: 'El registro está cerrado. Pide al administrador que te cree una cuenta.' });
    }
    const error = validarUsuario(req.body);
    if (error) return res.status(400).json({ mensaje: error });

    const { nombre, correo, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, correo, password_hash, rol) VALUES (?, ?, ?, ?)',
      [nombre.trim(), correo.trim().toLowerCase(), hash, 'admin']);

    const usuario = { id_usuario: result.insertId, nombre: nombre.trim(), correo: correo.trim().toLowerCase(), rol: 'admin' };
    res.status(201).json({ token: crearToken(usuario), usuario });
  } catch (err) { next(err); }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { correo, password } = req.body;
    if (!correo || !password) return res.status(400).json({ mensaje: 'Escribe tu correo y contraseña' });

    const [rows] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [String(correo).trim().toLowerCase()]);
    const usuario = rows[0];
    // Mismo mensaje si no existe el correo o si la contraseña es incorrecta (por seguridad)
    if (!usuario || !(await bcrypt.compare(password, usuario.password_hash))) {
      return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });
    }
    res.json({ token: crearToken(usuario), usuario: publico(usuario) });
  } catch (err) { next(err); }
}

// GET /api/auth/yo  (datos del usuario que inició sesión)
async function yo(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE id_usuario = ?', [req.usuario.id]);
    if (rows.length === 0) return res.status(401).json({ mensaje: 'Tu cuenta ya no existe' });
    res.json(publico(rows[0]));
  } catch (err) { next(err); }
}

module.exports = { estado, registroInicial, login, yo, validarUsuario, publico };
