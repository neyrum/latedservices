require("dotenv").config();
const { Sequelize } = require("sequelize");

// Configurar la conexión con variables de entorno
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || "postgres", // Cambia según tu base de datos
    logging: false, // Desactiva logs para producción
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

// Verificar conexión a la base de datos
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log("✅ Conexión a la base de datos exitosa.");
    } catch (error) {
        console.error("❌ Error al conectar con la base de datos:", error);
    }
}

testConnection();

module.exports = sequelize;
