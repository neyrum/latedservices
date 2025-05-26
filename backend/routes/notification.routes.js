const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware"); // Middleware de autenticación
const { authorize } = require("../middlewares/role.middleware"); // Middleware de autorización
const { sendNotification, getUserNotifications, markAsReadAndDelete } = require("../controllers/notification.controller"); // Importar controladores

// Rutas para obtener notificaciones del usuario autenticado
router.get("/", authenticate, authorize(["superadmin", "admin", "client", "manager"]), getUserNotifications);

// Ruta para marcar notificaciones como leídas y eliminarlas
router.delete("/:id", authenticate, authorize(["superadmin", "admin", "client", "manager"]), markAsReadAndDelete);

// Ruta para enviar una notificación (solo administradores)
router.post("/send", authenticate, authorize(["superadmin", "admin"]), sendNotification);

module.exports = router;
