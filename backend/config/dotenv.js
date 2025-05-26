const dotenv = require("dotenv");
const path = require("path");

// Cargar variables del entorno desde el archivo .env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

module.exports = process.env;
