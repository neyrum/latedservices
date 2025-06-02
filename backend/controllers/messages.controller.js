const { Message, User } = require("../models");
const { Op } = require("sequelize");

// 🔹 Obtener mensajes autenticados entre dos usuarios
const getMessages = async (req, res) => {
    try {
        const { senderId, receiverId, page = 1, limit = 20 } = req.query;

        if (!req.user) {
            return res.status(403).json({ error: "Usuario no autenticado" });
        }

        if (!senderId || !receiverId) {
            return res.status(400).json({ error: "❌ senderId y receiverId son requeridos" });
        }

        if (req.user.id !== parseInt(senderId, 10) && req.user.id !== parseInt(receiverId, 10)) {
            return res.status(403).json({ error: "❌ No tienes permiso para acceder a estos mensajes." });
        }

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const offset = (pageNum - 1) * limitNum;

        // 🔹 Consultar mensajes filtrando los eliminados (donde deleted_at sea NULL)
        const { count, rows: messages } = await Message.findAndCountAll({
            where: { senderId, receiverId, deleted_at: null },
            order: [["createdAt", "ASC"]],
            limit: limitNum,
            offset: offset,
        });

        res.status(200).json({
            totalMessages: count,
            totalPages: Math.ceil(count / limitNum),
            currentPage: pageNum,
            messages,
        });
    } catch (error) {
        console.error("❌ Error al obtener mensajes:", error.message);
        res.status(500).json({ message: `Error interno: ${error.message}` });
    }
};

// 🔹 Enviar mensaje autenticado
const sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;

        if (!req.user) {
            return res.status(403).json({ error: "Usuario no autenticado" });
        }

        const senderId = req.user.id;

        if (!receiverId || !content) {
            return res.status(400).json({ error: "❌ receiverId y content son requeridos." });
        }

        const sender = await User.findByPk(senderId);
        if (!sender) {
            return res.status(404).json({ error: "❌ Usuario remitente no encontrado." });
        }
       
        const senderName = sender?.name || "Desconocido";

        const message = await Message.create({
            senderId,
            senderName,
            receiverId,
            content,
            status: "sent",
        });

        // Emitir el mensaje y la notificación a través de Socket.io, si está configurado
        if (req.app.get("io")) {
            req.app.get("io").emit("newMessage", message);
            req.app.get("io").emit(`notification-${receiverId}`, {
                title: "Nuevo mensaje",
                body: `Mensaje de ${senderName}: ${content}`,
            });
        }

        res.status(201).json({ message: "✅ Mensaje enviado correctamente.", data: message });
    } catch (error) {
        console.error("❌ Error al enviar mensaje:", error.message);
        res.status(500).json({ message: `Error interno: ${error.message}` });
    }
};

// 🔹 Actualizar el estado del mensaje
const updateMessageStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["sent", "received", "read"].includes(status)) {
            return res.status(400).json({ error: "❌ Estado inválido." });
        }

        const message = await Message.findByPk(id);
        if (!message) {
            return res.status(404).json({ error: "❌ Mensaje no encontrado." });
        }

        // Solo el receptor del mensaje puede actualizar su estado
        if (req.user.id !== message.receiverId) {
            return res.status(403).json({ error: "❌ No puedes cambiar el estado de este mensaje." });
        }

        await message.update({ status });

        res.status(200).json({ message: "✅ Estado actualizado.", data: message });
    } catch (error) {
        console.error("❌ Error al actualizar estado:", error.message);
        res.status(500).json({ error: `Error interno: ${error.message}` });
    }
};

// 🔹 Soft Delete para usuarios (marcar mensaje como eliminado)
const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const userRole = req.user.role;

        const message = await Message.findByPk(id);
        if (!message) {
            return res.status(404).json({ error: "❌ Mensaje no encontrado." });
        }

        // Se permite la eliminación si el usuario es administrador/superadmin o es el remitente/receptor del mensaje
        if (
            userRole !== "admin" &&
            userRole !== "superadmin" &&
            req.user.id !== message.senderId &&
            req.user.id !== message.receiverId
        ) {
            return res.status(403).json({ error: "❌ No tienes permiso para eliminar este mensaje." });
        }

        await message.update({ deleted_at: new Date() });

        res.status(200).json({ message: "✅ Mensaje marcado como eliminado." });
    } catch (error) {
        console.error("❌ Error al eliminar mensaje:", error.message);
        res.status(500).json({ error: `Error interno: ${error.message}` });
    }
};

// 🔹 Hard Delete solo para administradores (eliminar definitivamente los mensajes marcados con soft delete)
const deleteAllMessages = async (req, res) => {
    try {
        if (req.user.role !== "admin" && req.user.role !== "superadmin") {
            return res.status(403).json({ error: "❌ No tienes permiso para eliminar todos los mensajes." });
        }

        await Message.destroy({ where: { deleted_at: { [Op.not]: null } } });

        res.status(200).json({ message: "✅ Mensajes eliminados permanentemente." });
    } catch (error) {
        console.error("❌ Error al eliminar todos los mensajes:", error.message);
        res.status(500).json({ error: `Error interno: ${error.message}` });
    }
};

module.exports = {
    getMessages,
    sendMessage,
    updateMessageStatus,
    deleteMessage,
    deleteAllMessages,
};
