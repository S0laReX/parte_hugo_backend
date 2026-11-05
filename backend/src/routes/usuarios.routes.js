const { Router } = require('express');
const c = require('../controllers/usuarios.controller');
const { soloAdmin } = require('../middlewares/auth');

const router = Router();

// Todas estas rutas son solo para el administrador
router.use(soloAdmin);

router.get('/', c.listar);
router.post('/', c.crear);
router.delete('/:id', c.eliminar);

module.exports = router;
