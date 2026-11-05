import { useCallback, useEffect, useState } from 'react';
import * as api from '../api';
import Modal from '../components/Modal.jsx';

const VACIO = { nombre: '', correo: '', password: '', rol: 'empleado' };

// Sección solo para el administrador: ver, crear y eliminar cuentas
export default function Usuarios({ avisar, usuarioActual }) {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');

  const [formAbierto, setFormAbierto] = useState(false);
  const [form, setForm] = useState(VACIO);
  const [errorForm, setErrorForm] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      setUsuarios(await api.getUsuarios());
      setErrorCarga('');
    } catch (e) {
      setErrorCarga(e.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const abrirNuevo = () => {
    setForm(VACIO);
    setErrorForm('');
    setFormAbierto(true);
  };

  const guardar = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return setErrorForm('Escribe el nombre.');
    if (!form.correo.trim()) return setErrorForm('Escribe el correo.');
    if (form.password.length < 6) return setErrorForm('La contraseña debe tener al menos 6 caracteres.');

    setGuardando(true);
    try {
      await api.crearUsuario(form);
      avisar('Cuenta creada');
      setFormAbierto(false);
      cargar();
    } catch (err) {
      setErrorForm(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (u) => {
    if (!window.confirm(`¿Eliminar la cuenta de ${u.nombre}? Ya no podrá entrar al sistema.`)) return;
    try {
      await api.eliminarUsuario(u.id_usuario);
      avisar('Cuenta eliminada');
      cargar();
    } catch (err) {
      avisar(err.message, 'error');
    }
  };

  return (
    <section>
      <div className="encabezado">
        <div>
          <h2 className="titulo">Usuarios</h2>
          <p className="resumen">Cuentas que pueden entrar al sistema</p>
        </div>
        <button className="btn btn--principal" onClick={abrirNuevo}>Crear cuenta</button>
      </div>

      {errorCarga ? (
        <div className="estado estado--error">
          <p>{errorCarga}</p>
          <button className="btn" onClick={cargar}>Reintentar</button>
        </div>
      ) : cargando && usuarios.length === 0 ? (
        <p className="estado">Cargando usuarios…</p>
      ) : (
        <table className="tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th><span className="sr">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id_usuario}>
                <td data-label="Nombre">
                  <span className="producto__nombre">
                    {u.nombre}
                    {u.id_usuario === usuarioActual.id_usuario && <span className="texto-suave"> (tú)</span>}
                  </span>
                </td>
                <td data-label="Correo" className="texto-suave">{u.correo}</td>
                <td data-label="Rol">
                  <span className={`chip ${u.rol === 'admin' ? 'chip--admin' : ''}`}>
                    {u.rol === 'admin' ? 'Administrador' : 'Empleado'}
                  </span>
                </td>
                <td className="acciones">
                  {u.id_usuario !== usuarioActual.id_usuario && (
                    <button className="btn btn--chico btn--peligro" onClick={() => eliminar(u)}>Eliminar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {formAbierto && (
        <Modal titulo="Crear cuenta" alCerrar={() => setFormAbierto(false)}>
          <form onSubmit={guardar} className="formulario" noValidate>
            <label className="campo">
              <span className="campo__etiqueta">Nombre</span>
              <input name="nombre" value={form.nombre} onChange={cambiar} autoFocus />
            </label>
            <label className="campo">
              <span className="campo__etiqueta">Correo</span>
              <input name="correo" type="email" value={form.correo} onChange={cambiar} autoComplete="off" />
            </label>
            <label className="campo">
              <span className="campo__etiqueta">Contraseña inicial</span>
              <input name="password" type="password" value={form.password} onChange={cambiar} autoComplete="new-password" />
            </label>
            <label className="campo">
              <span className="campo__etiqueta">Rol</span>
              <select name="rol" value={form.rol} onChange={cambiar}>
                <option value="empleado">Empleado (no puede eliminar ni gestionar usuarios)</option>
                <option value="admin">Administrador (control total)</option>
              </select>
            </label>

            {errorForm && <p className="formulario__error" role="alert">{errorForm}</p>}

            <div className="formulario__botones">
              <button type="button" className="btn" onClick={() => setFormAbierto(false)}>Cancelar</button>
              <button type="submit" className="btn btn--principal" disabled={guardando}>
                {guardando ? 'Creando…' : 'Crear cuenta'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
