const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const categoriasRoutes = require('./routes/categorias.routes');
const productosRoutes = require('./routes/productos.routes');
const { requiereLogin } = require('./middlewares/auth');
const { noEncontrado, manejarErrores } = require('./middlewares/errores');

const app = express();

// Middlewares
app.use(cors());            // permite que la web y la app móvil consuman la API
app.use(express.json());    // lee el body en formato JSON

// Registro simple de cada petición en consola
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()}  ${req.method} ${req.originalUrl}  (desde ${req.ip})`);
  next();
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    mensaje: 'API Ferretería funcionando',
    endpoints: ['/api/auth', '/api/usuarios', '/api/categorias', '/api/productos']
  });
});

// Rutas públicas (no necesitan sesión)
app.use('/api/auth', authRoutes);

// Rutas protegidas: requieren iniciar sesión (token en la cabecera Authorization)
app.use('/api/usuarios', requiereLogin, usuariosRoutes);
app.use('/api/categorias', requiereLogin, categoriasRoutes);
app.use('/api/productos', requiereLogin, productosRoutes);

// Manejo de errores (siempre al final)
app.use(noEncontrado);
app.use(manejarErrores);

module.exports = app;
