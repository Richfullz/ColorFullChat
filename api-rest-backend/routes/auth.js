const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/auth');

// Ruta para enviar email para recuperar contraseña
router.post('/forgot-password', AuthController.forgotPassword);

// Ruta para resetear la contraseña con token
router.post('/reset-password/:token', AuthController.resetPassword);

module.exports = router;
