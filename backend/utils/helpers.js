 const bcrypt = require("bcrypt");

/**
 * Función para encriptar contraseñas antes de guardarlas en la base de datos
 * @param {string} password - Contraseña en texto plano
 * @returns {Promise<string>} Contraseña encriptada
 */
async function hashPassword(password) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
}

/**
 * Función para comparar una contraseña en texto plano con su versión encriptada
 * @param {string} password - Contraseña en texto plano
 * @param {string} hashedPassword - Contraseña encriptada
 * @returns {Promise<boolean>} True si la contraseña es correcta, false si no
 */
async function verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
}

/**
 * Función para generar un código aleatorio (por ejemplo, para recuperación de contraseña)
 * @param {number} length - Longitud del código
 * @returns {string} Código generado
 */
function generateRandomCode(length = 6) {
    return Math.random().toString(36).substr(2, length).toUpperCase();
}

/**
 * Función para validar direcciones de correo electrónico
 * @param {string} email - Email a validar
 * @returns {boolean} True si el email es válido, false si no
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

module.exports = { hashPassword, verifyPassword, generateRandomCode, isValidEmail };
