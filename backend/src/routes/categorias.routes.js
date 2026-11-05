const { Router } = require('express');
const c = require('../controllers/categorias.controller');
const { soloAdmin } = require('../middlewares/auth');

const router = Router();

router.get('/', c.listar);
router.get('/:id', c.obtener);
router.get('/:id/productos', c.productosDeCategoria);
router.post('/', c.crear);
router.put('/:id', c.actualizar);
router.delete('/:id', soloAdmin, c.eliminar); // solo el ferretero elimina

module.exports = router;
