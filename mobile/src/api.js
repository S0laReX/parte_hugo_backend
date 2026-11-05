// Todas las llamadas a la API del backend
import * as SecureStore from 'expo-secure-store';
import { API_URL_INICIAL } from './config';

let apiUrl = API_URL_INICIAL;
export const getApiUrl = () => apiUrl;
export const setApiUrl = (url) => { apiUrl = url.replace(/\/+$/, ''); };

// ----- Sesión -----
// El token se guarda cifrado en el celular (SecureStore) para no pedir login cada vez.
const CLAVE_SESION = 'ferreteria_sesion';
let sesionActual = null;

export async function cargarSesion() {
  try {
    const guardada = await SecureStore.getItemAsync(CLAVE_SESION);
    sesionActual = guardada ? JSON.parse(guardada) : null;
  } catch {
    sesionActual = null;
  }
  return sesionActual;
}

export async function guardarSesion(sesion) {
  sesionActual = sesion;
  try {
    if (sesion) await SecureStore.setItemAsync(CLAVE_SESION, JSON.stringify(sesion));
    else await SecureStore.deleteItemAsync(CLAVE_SESION);
  } catch {
    // si no se puede guardar, la sesión dura mientras la app esté abierta
  }
}

// App.js registra aquí qué hacer cuando la API responde 401 (sesión vencida)
let alSesionVencida = () => {};
export const onSesionVencida = (fn) => { alSesionVencida = fn; };

async function request(ruta, opciones = {}) {
  // Si el servidor no responde en 8 segundos, se cancela
  const control = new AbortController();
  const timer = setTimeout(() => control.abort(), 8000);

  const headers = { 'Content-Type': 'application/json' };
  if (sesionActual?.token) headers.Authorization = `Bearer ${sesionActual.token}`;

  let respuesta;
  try {
    respuesta = await fetch(`${apiUrl}${ruta}`, { ...opciones, headers, signal: control.signal });
  } catch {
    throw new Error(
      `No se pudo conectar con ${apiUrl}. Revisa que el backend esté encendido y que el celular esté en la misma red WiFi.`
    );
  } finally {
    clearTimeout(timer);
  }

  const datos = await respuesta.json().catch(() => ({}));
  if (respuesta.status === 401 && sesionActual?.token && !ruta.startsWith('/auth/login')) {
    alSesionVencida(datos.mensaje);
  }
  if (!respuesta.ok) throw new Error(datos.mensaje || `Error ${respuesta.status}`);
  return datos;
}

// ----- Autenticación -----
export const estadoAuth = () => request('/auth/estado');
export const registroInicial = (d) => request('/auth/registro', { method: 'POST', body: JSON.stringify(d) });
export const login = (d) => request('/auth/login', { method: 'POST', body: JSON.stringify(d) });

// ----- Usuarios (solo administrador) -----
export const getUsuarios = () => request('/usuarios');
export const crearUsuario = (d) => request('/usuarios', { method: 'POST', body: JSON.stringify(d) });
export const eliminarUsuario = (id) => request(`/usuarios/${id}`, { method: 'DELETE' });

// ----- Categorías -----
export const getCategorias = () => request('/categorias');
export const crearCategoria = (d) => request('/categorias', { method: 'POST', body: JSON.stringify(d) });
export const actualizarCategoria = (id, d) =>
  request(`/categorias/${id}`, { method: 'PUT', body: JSON.stringify(d) });
export const eliminarCategoria = (id) => request(`/categorias/${id}`, { method: 'DELETE' });

// ----- Productos -----
export const getProductos = ({ buscar = '', categoria = '' } = {}) => {
  const params = [];
  if (buscar) params.push(`buscar=${encodeURIComponent(buscar)}`);
  if (categoria) params.push(`categoria=${categoria}`);
  return request(`/productos${params.length ? `?${params.join('&')}` : ''}`);
};
export const crearProducto = (d) => request('/productos', { method: 'POST', body: JSON.stringify(d) });
export const actualizarProducto = (id, d) =>
  request(`/productos/${id}`, { method: 'PUT', body: JSON.stringify(d) });
export const eliminarProducto = (id) => request(`/productos/${id}`, { method: 'DELETE' });
