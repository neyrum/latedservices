const { Op } = require('sequelize');
const { authenticate, getUserDetails } = require("../services/ldapService");
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');


// 🔹 Autenticar usuario con LDAP
async function loginLDAP(req, res) {
  try {
      const { username, password } = req.body;

      // Validar entrada
      if (!username || !password) {
          console.error("❌ Faltan credenciales:", username, password);
          return res.status(400).json({ error: "Usuario y contraseña son obligatorios" });
      }

      console.log("🔍 Intentando autenticación LDAP para:", username);

      // Autenticación con LDAP
      const result = await authenticate(username, password);

      console.log("✅ Autenticación LDAP exitosa para:", username);

      // Generar token JWT después de autenticación LDAP
      const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "1h" });

      res.status(200).json({ message: result.message, token });
  } catch (error) {
      console.error("❌ Error en autenticación LDAP:", error);
      res.status(401).json({ error: error.message || "Autenticación fallida" });
  }
}

// 🔹 Obtener detalles del usuario LDAP
async function getProfile(req, res) {
  try {
      const username = req.user.username; // **Obtenemos username desde el token JWT**
      console.log("🔍 Buscando detalles de usuario LDAP para:", username);

      const userDetails = await getUserDetails(username);

      res.status(200).json(userDetails);
  } catch (error) {
      console.error("❌ Error al obtener perfil LDAP:", error);
      res.status(500).json({ error: "No se pudo obtener datos del usuario" });
  }
}



// Registrar un nuevo usuario
const register = async (req, res) => {
  try {
    const { name, apellidos, email, password, phone, } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
 
    // Crear el usuario
    const newUser = await User.create({ 
      name, 
      apellidos,
      email, 
      password: hashedPassword,
      phone: phone ? phone.trim() : null,
      status: 'activo', // Por defecto, los usuarios se crean como activos
    });

    res.status(201).json({ 
      message: 'Usuario registrado exitosamente', 
      user: {
        id: newUser.id,
        name: newUser.name,
        apellidos: newUser.apellidos,
        email: newUser.email, 
        phone: newUser.phone,
        role: newUser.role,
        status: newUser.status,
      },
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
};

// Iniciar sesión
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar si el usuario existe
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar si el usuario está activo
    if (user.status !== 'activo') {
      return res.status(403).json({ message: 'Usuario inactivo. Contacta al administrador.' });
    }

    // Verificar la contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Generar un token JWT que incluya el rol del usuario
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role }, // Incluye el rol en el token
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ message: 'Inicio de sesión exitoso', token });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
};

// Solicitar restablecimiento de contraseña
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Verificar si el usuario existe
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Generar un token único
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Establecer el token y la fecha de expiración (1 hora)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
    await user.save();

    // Configurar el transporte de correo
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_USE_SSL === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Verificar conexión SMTP al iniciar la aplicación
    transporter.verify((error, success) => {
      if (error) {
        console.error("❌ Error en la configuración SMTP:", error);
      } else {
        console.log("✅ Servidor SMTP listo para enviar correos.");
      }
    });

    // Enviar el correo con el enlace de restablecimiento
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: `"Lated Services" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Restablecimiento de contraseña',
      text: `Haz clic en el siguiente enlace para restablecer tu contraseña: ${resetUrl}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Correo de restablecimiento enviado' });
  } catch (error) {
    console.error('Error al solicitar restablecimiento de contraseña:', error);
    res.status(500).json({ message: 'Error al solicitar restablecimiento de contraseña' });
  }
};

// Restablecer la contraseña de un usuario
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Buscar al usuario por el token y verificar si está vigente
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() }, // El token no debe haber expirado
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'Token inválido o expirado' });
    }

    // Validar la nueva contraseña
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    }

    // Encriptar la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña y limpiar el token
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ message: 'Contraseña restablecida exitosamente' });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    res.status(500).json({ message: 'Error al restablecer contraseña' });
  }
};

// Restablecer la contraseña de un usuario (por administrador)
const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    // Validar que se haya proporcionado una nueva contraseña
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    }

    // Buscar al usuario por ID
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Encriptar la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña del usuario
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Contraseña restablecida exitosamente' });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    res.status(500).json({ message: 'Error al restablecer contraseña' });
  }
};

module.exports = { register, login, loginLDAP, requestPasswordReset, resetPassword, resetUserPassword, getProfile };