// Gestión de usuarios: solo el administrador (ferretero) llega aquí
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { validarUsuario, publico } = require('./auth.controller');

// GET /api/usuarios
async function listar(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT id_usuario, nombre, correo, rol, creado_en FROM usuarios ORDER BY rol, nombre');
    res.json(rows);
  } catch (err) { next(err); }
}

// POST /api/usuarios  (el ferretero registra a un empleado u otro administrador)
async function crear(req, res, next) {
  try {
    const error = validarUsuario(req.body);
    if (error) return res.status(400).json({ mensaje: error });

    const { nombre, correo, password, rol = 'empleado' } = req.body;
    if (!['admin', 'empleado'].includes(rol)) return res.status(400).json({ mensaje: 'El rol debe ser admin o empleado' });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, correo, password_hash, rol) VALUES (?, ?, ?, ?)',
      [nombre.trim(), correo.trim().toLowerCase(), hash, rol]);
    res.status(201).json(publico({ id_usuario: result.insertId, nombre: nombre.trim(), correo: correo.trim().toLowerCase(), rol }));
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ mensaje: 'Ya existe un usuario con ese correo' });
    next(err);
  }
}

// DELETE /api/usuarios/:id
async function eliminar(req, res, next) {
  try {
    if (Number(req.params.id) === req.usuario.id) {
      return res.status(400).json({ mensaje: 'No puedes eliminar tu propia cuenta' });
    }
    const [result] = await pool.query('DELETE FROM usuarios WHERE id_usuario = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json({ mensaje: 'Usuario eliminado' });
  } catch (err) { next(err); }
}

module.exports = { listar, crear, eliminar };
