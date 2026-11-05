import { useCallback, useEffect, useState } from 'react';
import * as api from '../api';
import Modal from '../components/Modal.jsx';
import StockBarra, { STOCK_BAJO } from '../components/StockBarra.jsx';

const VACIO = { nombre: '', descripcion: '', precio: '', stock: '', id_categoria: '' };

const formatoBs = (n) => `Bs ${Number(n).toFixed(2)}`;

export default function Productos({ avisar }) {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [buscar, setBuscar] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');

  const [formAbierto, setFormAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(VACIO);
  const [errorForm, setErrorForm] = useState('');
  const [guardando, setGuardando] = useState(false);

  // READ: carga productos según la búsqueda y el filtro
  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const datos = await api.getProductos({ buscar, categoria: filtroCategoria });
      setProductos(datos);
      setErrorCarga('');
    } catch (e) {
      setErrorCarga(e.message);
    } finally {
      setCargando(false);
    }
  }, [buscar, filtroCategoria]);

  // Espera 300 ms después de escribir antes de buscar
  useEffect(() => {
    const t = setTimeout(cargar, 300);
    return () => clearTimeout(t);
  }, [cargar]);

  useEffect(() => {
    api.getCategorias().then(setCategorias).catch(() => {});
  }, []);

  const abrirNuevo = () => {
    setEditandoId(null);
    setForm({ ...VACIO, id_categoria: filtroCategoria || '' });
    setErrorForm('');
    setFormAbierto(true);
  };

  const abrirEditar = (p) => {
    setEditandoId(p.id_producto);
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion || '',
      precio: String(p.precio),
      stock: String(p.stock),
      id_categoria: String(p.id_categoria)
    });
    setErrorForm('');
    setFormAbierto(true);
  };

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // CREATE / UPDATE
  const guardar = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return setErrorForm('Escribe el nombre del producto.');
    if (form.precio === '' || Number(form.precio) < 0) return setErrorForm('El precio debe ser 0 o más.');
    if (form.stock === '' || !Number.isInteger(Number(form.stock)) || Number(form.stock) < 0)
      return setErrorForm('El stock debe ser un número entero, 0 o más.');
    if (!form.id_categoria) return setErrorForm('Elige una categoría.');

    const datos = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || null,
      precio: Number(form.precio),
      stock: Number(form.stock),
      id_categoria: Number(form.id_categoria)
    };

    setGuardando(true);
    try {
      if (editandoId) {
        await api.actualizarProducto(editandoId, datos);
        avisar('Producto actualizado');
      } else {
        await api.crearProducto(datos);
        avisar('Producto registrado');
      }
      setFormAbierto(false);
      cargar();
    } catch (err) {
      setErrorForm(err.message);
    } finally {
      setGuardando(false);
    }
  };

  // DELETE
  const eliminar = async (p) => {
    if (!window.confirm(`¿Eliminar "${p.nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api.eliminarProducto(p.id_producto);
      avisar('Producto eliminado');
      cargar();
    } catch (err) {
      avisar(err.message, 'error');
    }
  };

  const conStockBajo = productos.filter((p) => p.stock < STOCK_BAJO).length;

  return (
    <section>
      <div className="encabezado">
        <div>
          <h2 className="titulo">Productos</h2>
          <p className="resumen">
            {productos.length} {productos.length === 1 ? 'producto' : 'productos'}
            {conStockBajo > 0 && (
              <span className="resumen__alerta"> · {conStockBajo} con stock bajo</span>
            )}
          </p>
        </div>
        <button className="btn btn--principal" onClick={abrirNuevo}>
          Registrar producto
        </button>
      </div>

      <div className="filtros">
        <label className="campo campo--buscar">
          <span className="campo__etiqueta">Buscar</span>
          <input
            type="search"
            placeholder="Nombre o descripción"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
          />
        </label>
        <label className="campo">
          <span className="campo__etiqueta">Categoría</span>
          <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
            <option value="">Todas</option>
            {categorias.map((c) => (
              <option key={c.id_categoria} value={c.id_categoria}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>

      {errorCarga ? (
        <div className="estado estado--error">
          <p>{errorCarga}</p>
          <button className="btn" onClick={cargar}>Reintentar</button>
        </div>
      ) : cargando && productos.length === 0 ? (
        <p className="estado">Cargando productos…</p>
      ) : productos.length === 0 ? (
        <div className="estado">
          <p>{buscar || filtroCategoria ? 'Ningún producto coincide con la búsqueda.' : 'Todavía no hay productos.'}</p>
          {!buscar && !filtroCategoria && (
            <button className="btn btn--principal" onClick={abrirNuevo}>Registrar el primero</button>
          )}
        </div>
      ) : (
        <table className="tabla">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th className="num">Precio</th>
              <th>Stock</th>
              <th><span className="sr">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id_producto}>
                <td data-label="Producto">
                  <span className="producto__nombre">{p.nombre}</span>
                  {p.descripcion && <span className="producto__desc">{p.descripcion}</span>}
                </td>
                <td data-label="Categoría"><span className="chip">{p.categoria}</span></td>
                <td data-label="Precio" className="num precio">{formatoBs(p.precio)}</td>
                <td data-label="Stock"><StockBarra stock={p.stock} /></td>
                <td className="acciones">
                  <button className="btn btn--chico" onClick={() => abrirEditar(p)}>Editar</button>
                  <button className="btn btn--chico btn--peligro" onClick={() => eliminar(p)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {formAbierto && (
        <Modal titulo={editandoId ? 'Editar producto' : 'Registrar producto'} alCerrar={() => setFormAbierto(false)}>
          <form onSubmit={guardar} className="formulario" noValidate>
            <label className="campo">
              <span className="campo__etiqueta">Nombre</span>
              <input name="nombre" value={form.nombre} onChange={cambiar} maxLength={150} autoFocus />
            </label>
            <label className="campo">
              <span className="campo__etiqueta">Descripción</span>
              <textarea name="descripcion" value={form.descripcion} onChange={cambiar} rows={2} maxLength={255} />
            </label>
            <div className="formulario__fila">
              <label className="campo">
                <span className="campo__etiqueta">Precio (Bs)</span>
                <input name="precio" type="number" min="0" step="0.01" value={form.precio} onChange={cambiar} />
              </label>
              <label className="campo">
                <span className="campo__etiqueta">Stock</span>
                <input name="stock" type="number" min="0" step="1" value={form.stock} onChange={cambiar} />
              </label>
            </div>
            <label className="campo">
              <span className="campo__etiqueta">Categoría</span>
              <select name="id_categoria" value={form.id_categoria} onChange={cambiar}>
                <option value="">Elige una categoría</option>
                {categorias.map((c) => (
                  <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
                ))}
              </select>
            </label>

            {errorForm && <p className="formulario__error" role="alert">{errorForm}</p>}

            <div className="formulario__botones">
              <button type="button" className="btn" onClick={() => setFormAbierto(false)}>Cancelar</button>
              <button type="submit" className="btn btn--principal" disabled={guardando}>
                {guardando ? 'Guardando…' : editandoId ? 'Guardar cambios' : 'Registrar producto'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
