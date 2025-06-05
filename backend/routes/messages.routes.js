const express = require("express");
const router = express.Router();
const { sendMessage, getMessages, updateMessageStatus, deleteMessage, deleteAllMessages } = require("../controllers/messages.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");

// ✅ GET: Obtener mensajes entre usuarios (Solo autenticados)
router.get("/", authenticate, getMessages);

// ✅ POST: Solo usuarios autenticados pueden enviar mensajes
router.post("/send", authenticate, authorize(["admin", "superadmin", "client"]), sendMessage);

// ✅ DELETE: Hard delete (Solo administradores eliminan completamente mensajes eliminados)
router.delete("/all", authenticate, authorize(["admin", "superadmin"]), deleteAllMessages);

// ✅ PUT: Actualizar estado del mensaje (Usuarios autenticados con permisos)
router.put("/:id/status", authenticate, authorize(["admin", "superadmin", "client"]), updateMessageStatus);

// ✅ DELETE: Soft delete (Usuarios eliminan mensajes, pero se conservan en la BD)
router.delete("/:id", authenticate, authorize(["admin", "superadmin", "client"]), deleteMessage);


module.exports = router;