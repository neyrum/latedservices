require("dotenv").config();
const nodemailer = require("nodemailer");

// Configurar el transporte de correo
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === "true", 
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
       rejectUnauthorized: false
    }
});

// Función para enviar correos
async function sendMail(to, subject, text) {
    try {
        const mailOptions = {
            from: `"Plataforma UNAH" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Correo enviado a ${to}: ${info.response}`);
        return info;
    } catch (error) {
        console.error(`❌ Error al enviar correo a ${to}:`, error);
        throw error;
    }
}

module.exports = { sendMail };
