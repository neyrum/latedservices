require("dotenv").config();
const nodemailer = require("nodemailer");

// Configurar el transporte de correo
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_USE_SSL, 
    auth: {
        user: process.env.EMAIL_HOST_USER,
        pass: process.env.EMAIL_HOST_PASSWORD
    },
    tls: {
       rejectUnauthorized: false
    }
});

// Función para enviar correos
async function sendMail(to, subject, text) {
    try {
        const mailOptions = {
            from: `"Plataforma LATED SERVICES" <${process.env.EMAIL_HOST_USER}>`,
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
