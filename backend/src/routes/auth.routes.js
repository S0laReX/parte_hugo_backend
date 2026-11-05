const { Router } = require('express');
const c = require('../controllers/auth.controller');
const { requiereLogin } = require('../middlewares/auth');

const router = Router();

router.get('/estado', c.estado);          // ¿hay que hacer el registro inicial?
router.post('/registro', c.registroInicial); // registro del ferretero (solo la primera vez)
router.post('/login', c.login);
router.get('/yo', requiereLogin, c.yo);

module.exports = router;
