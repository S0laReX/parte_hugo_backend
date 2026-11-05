import { useCallback, useEffect, useState } from 'react';
import * as api from '../api';
import Modal from '../components/Modal.jsx';

const VACIO = { nombre: '', descripcion: '' };

export default function Categorias({ avisar, esAdmin }) {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');

  const [formAbierto, setFormAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(VACIO);
  const [errorForm, setErrorForm] = useState('');
  const [guardando, setGuardando] = useState(false);

  // READ
  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      setCategorias(await api.getCategorias());
      setErrorCarga('');
    } catch (e) {
      setErrorCarga(e.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const abrirNuevo = () => {
    setEditandoId(null);
    setForm(VACIO);
    setErrorForm('');
    setFormAbierto(true);
  };

  const abrirEditar = (c) => {
    setEditandoId(c.id_categoria);
    setForm({ nombre: c.nombre, descripcion: c.descripcion || '' });
    setErrorForm('');
    setFormAbierto(true);
  };

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // CREATE / UPDATE
  const guardar = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return setErrorForm('Escribe el nombre de la categoría.');
    const datos = { nombre: form.nombre.trim(), descripcion: form.descripcion.trim() || null };

    setGuardando(true);
    try {
      if (editandoId) {
        await api.actualizarCategoria(editandoId, datos);
        avisar('Categoría actualizada');
      } else {
        await api.crearCategoria(datos);
        avisar('Categoría registrada');
      }
      setFormAbierto(false);
      cargar();
    } catch (err) {
      setErrorForm(err.message);
    } finally {
      setGuardando(false);
    }
  };

  // DELETE (la API no deja borrar si tiene productos)
  const eliminar = async (c) => {
    if (!window.confirm(`¿Eliminar la categoría "${c.nombre}"?`)) return;
    try {
      await api.eliminarCategoria(c.id_categoria);
      avisar('Categoría eliminada');
      cargar();
    } catch (err) {
      avisar(err.message, 'error');
    }
  };

  return (
    <section>
      <div className="encabezado">
        <div>
          <h2 className="titulo">Categorías</h2>
          <p className="resumen">{categorias.length} categorías</p>
        </div>
        <button className="btn btn--principal" onClick={abrirNuevo}>
          Registrar categoría
        </button>
      </div>

      {errorCarga ? (
        <div className="estado estado--error">
          <p>{errorCarga}</p>
          <button className="btn" onClick={cargar}>Reintentar</button>
        </div>
      ) : cargando && categorias.length === 0 ? (
        <p className="estado">Cargando categorías…</p>
      ) : categorias.length === 0 ? (
        <div className="estado">
          <p>Todavía no hay categorías. Registra una para poder agregar productos.</p>
          <button className="btn btn--principal" onClick={abrirNuevo}>Registrar la primera</button>
        </div>
      ) : (
        <table className="tabla">
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Descripción</th>
              <th className="num">Productos</th>
              <th><span className="sr">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((c) => (
              <tr key={c.id_categoria}>
                <td data-label="Categoría"><span className="producto__nombre">{c.nombre}</span></td>
                <td data-label="Descripción" className="texto-suave">{c.descripcion || '—'}</td>
                <td data-label="Productos" className="num">{c.total_productos}</td>
                <td className="acciones">
                  <button className="btn btn--chico" onClick={() => abrirEditar(c)}>Editar</button>
                  {esAdmin && (
                    <button
                      className="btn btn--chico btn--peligro"
                      onClick={() => eliminar(c)}
                      title={c.total_productos > 0 ? 'Tiene productos: primero muévelos o elimínalos' : undefined}
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {formAbierto && (
        <Modal titulo={editandoId ? 'Editar categoría' : 'Registrar categoría'} alCerrar={() => setFormAbierto(false)}>
          <form onSubmit={guardar} className="formulario" noValidate>
            <label className="campo">
              <span className="campo__etiqueta">Nombre</span>
              <input name="nombre" value={form.nombre} onChange={cambiar} maxLength={100} autoFocus />
            </label>
            <label className="campo">
              <span className="campo__etiqueta">Descripción</span>
              <textarea name="descripcion" value={form.descripcion} onChange={cambiar} rows={3} maxLength={255} />
            </label>

            {errorForm && <p className="formulario__error" role="alert">{errorForm}</p>}

            <div className="formulario__botones">
              <button type="button" className="btn" onClick={() => setFormAbierto(false)}>Cancelar</button>
              <button type="submit" className="btn btn--principal" disabled={guardando}>
                {guardando ? 'Guardando…' : editandoId ? 'Guardar cambios' : 'Registrar categoría'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
