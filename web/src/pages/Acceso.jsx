import { useState } from 'react';
import * as api from '../api';

// Pantalla de acceso:
//  - modo "registro": la primera vez, crea la cuenta del ferretero (administrador)
//  - modo "login": iniciar sesión
export default function Acceso({ modo, alEntrar, aviso }) {
  const esRegistro = modo === 'registro';
  const [form, setForm] = useState({ nombre: '', correo: '', password: '', confirmar: '' });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    if (esRegistro) {
      if (!form.nombre.trim()) return setError('Escribe tu nombre.');
      if (form.password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.');
      if (form.password !== form.confirmar) return setError('Las contraseñas no coinciden.');
    } else if (!form.correo || !form.password) {
      return setError('Escribe tu correo y contraseña.');
    }

    setEnviando(true);
    try {
      const sesion = esRegistro
        ? await api.registroInicial({ nombre: form.nombre, correo: form.correo, password: form.password })
        : await api.login({ correo: form.correo, password: form.password });
      alEntrar(sesion);
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  };

  return (
    <div className="acceso">
      <div className="acceso__panel">
        <p className="acceso__marca">Ferretería</p>
        <h1 className="acceso__titulo">{esRegistro ? 'Crear la cuenta del ferretero' : 'Iniciar sesión'}</h1>
        <p className="acceso__texto">
          {esRegistro
            ? 'Es la primera vez que se usa el sistema. Esta cuenta será la del administrador; después podrás crear cuentas para tus empleados.'
            : 'Entra con el correo y la contraseña que te dio el ferretero.'}
        </p>

        {aviso && <p className="acceso__aviso">{aviso}</p>}

        <form onSubmit={enviar} className="formulario" noValidate>
          {esRegistro && (
            <label className="campo">
              <span className="campo__etiqueta">Nombre</span>
              <input name="nombre" value={form.nombre} onChange={cambiar} autoComplete="name" autoFocus />
            </label>
          )}
          <label className="campo">
            <span className="campo__etiqueta">Correo</span>
            <input name="correo" type="email" value={form.correo} onChange={cambiar} autoComplete="email" autoFocus={!esRegistro} />
          </label>
          <label className="campo">
            <span className="campo__etiqueta">Contraseña</span>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={cambiar}
              autoComplete={esRegistro ? 'new-password' : 'current-password'}
            />
          </label>
          {esRegistro && (
            <label className="campo">
              <span className="campo__etiqueta">Repite la contraseña</span>
              <input name="confirmar" type="password" value={form.confirmar} onChange={cambiar} autoComplete="new-password" />
            </label>
          )}

          {error && <p className="formulario__error" role="alert">{error}</p>}

          <button type="submit" className="btn btn--principal btn--ancho" disabled={enviando}>
            {enviando ? 'Un momento…' : esRegistro ? 'Crear cuenta y entrar' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
