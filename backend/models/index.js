'use strict';
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.js')[env];

const db = {};
let sequelize;

console.log('Configuración de Sequelize:', config);

try {
    if (config.use_env_variable) {
        sequelize = new Sequelize(process.env[config.use_env_variable], config);
    } else {
        if (!config.dialect) {
            throw new Error('El campo "dialect" no está definido en la configuración.');
        }
        sequelize = new Sequelize(config.database, config.username, config.password, config);
    }

    // Verificar conexión con la base de datos
    sequelize.authenticate()
        .then(() => console.log('Conexión a la base de datos establecida correctamente.'))
        .catch(error => console.error('Error al conectar con la base de datos:', error));

    // Cargar modelos dinámicamente
    fs.readdirSync(__dirname)
        .filter(file => file.indexOf('.') !== 0 && file !== basename && file.endsWith('.js')) // Filtrar solo archivos .js
        .forEach(file => {
            const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
            db[model.name] = model;
        });

    // Asignar `User` directamente si es necesario
    db.User = require('./user')(sequelize, Sequelize.DataTypes);

    // Configurar asociaciones si existen
    Object.keys(db).forEach(modelName => {
        if (db[modelName].associate) {
            db[modelName].associate(db);
        }
    });

} catch (error) {
    console.error('Error en la inicialización de Sequelize:', error);
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
