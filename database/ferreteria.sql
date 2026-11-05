-- =========================================================
--  Base de datos: ferreteria_db
--  Sistema de gestión de una ferretería (productos y categorías)
-- =========================================================

SET NAMES utf8mb4;  -- para que las tildes y la ñ se guarden bien

DROP DATABASE IF EXISTS ferreteria_db;
CREATE DATABASE ferreteria_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ferreteria_db;

-- ---------------------------------------------------------
--  Tabla: categorias
-- ---------------------------------------------------------
CREATE TABLE categorias (
  id_categoria INT AUTO_INCREMENT PRIMARY KEY,
  nombre       VARCHAR(100) NOT NULL UNIQUE,
  descripcion  VARCHAR(255)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
--  Tabla: productos
--  Cada producto pertenece a UNA categoría (relación 1 a N).
--  ON DELETE RESTRICT: no se puede borrar una categoría que
--  todavía tiene productos.
-- ---------------------------------------------------------
CREATE TABLE productos (
  id_producto  INT AUTO_INCREMENT PRIMARY KEY,
  nombre       VARCHAR(150) NOT NULL,
  descripcion  VARCHAR(255),
  precio       DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
  stock        INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  id_categoria INT NOT NULL,
  CONSTRAINT fk_productos_categorias
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------
--  Tabla: usuarios
--  Quién puede entrar al sistema.
--  rol 'admin'    = el ferretero (control total)
--  rol 'empleado' = consulta, registra y modifica, pero no elimina
--  La contraseña se guarda cifrada con bcrypt, nunca en texto plano.
--  No se insertan usuarios: la primera vez, el sistema pide
--  registrar al ferretero (registro inicial).
-- ---------------------------------------------------------
CREATE TABLE usuarios (
  id_usuario    INT AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(100) NOT NULL,
  correo        VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol           ENUM('admin', 'empleado') NOT NULL DEFAULT 'empleado',
  creado_en     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
--  Datos de ejemplo
-- ---------------------------------------------------------
INSERT INTO categorias (nombre, descripcion) VALUES
  ('Herramientas manuales',   'Martillos, destornilladores, llaves y alicates'),
  ('Herramientas eléctricas', 'Taladros, amoladoras y sierras eléctricas'),
  ('Pinturas',                'Pinturas, barnices, brochas y rodillos'),
  ('Plomería',                'Tubos, llaves de paso y accesorios de PVC'),
  ('Electricidad',            'Cables, focos, enchufes e interruptores'),
  ('Tornillería',             'Tornillos, clavos, pernos y tarugos');

INSERT INTO productos (nombre, descripcion, precio, stock, id_categoria) VALUES
  ('Martillo de uña 16 oz',        'Mango de fibra de vidrio',            45.00, 30, 1),
  ('Juego de destornilladores 6p', 'Planos y estrella, punta imantada',   60.00, 25, 1),
  ('Llave inglesa 10"',            'Acero cromo vanadio',                 55.50, 15, 1),
  ('Taladro percutor 650W',        'Mandril de 13 mm, velocidad variable', 420.00, 8, 2),
  ('Amoladora angular 4 1/2"',     '850W, incluye disco de corte',        380.00, 6, 2),
  ('Pintura látex blanca 4L',      'Interior/exterior, lavable',          150.00, 20, 3),
  ('Brocha 3"',                    'Cerda natural',                        18.00, 40, 3),
  ('Tubo PVC 1/2" x 6m',           'Para agua fría',                       28.00, 50, 4),
  ('Llave de paso 1/2"',           'Bronce, rosca',                        35.00, 22, 4),
  ('Cable 2.5 mm x 100m',          'Cobre, aislamiento THW',              520.00, 10, 5),
  ('Foco LED 12W',                 'Luz blanca, rosca E27',                22.00, 80, 5),
  ('Tornillos para madera 1" x100', 'Cabeza estrella, zincados',           15.00, 60, 6);
