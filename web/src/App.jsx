import { useCallback, useEffect, useState } from 'react';
import * as api from './api';
import Productos from './pages/Productos.jsx';
import Categorias from './pages/Categorias.jsx';
import Usuarios from './pages/Usuarios.jsx';
import Acceso from './pages/Acceso.jsx';
import Aviso from './components/Aviso.jsx';

export default function App() {
  const [sesion, setSesion] = useState(api.leerSesion()); // { token, usuario }
  const [necesitaRegistro, setNecesitaRegistro] = useState(null); // null = consultando
  const [errorConexion, setErrorConexion] = useState('');
  const [avisoAcceso, setAvisoAcceso] = useState('');
  const [pestana, setPestana] = useState('productos');
  const [aviso, setAviso] = useState(null);

  const avisar = useCallback((texto, tipo = 'ok') => {
    setAviso({ texto, tipo, id: Date.now() });
  }, []);

  const cerrarSesion = useCallback((mensaje = '') => {
    api.guardarSesion(null);
    setSesion(null);
    setPestana('productos');
    setAvisoAcceso(mensaje);
  }, []);

  // Si la API dice que la sesión venció, volvemos al login
  useEffect(() => {
    api.onSesionVencida((mensaje) => cerrarSesion(mensaje || 'Tu sesión expiró. Vuelve a iniciar sesión.'));
  }, [cerrarSesion]);

  // Al abrir, preguntamos si hace falta el registro inicial del ferretero
  const consultarEstado = useCallback(() => {
    setErrorConexion('');
    api.estadoAuth()
      .then((d) => setNecesitaRegistro(d.necesitaRegistro))
      .catch((e) => setErrorConexion(e.message));
  }, []);

  useEffect(() => {
    if (!sesion) consultarEstado();
  }, [sesion, consultarEstado]);

  const entrar = (nuevaSesion) => {
    api.guardarSesion(nuevaSesion);
    setSesion(nuevaSesion);
    setAvisoAcceso('');
    avisar(`Hola, ${nuevaSesion.usuario.nombre}`);
  };

  // ----- Sin sesión: registro inicial o login -----
  if (!sesion) {
    if (errorConexion) {
      return (
        <div className="acceso">
          <div className="acceso__panel">
            <p className="acceso__marca">Ferretería</p>
            <p className="formulario__error" role="alert">{errorConexion}</p>
            <button className="btn btn--ancho" onClick={consultarEstado}>Reintentar</button>
          </div>
        </div>
      );
    }
    if (necesitaRegistro === null) return <p className="estado">Conectando…</p>;
    return (
      <>
        <Acceso modo={necesitaRegistro ? 'registro' : 'login'} alEntrar={entrar} aviso={avisoAcceso} />
        {aviso && <Aviso key={aviso.id} {...aviso} alCerrar={() => setAviso(null)} />}
      </>
    );
  }

  // ----- Con sesión -----
  const { usuario } = sesion;
  const esAdmin = usuario.rol === 'admin';

  const pestanas = [
    ['productos', 'Productos'],
    ['categorias', 'Categorías'],
    ...(esAdmin ? [['usuarios', 'Usuarios']] : [])
  ];

  return (
    <>
      <header className="barra">
        <div className="barra__contenido">
          <div className="barra__superior">
            <h1 className="marca">Ferretería</h1>
            <div className="sesion">
              <span className="sesion__nombre">
                {usuario.nombre}
                <span className="sesion__rol">{esAdmin ? 'Administrador' : 'Empleado'}</span>
              </span>
              <button className="btn btn--chico btn--oscuro" onClick={() => cerrarSesion()}>Cerrar sesión</button>
            </div>
          </div>
          <nav className="pestanas" aria-label="Secciones">
            {pestanas.map(([clave, texto]) => (
              <button key={clave} className={pestana === clave ? 'activa' : ''} onClick={() => setPestana(clave)}>
                {texto}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="contenido">
        {pestana === 'productos' && <Productos avisar={avisar} esAdmin={esAdmin} />}
        {pestana === 'categorias' && <Categorias avisar={avisar} esAdmin={esAdmin} />}
        {pestana === 'usuarios' && esAdmin && <Usuarios avisar={avisar} usuarioActual={usuario} />}
      </main>

      {aviso && <Aviso key={aviso.id} {...aviso} alCerrar={() => setAviso(null)} />}
    </>
  );
}
