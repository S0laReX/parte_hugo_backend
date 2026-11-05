const pool = require('../config/db');

// Valida los datos que llegan en el body
function validar({ nombre }) {
  if (!nombre || !String(nombre).trim()) return 'El nombre es obligatorio';
  if (String(nombre).length > 100) return 'El nombre no puede pasar de 100 caracteres';
  return null;
}

// GET /api/categorias  (incluye cuántos productos tiene cada una)
async function listar(req, res, next) {
  try {
    const [rows] = await pool.query(`
      SELECT c.id_categoria, c.nombre, c.descripcion,
             COUNT(p.id_producto) AS total_productos
      FROM categorias c
      LEFT JOIN productos p ON p.id_categoria = c.id_categoria
      GROUP BY c.id_categoria
      ORDER BY c.nombre`);
    res.json(rows);
  } catch (err) { next(err); }
}

// GET /api/categorias/:id
async function obtener(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM categorias WHERE id_categoria = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    res.json(rows[0]);
  } catch (err) { next(err); }
}

// GET /api/categorias/:id/productos
async function productosDeCategoria(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM productos WHERE id_categoria = ? ORDER BY nombre', [req.params.id]);
    res.json(rows);
  } catch (err) { next(err); }
}

// POST /api/categorias
async function crear(req, res, next) {
  try {
    const error = validar(req.body);
    if (error) return res.status(400).json({ mensaje: error });
    const { nombre, descripcion = null } = req.body;
    const [result] = await pool.query(
      'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)',
      [nombre.trim(), descripcion]);
    res.status(201).json({ id_categoria: result.insertId, nombre: nombre.trim(), descripcion });
  } catch (err) { next(err); }
}

// PUT /api/categorias/:id
async function actualizar(req, res, next) {
  try {
    const error = validar(req.body);
    if (error) return res.status(400).json({ mensaje: error });
    const { nombre, descripcion = null } = req.body;
    const [result] = await pool.query(
      'UPDATE categorias SET nombre = ?, descripcion = ? WHERE id_categoria = ?',
      [nombre.trim(), descripcion, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    res.json({ id_categoria: Number(req.params.id), nombre: nombre.trim(), descripcion });
  } catch (err) { next(err); }
}

// DELETE /api/categorias/:id
async function eliminar(req, res, next) {
  try {
    const [result] = await pool.query(
      'DELETE FROM categorias WHERE id_categoria = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    res.json({ mensaje: 'Categoría eliminada' });
  } catch (err) { next(err); }
}

module.exports = { listar, obtener, productosDeCategoria, crear, actualizar, eliminar };
