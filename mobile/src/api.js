// Todas las llamadas a la API del backend
import { API_URL_INICIAL } from './config';

let apiUrl = API_URL_INICIAL;
export const getApiUrl = () => apiUrl;
export const setApiUrl = (url) => { apiUrl = url.replace(/\/+$/, ''); };

async function request(ruta, opciones = {}) {
  // Si el servidor no responde en 8 segundos, se cancela
  const control = new AbortController();
  const timer = setTimeout(() => control.abort(), 8000);

  let respuesta;
  try {
    respuesta = await fetch(`${apiUrl}${ruta}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: control.signal,
      ...opciones
    });
  } catch {
    throw new Error(
      `No se pudo conectar con ${apiUrl}. Revisa que el backend esté encendido y que el celular esté en la misma red WiFi.`
    );
  } finally {
    clearTimeout(timer);
  }

  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(datos.mensaje || `Error ${respuesta.status}`);
  return datos;
}

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
