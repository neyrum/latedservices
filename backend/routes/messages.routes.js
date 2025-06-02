const express = require("express");
const router = express.Router();
const { sendMessage, getMessages, updateMessageStatus,deleteMessage, deleteAllMessages } = require("../controllers/messages.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");

// ✅ GET: Obtener mensajes entre usuarios (Solo autenticados)
router.get("/", authenticate, getMessages);

// ✅ POST: Solo usuarios autenticados pueden enviar mensajes
router.post("/send", authenticate, authorize(["admin", "superadmin", "client"]), sendMessage);
router.delete("/all", authenticate, authorize(["admin", "superadmin"]), deleteAllMessages);
router.put("/:id/status", authenticate, authorize(["admin", "superadmin", "client"]), updateMessageStatus);
router.delete("/:id", authenticate, authorize(["admin", "superadmin", "client"]), deleteMessage);

module.exports = router;