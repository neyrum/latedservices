const { Notification, User } = require("../models");
const { sendMail } = require("../services/emailService");

// Obtener las notificaciones de un usuario
const getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { userId: req.user.id },
            order: [["createdAt", "DESC"]],
        });
        res.json(notifications);
    } catch (error) {
        console.error("❌ Error obteniendo notificaciones:", error);
        res.status(500).json({ error: "Error obteniendo las notificaciones" });
    }
};

// Marcar una notificación como leída y eliminarla
const markAsReadAndDelete = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByPk(id);

        if (!notification) {
            return res.status(404).json({ error: "Notificación no encontrada" });
        }

        await notification.destroy();
        res.json({ success: true, message: "Notificación marcada como leída y eliminada correctamente" });
    } catch (error) {
        console.error("❌ Error al marcar como leído y eliminar:", error);
        res.status(500).json({ error: "Error al procesar la notificación" });
    }
};

// Enviar una notificación
const sendNotification = async (req, res) => {
    try {
        const { userId, message } = req.body;
        if (!userId || !message) {
            return res.status(400).json({ error: "Faltan datos requeridos" });
        }

        const user = await User.findByPk(userId);
        if (!user || !user.email) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const newNotification = await Notification.create({ userId, message });
        
        // Emitir evento en tiempo real a los clientes conectados
        req.app.get("io").emit(`notification-${userId}`, newNotification);

        await sendMail(user.email, "Nueva Notificación", message);

        res.json({ success: true, message: "Notificación enviada correctamente", data: newNotification });
    } catch (error) {
        console.error("❌ Error al enviar la notificación:", error);
        res.status(500).json({ error: "Error al enviar la notificación" });
    }
};

module.exports = { getUserNotifications, markAsReadAndDelete, sendNotification };
