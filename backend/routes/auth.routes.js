const express = require('express');
const router = express.Router();
const { register, login, loginLDAP, getProfile } = require('../controllers/auth.controller');
const { requestPasswordReset, resetPassword } = require('../controllers/auth.controller');
const authMiddleware = require("../middlewares/auth.middleware"); // Middleware para autenticación JWT


// Ruta para registrar un nuevo usuario
router.post('/register', register);

// Ruta para iniciar sesión
router.post('/login', login);

// Ruta para iniciar sesión con LDAP
router.post("/login-ldap", loginLDAP);

// 🔹 Ruta protegida para obtener detalles del usuario autenticado en LDAP
router.get("/profile", authMiddleware.authenticate, getProfile);

// Ruta para solicitar el restablecimiento de contraseña
router.post('/request-password-reset', requestPasswordReset);

// Ruta para restablecer la contraseña
router.post('/reset-password', resetPassword);

module.exports = router;