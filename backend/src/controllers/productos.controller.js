const pool = require('../config/db');

// Valida los datos que llegan en el body
function validar({ nombre, precio, stock, id_categoria }) {
  if (!nombre || !String(nombre).trim()) return 'El nombre es obligatorio';
  if (precio === undefined || precio === '' || isNaN(precio) || Number(precio) < 0)
    return 'El precio debe ser un número mayor o igual a 0';
  if (stock === undefined || stock === '' || !Number.isInteger(Number(stock)) || Number(stock) < 0)
    return 'El stock debe ser un número entero mayor o igual a 0';
  if (!id_categoria || isNaN(id_categoria)) return 'La categoría es obligatoria';
  return null;
}

const SELECT_CON_CATEGORIA = `
  SELECT p.id_producto, p.nombre, p.descripcion, p.precio, p.stock,
         p.id_categoria, c.nombre AS categoria
  FROM productos p
  INNER JOIN categorias c ON c.id_categoria = p.id_categoria`;

// GET /api/productos?buscar=texto&categoria=id
async function listar(req, res, next) {
  try {
    const { buscar, categoria } = req.query;
    const condiciones = [];
    const params = [];
    if (buscar) {
      condiciones.push('(p.nombre LIKE ? OR p.descripcion LIKE ?)');
      params.push(`%${buscar}%`, `%${buscar}%`);
    }
    if (categoria) {
      condiciones.push('p.id_categoria = ?');
      params.push(categoria);
    }
    const where = condiciones.length ? ' WHERE ' + condiciones.join(' AND ') : '';
    const [rows] = await pool.query(SELECT_CON_CATEGORIA + where + ' ORDER BY p.nombre', params);
    res.json(rows);
  } catch (err) { next(err); }
}

// GET /api/productos/:id
async function obtener(req, res, next) {
  try {
    const [rows] = await pool.query(SELECT_CON_CATEGORIA + ' WHERE p.id_producto = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (err) { next(err); }
}

// POST /api/productos
async function crear(req, res, next) {
  try {
    const error = validar(req.body);
    if (error) return res.status(400).json({ mensaje: error });
    const { nombre, descripcion = null, precio, stock, id_categoria } = req.body;
    const [result] = await pool.query(
      'INSERT INTO productos (nombre, descripcion, precio, stock, id_categoria) VALUES (?, ?, ?, ?, ?)',
      [nombre.trim(), descripcion, precio, stock, id_categoria]);
    const [rows] = await pool.query(SELECT_CON_CATEGORIA + ' WHERE p.id_producto = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
}

// PUT /api/productos/:id
async function actualizar(req, res, next) {
  try {
    const error = validar(req.body);
    if (error) return res.status(400).json({ mensaje: error });
    const { nombre, descripcion = null, precio, stock, id_categoria } = req.body;
    const [result] = await pool.query(
      `UPDATE productos
       SET nombre = ?, descripcion = ?, precio = ?, stock = ?, id_categoria = ?
       WHERE id_producto = ?`,
      [nombre.trim(), descripcion, precio, stock, id_categoria, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    const [rows] = await pool.query(SELECT_CON_CATEGORIA + ' WHERE p.id_producto = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) { next(err); }
}

// DELETE /api/productos/:id
async function eliminar(req, res, next) {
  try {
    const [result] = await pool.query('DELETE FROM productos WHERE id_producto = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json({ mensaje: 'Producto eliminado' });
  } catch (err) { next(err); }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
