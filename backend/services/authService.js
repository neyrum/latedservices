require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../models");

// Generar token JWT
function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
}

// Verificar token JWT
function verifyToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        console.error("❌ Token inválido:", error);
        return null;
    }
}

// Autenticar usuario con correo y contraseña
async function authenticateUser(email, password) {
    try {
        const user = await User.findOne({ where: { email } });
        if (!user || !bcrypt.compareSync(password, user.password)) {
            throw new Error("Credenciales inválidas");
        }
        return generateToken(user);
    } catch (error) {
        console.error("❌ Error de autenticación:", error);
        throw error;
    }
}

// Hash de contraseña al crear usuario
async function hashPassword(password) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
}

module.exports = { generateToken, verifyToken, authenticateUser, hashPassword };
