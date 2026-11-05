// Todas las llamadas a la API del backend están en este archivo.

// Si existe VITE_API_URL en el .env se usa esa dirección.
// Si no, se usa la misma IP con la que se abrió la web (puerto 3000).
// Así funciona tanto en localhost como desde otra computadora de la red.
export const API_URL =
  import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000/api`;

async function request(ruta, opciones = {}) {
  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      headers: { 'Content-Type': 'application/json' },
      ...opciones
    });
  } catch {
    throw new Error(`No se pudo conectar con la API en ${API_URL}. Revisa que el backend esté encendido.`);
  }
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(datos.mensaje || `Error ${respuesta.status}`);
  return datos;
}

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
