# Sistema de gestión de Ferretería

API RESTful con **Node.js + Express + MySQL**, frontend web con **React** y aplicación móvil con **React Native (Expo)**.
Administra **categorías** y **productos** (consultar, registrar, modificar y eliminar).

**Integrantes**
- Hugo Nava — base de datos y backend (API REST)
- Alaitz Keyra Felipez Ledezma — frontend web y aplicación móvil

## Estructura del repositorio

```
ferreteria/
├── database/   Script SQL (tablas, relación y datos de ejemplo)
├── backend/    API REST con Node.js + Express
├── web/        Frontend web con React (Vite)
├── mobile/     App móvil con React Native (Expo)
└── postman/    Colección para probar la API
```

## Base de datos

Dos tablas con relación **uno a muchos**: una categoría tiene muchos productos y cada producto pertenece a una sola categoría.

| categorias     |               | productos      |                              |
|----------------|---------------|----------------|------------------------------|
| id_categoria   | PK            | id_producto    | PK                           |
| nombre         | único         | nombre         |                              |
| descripcion    |               | descripcion    |                              |
|                |               | precio         | DECIMAL(10,2), ≥ 0           |
|                |               | stock          | INT, ≥ 0                     |
|                |               | id_categoria   | FK → categorias.id_categoria |

La llave foránea usa `ON DELETE RESTRICT`: no se puede borrar una categoría que todavía tiene productos.

## Endpoints de la API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/categorias` | Lista categorías (con cantidad de productos) |
| GET | `/api/categorias/:id` | Una categoría |
| GET | `/api/categorias/:id/productos` | Productos de una categoría |
| POST | `/api/categorias` | Crea una categoría |
| PUT | `/api/categorias/:id` | Modifica una categoría |
| DELETE | `/api/categorias/:id` | Elimina una categoría (si no tiene productos) |
| GET | `/api/productos` | Lista productos. Filtros: `?buscar=texto` y `?categoria=id` |
| GET | `/api/productos/:id` | Un producto |
| POST | `/api/productos` | Crea un producto |
| PUT | `/api/productos/:id` | Modifica un producto |
| DELETE | `/api/productos/:id` | Elimina un producto |

Ejemplo de body para crear un producto:

```json
{ "nombre": "Serrucho 22\"", "descripcion": "Dientes templados", "precio": 75, "stock": 12, "id_categoria": 1 }
```

Códigos de respuesta: `200` OK, `201` creado, `400` datos inválidos, `404` no encontrado, `409` conflicto (nombre repetido o categoría con productos).

## Cómo ejecutarlo

Requisitos: Node.js 18 o superior, MySQL 8 (o XAMPP) y la app **Expo Go** en el celular.

### 1. Base de datos
Ejecutar `database/ferreteria.sql` en MySQL Workbench, phpMyAdmin o por consola:

```bash
mysql -u root -p < database/ferreteria.sql
```

### 2. Backend (computadora servidor)

```bash
cd backend
npm install
cp .env.example .env      # en Windows: copy .env.example .env
# editar .env con el usuario y contraseña de MySQL
npm start
```

Al iniciar, la consola muestra la dirección local y la de red, por ejemplo:

```
  Local:  http://localhost:3000
  Red:    http://192.168.1.50:3000
```

La dirección **Red** es la que usan las otras computadoras y los celulares.

### 3. Frontend web

```bash
cd web
npm install
npm run dev
```

Abrir `http://localhost:5173`. Desde otra computadora de la misma red: `http://IP-DEL-SERVIDOR:5173`.
La web usa automáticamente la API en la misma IP, puerto 3000. Si la API está en otra máquina, crear `web/.env` con
`VITE_API_URL=http://IP-DEL-SERVIDOR:3000/api`.

### 4. App móvil

```bash
cd mobile
npm install
npx expo start
```

Escanear el código QR con **Expo Go** (el celular debe estar en la misma red WiFi).
Si el backend corre en la misma computadora que Expo, la app encuentra la IP sola. Si no, escribirla en
`mobile/src/config.js` (`IP_MANUAL`) o tocar **Servidor** dentro de la app.

### 5. Pruebas con Postman
Importar `postman/Ferreteria.postman_collection.json` y cambiar la variable `baseUrl` por
`http://IP-DEL-SERVIDOR:3000/api`. Incluye las operaciones CRUD y casos de error.

## Si otro dispositivo no se conecta

- Todos los equipos deben estar en la **misma red** WiFi.
- En Windows, permitir Node.js en el Firewall (redes privadas) o abrir los puertos 3000 y 5173.
- Algunas redes públicas o de la universidad bloquean la conexión entre dispositivos. En ese caso, usar el punto de acceso (hotspot) de un celular.
