import Constants from 'expo-constants';

// ================================================================
//  DIRECCIÓN DE LA API
//  Si el backend corre en OTRA computadora, escribe aquí su IP
//  (la que muestra el backend al iniciar, línea "Red:").
//  Ejemplo: 'http://192.168.1.50:3000/api'
//  Si lo dejas vacío, la app usa la IP de la computadora donde
//  corre "npx expo start" (sirve si el backend está en la misma PC).
// ================================================================
const IP_MANUAL = '';

function ipDelServidorExpo() {
  // hostUri viene como "192.168.1.50:8081"
  const hostUri = Constants.expoConfig?.hostUri;
  return hostUri ? hostUri.split(':')[0] : null;
}

export const API_URL_INICIAL =
  IP_MANUAL || `http://${ipDelServidorExpo() || 'localhost'}:3000/api`;
