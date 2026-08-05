const express = require('express');
const router = express.Router();
const { login, obtenerPerfil, crearUsuario, cambiarPassword } = require('../controllers/authController');
const { proteger, autorizar } = require('../middleware/auth');


router.post('/login', login);
router.get('/perfil', proteger, obtenerPerfil);
router.put('/cambiar-password', proteger, cambiarPassword);
router.post('/usuarios', proteger, autorizar('admin'), crearUsuario);

module.exports = router;

