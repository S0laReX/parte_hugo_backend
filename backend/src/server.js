require('dotenv').config();
const os = require('os');
const app = require('./app');
const pool = require('./config/db');

const PORT = Number(process.env.PORT) || 3000;

// Devuelve las IPs de la computadora en la red local (WiFi / Ethernet)
function ipsLocales() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((i) => i && i.family === 'IPv4' && !i.internal)
    .map((i) => i.address);
}

// '0.0.0.0' = escuchar en TODAS las interfaces de red,
// así otras computadoras y celulares de la misma red pueden entrar por la IP.
app.listen(PORT, '0.0.0.0', async () => {
  console.log('==============================================');
  console.log(' API Ferretería en ejecución');
  console.log(`  Local:  http://localhost:${PORT}`);
  ipsLocales().forEach((ip) => console.log(`  Red:    http://${ip}:${PORT}`));
  console.log('==============================================');

  try {
    await pool.query('SELECT 1');
    console.log('Conexión a MySQL: OK');
  } catch (err) {
    console.error('No se pudo conectar a MySQL:', err.message);
    console.error('Revisa los datos del archivo .env');
  }
});
