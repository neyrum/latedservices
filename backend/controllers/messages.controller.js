const { Message, User } = require("../models");

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

        if (req.user.id !== parseInt(senderId) && req.user.id !== parseInt(receiverId)) {
            return res.status(403).json({ error: "❌ No tienes permiso para acceder a estos mensajes." });
        }

        // 🔹 Convertir valores de paginación a enteros
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const offset = (pageNum - 1) * limitNum;

        // 🔹 Consultar mensajes con paginación
        const { count, rows: messages } = await Message.findAndCountAll({
            where: { senderId, receiverId },
            order: [["createdAt", "ASC"]],
            limit: limitNum,
            offset: offset,
        });

        res.status(200).json({
            totalMessages: count, // 🔹 Total de mensajes en la BD
            totalPages: Math.ceil(count / limitNum), // 🔹 Número total de páginas
            currentPage: pageNum, // 🔹 Página actual
            messages, // 🔹 Mensajes paginados
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

        // 🔹 Obtener el nombre del remitente desde la base de datos
        const sender = await User.findByPk(senderId);
        if (!sender) {
            return res.status(404).json({ error: "❌ Usuario remitente no encontrado." });
        }
       
        const senderName = sender?.name || "Desconocido";
        // const senderName = sender.name; // 🔹 Asumiendo que 'name' es el campo donde está el nombre del usuario

        // 🔹 Crear el mensaje incluyendo senderName
        const message = await Message.create({
            senderId,
            senderName,  // ✅ Ahora guardamos el nombre del remitente
            receiverId,
            content,
            status: "sent",
        });

        // 🔹 Emitir mensaje a través de Socket.io
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

        // 🔹 Verificar que el nuevo estado sea válido
        if (!["sent", "received", "read"].includes(status)) {
            return res.status(400).json({ error: "❌ Estado inválido. Debe ser 'sent', 'received' o 'read'." });
        }

        // 🔹 Buscar el mensaje por su ID
        const message = await Message.findByPk(id);
        if (!message) {
            return res.status(404).json({ error: "❌ Mensaje no encontrado." });
        }

        // 🔹 Verificar que el usuario receptor es quien marca como leído
        if (req.user.id !== message.receiverId) {
            return res.status(403).json({ error: "❌ No puedes cambiar el estado de este mensaje." });
        }

        // 🔹 Actualizar el estado del mensaje
        await message.update({ status });

        res.status(200).json({ message: "✅ Estado del mensaje actualizado correctamente.", data: message });
    } catch (error) {
        console.error("❌ Error al actualizar estado del mensaje:", error.message);
        res.status(500).json({ error: `Error interno: ${error.message}` });
    }
};

// 🔹 Eliminar un mensaje
const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const userRole = req.user.role; // 🚀 Verifica el rol del usuario

        // 🔹 Buscar el mensaje en la base de datos
        const message = await Message.findByPk(id);
        if (!message) {
            return res.status(404).json({ error: "❌ Mensaje no encontrado." });
        }

        // 🔹 Permitir que el administrador elimine cualquier mensaje
        if (userRole !== "admin" && userRole !== "superadmin" && req.user.id !== message.senderId && req.user.id !== message.receiverId) {
            return res.status(403).json({ error: "❌ No tienes permiso para eliminar este mensaje." });
        }

        // 🔹 Eliminar el mensaje
        await message.destroy();

        res.status(200).json({ message: "✅ Mensaje eliminado correctamente." });
    } catch (error) {
        console.error("❌ Error al eliminar mensaje:", error.message);
        res.status(500).json({ error: `Error interno: ${error.message}` });
    }
};

// 🔹 Eliminar todos los mensajes
const deleteAllMessages = async (req, res) => {
    try {
        // 🔹 Verificar que el usuario es admin o superadmin
        if (req.user.role !== "admin" && req.user.role !== "superadmin") {
            return res.status(403).json({ error: "❌ No tienes permiso para eliminar todos los mensajes." });
        }

        // 🔹 Eliminar TODOS los mensajes
        await Message.destroy({ where: {} });

        res.status(200).json({ message: "✅ Todos los mensajes han sido eliminados correctamente." });
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
