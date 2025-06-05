const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware'); // Middleware para autenticar usuarios
const { authorize } = require('../middlewares/role.middleware'); // Middleware para autorizar roles
const { getAuditLogs } = require('../controllers/audit.controller'); // Controlador de auditoría

// Ruta para obtener registros de auditoría (solo accesible para superadmin)
router.get('/', authenticate, authorize(['superadmin']), getAuditLogs);

module.exports = router;