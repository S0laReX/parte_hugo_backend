// Todas las llamadas a la API del backend están en este archivo.

// Si existe VITE_API_URL en el .env se usa esa dirección.
// Si no, se usa la misma IP con la que se abrió la web (puerto 3000).
// Así funciona tanto en localhost como desde otra computadora de la red.
export const API_URL =
  import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000/api`;

// ----- Sesión -----
// El token se guarda en el navegador para no pedir login cada vez que se recarga.
const CLAVE_SESION = 'ferreteria_sesion';

export function leerSesion() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_SESION)) || null;
  } catch {
    return null;
  }
}

export function guardarSesion(sesion) {
  try {
    if (sesion) localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
    else localStorage.removeItem(CLAVE_SESION);
  } catch {
    // si el navegador no deja guardar, la sesión dura hasta recargar
  }
}

// App.jsx registra aquí qué hacer cuando la API responde 401 (sesión vencida)
let alSesionVencida = () => {};
export const onSesionVencida = (fn) => { alSesionVencida = fn; };

async function request(ruta, opciones = {}) {
  const sesion = leerSesion();
  const headers = { 'Content-Type': 'application/json' };
  if (sesion?.token) headers.Authorization = `Bearer ${sesion.token}`;

  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, { ...opciones, headers });
  } catch {
    throw new Error(`No se pudo conectar con la API en ${API_URL}. Revisa que el backend esté encendido.`);
  }
  const datos = await respuesta.json().catch(() => ({}));

  // Sesión vencida o inválida en una ruta protegida: volver al login
  if (respuesta.status === 401 && sesion?.token && !ruta.startsWith('/auth/login')) {
    alSesionVencida(datos.mensaje);
  }
  if (!respuesta.ok) throw new Error(datos.mensaje || `Error ${respuesta.status}`);
  return datos;
}

// ----- Autenticación -----
export const estadoAuth = () => request('/auth/estado');
export const registroInicial = (data) =>
  request('/auth/registro', { method: 'POST', body: JSON.stringify(data) });
export const login = (data) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify(data) });

// ----- Usuarios (solo administrador) -----
export const getUsuarios = () => request('/usuarios');
export const crearUsuario = (data) =>
  request('/usuarios', { method: 'POST', body: JSON.stringify(data) });
export const eliminarUsuario = (id) => request(`/usuarios/${id}`, { method: 'DELETE' });

// ----- Categorías -----
export const getCategorias = () => request('/categorias');
export const crearCategoria = (data) =>
  request('/categorias', { method: 'POST', body: JSON.stringify(data) });
export const actualizarCategoria = (id, data) =>
  request(`/categorias/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const eliminarCategoria = (id) => request(`/categorias/${id}`, { method: 'DELETE' });

// ----- Productos -----
export const getProductos = ({ buscar = '', categoria = '' } = {}) => {
  const params = new URLSearchParams();
  if (buscar) params.set('buscar', buscar);
  if (categoria) params.set('categoria', categoria);
  const qs = params.toString();
  return request(`/productos${qs ? `?${qs}` : ''}`);
};
export const crearProducto = (data) =>
  request('/productos', { method: 'POST', body: JSON.stringify(data) });
export const actualizarProducto = (id, data) =>
  request(`/productos/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const eliminarProducto = (id) => request(`/productos/${id}`, { method: 'DELETE' });
