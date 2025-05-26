const { Notification } = require("../models");
const { User } = require("../models");
const nodemailer = require("nodemailer");

// Obtener las notificaciones de un usuario
const getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll({ where: { userId: req.user.id } });
        res.json(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error obteniendo las notificaciones" });
    }
};

// Marcar una notificación como leída
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByPk(req.params.id);
        if (!notification) return res.status(404).json({ error: "Notificación no encontrada" });

        await notification.update({ status: "read" });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al marcar como leído" });
    }
};

// Enviar una notificación
const sendNotification = async (req, res) => {
    try {
        const { userId, message } = req.body;
        await Notification.create({ userId, message });

        // Obtener email del usuario
        const user = await User.findByPk(userId);
        if (!user || !user.email) return res.status(404).json({ error: "Usuario no encontrado" });

        await nodemailer.createTransport({ service: "Gmail", auth: { user: "tu-email@gmail.com", pass: "tu-password" } })
            .sendMail({ from: '"Plataforma"', to: user.email, subject: "Nueva Notificación", text: message });

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al enviar la notificación" });
    }
};


module.exports = { getUserNotifications, markAsRead, sendNotification };
